import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { GoalPeriod, GoalStatus } from "@prisma/client";
import { logger } from "../../../lib/logger";

// Helper function to calculate deadline based on period
const calculateDeadline = (period: string): Date => {
  const now = new Date();

  switch (period) {
    case "DAILY":
      // End of today
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59
      );

    case "WEEKLY":
      // End of this Sunday
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
      // End of this month
      return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    case "QUARTERLY":
      // End of current quarter
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const quarterEndMonth = (currentQuarter + 1) * 3;
      return new Date(now.getFullYear(), quarterEndMonth, 0, 23, 59, 59);

    case "YEARLY":
      // End of this year
      return new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    default:
      throw new Error("Invalid period");
  }
};

// GET /api/goals - List user's goals
export const GET = async (req: NextRequest) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // Optional filter by status
    const period = searchParams.get("period"); // Optional filter by period

    const goals = await prisma.goal.findMany({
      where: {
        userId: currentUser.id,
        ...(status && { status: status as unknown as GoalStatus }),
        ...(period && { period: period as unknown as GoalPeriod }),
      },
      orderBy: [
        { status: "asc" }, // ACTIVE first
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ goals }, { status: 200 });
  } catch (error) {
    logger.error({ err: error }, "Goals fetch error");
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
};

// POST /api/goals - Create new goal
export const POST = async (req: NextRequest) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, period } = await req.json();

    // Validation
    if (!title || !period) {
      return NextResponse.json(
        { error: "Title and period are required" },
        { status: 400 }
      );
    }

    if (
      !["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"].includes(period)
    ) {
      return NextResponse.json({ error: "Invalid period" }, { status: 400 });
    }

    // Check if user already has an ACTIVE goal for this period
    const existingGoal = await prisma.goal.findFirst({
      where: {
        userId: currentUser.id,
        period: period,
        status: "ACTIVE",
      },
    });

    if (existingGoal) {
      return NextResponse.json(
        {
          error: `You already have an active ${period.toLowerCase()} goal. Complete or abandon it first.`,
        },
        { status: 400 }
      );
    }

    // Calculate deadline
    const deadline = calculateDeadline(period);

    // Create goal
    const goal = await prisma.goal.create({
      data: {
        userId: currentUser.id,
        title,
        period,
        deadline,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    logger.error({ err: error }, "Goal creation error");
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
};
