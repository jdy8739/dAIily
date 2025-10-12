"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { GoalPeriod, GoalStatus, Goal as PrismaGoal } from "@prisma/client";
import { logger } from "@/lib/logger";

type Goal = PrismaGoal;

// Helper function to calculate deadline based on period
const calculateDeadline = (period: string): Date => {
  const now = new Date();

  switch (period) {
    case "DAILY":
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59
      );
    case "WEEKLY":
      const daysUntilSunday = 7 - now.getDay();
      const sunday = new Date(now);
      sunday.setDate(now.getDate() + daysUntilSunday);
      return new Date(
        sunday.getFullYear(),
        sunday.getMonth(),
        sunday.getDate(),
        23,
        59,
        59
      );
    case "MONTHLY":
      return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    case "QUARTERLY":
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const quarterEndMonth = (currentQuarter + 1) * 3;
      return new Date(now.getFullYear(), quarterEndMonth, 0, 23, 59, 59);
    case "YEARLY":
      return new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    default:
      throw new Error("Invalid period");
  }
};

// Fetch goals for authenticated user
const getGoals = async (
  status?: string,
  period?: string
): Promise<{ goals: Goal[] } | { error: string }> => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { error: "Unauthorized" };
    }

    const goals = await prisma.goal.findMany({
      where: {
        userId: currentUser.id,
        ...(status && { status: status as GoalStatus }),
        ...(period && { period: period as GoalPeriod }),
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    return { goals };
  } catch (error) {
    logger.error({ err: error }, "Goals fetch error");
    return { error: "Failed to fetch goals" };
  }
};

// Create a new goal
const createGoal = async (
  title: string,
  period: string
): Promise<
  { success: true; goal: Goal } | { success: false; error: string }
> => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    if (!title || !period) {
      return { success: false, error: "Title and period are required" };
    }

    if (
      !["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"].includes(period)
    ) {
      return { success: false, error: "Invalid period" };
    }

    // Calculate deadline
    const deadline = calculateDeadline(period);

    // Create goal
    const goal = await prisma.goal.create({
      data: {
        userId: currentUser.id,
        title,
        period: period as GoalPeriod,
        deadline,
        status: GoalStatus.ACTIVE,
      },
    });

    revalidatePath("/goals");
    revalidatePath("/feed");

    return { success: true, goal };
  } catch (error) {
    logger.error({ err: error, title, period }, "Goal creation error");
    return { success: false, error: "Failed to create goal" };
  }
};

// Update a goal (title or status)
const updateGoal = async (
  id: string,
  updates: { title?: string; status?: string }
): Promise<
  { success: true; goal: Goal } | { success: false; error: string }
> => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    // Check goal exists and belongs to user
    const goal = await prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      return { success: false, error: "Goal not found" };
    }

    if (goal.userId !== currentUser.id) {
      return { success: false, error: "Forbidden" };
    }

    // Check if update is allowed based on current status
    if (goal.status === GoalStatus.COMPLETED && !updates.status) {
      return { success: false, error: "Cannot edit completed goals" };
    }

    // Build update data
    const updateData: Partial<Goal> = {};

    if (updates.status) {
      // ACTIVE goals can be marked as COMPLETED
      if (goal.status === GoalStatus.ACTIVE) {
        if (updates.status !== GoalStatus.COMPLETED) {
          return {
            success: false,
            error: "Status must be COMPLETED",
          };
        }
        updateData.status = updates.status as GoalStatus;
        updateData.completedAt = new Date();
      }
      // COMPLETED goals can be marked as ACTIVE (reactivate)
      else if (goal.status === GoalStatus.COMPLETED) {
        if (updates.status !== GoalStatus.ACTIVE) {
          return {
            success: false,
            error: "Completed goals can only be reactivated",
          };
        }

        updateData.status = updates.status as GoalStatus;
        // Clear completedAt when reverting to ACTIVE
        updateData.completedAt = null;
      }
    }

    if (updates.title !== undefined) {
      // Only allow title updates for ACTIVE goals
      if (goal.status !== GoalStatus.ACTIVE) {
        return { success: false, error: "Can only edit title of active goals" };
      }
      if (!updates.title.trim()) {
        return { success: false, error: "Title cannot be empty" };
      }
      updateData.title = updates.title.trim();
    }

    // Update goal
    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/goals");
    revalidatePath("/feed");

    return { success: true, goal: updatedGoal };
  } catch (error) {
    logger.error({ err: error, goalId: id }, "Goal update error");
    return { success: false, error: "Failed to update goal" };
  }
};

// Delete a goal
const deleteGoal = async (
  id: string,
  csrfToken?: string
): Promise<{ success: true } | { success: false; error: string }> => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    // CSRF Protection
    const { validateCsrf } = await import("@/lib/csrf-middleware");
    if (!validateCsrf(csrfToken)) {
      return { success: false, error: "Invalid CSRF token" };
    }

    // Check goal exists and belongs to user
    const goal = await prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      return { success: false, error: "Goal not found" };
    }

    if (goal.userId !== currentUser.id) {
      return { success: false, error: "Forbidden" };
    }

    // Delete goal
    await prisma.goal.delete({
      where: { id },
    });

    revalidatePath("/goals");
    revalidatePath("/feed");

    return { success: true };
  } catch (error) {
    logger.error({ err: error, goalId: id }, "Goal deletion error");
    return { success: false, error: "Failed to delete goal" };
  }
};

export { getGoals, createGoal, updateGoal, deleteGoal };
