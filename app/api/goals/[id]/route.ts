import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

// PATCH /api/goals/[id] - Update goal (status or title)
export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, title } = body;

    const { id } = await params;

    // Check goal exists and belongs to user
    const goal = await prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    if (goal.userId !== currentUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (goal.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Can only update ACTIVE goals" },
        { status: 400 }
      );
    }

    // Build update data based on what's provided
    const updateData: Record<string, unknown> = {};

    if (status) {
      // Status update (complete or reactivate)
      if (!["COMPLETED", "ACTIVE"].includes(status)) {
        return NextResponse.json(
          { error: "Status must be COMPLETED or ACTIVE" },
          { status: 400 }
        );
      }
      updateData.status = status;
      // Set completedAt when marking as COMPLETED
      if (status === "COMPLETED") {
        updateData.completedAt = new Date();
      }
      // Clear completedAt when reactivating
      if (status === "ACTIVE") {
        updateData.completedAt = null;
      }
    }

    if (title !== undefined) {
      // Title update (edit)
      if (!title.trim()) {
        return NextResponse.json(
          { error: "Title cannot be empty" },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }

    // Update goal
    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ goal: updatedGoal }, { status: 200 });
  } catch (error) {
    console.error("Goal update error:", error);
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
};

// DELETE /api/goals/[id] - Delete goal
export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check goal exists and belongs to user
    const goal = await prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    if (goal.userId !== currentUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete goal
    await prisma.goal.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Goal deleted" }, { status: 200 });
  } catch (error) {
    console.error("Goal deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 }
    );
  }
};
