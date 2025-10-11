import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../lib/auth";
import { logger } from "../../../../../lib/logger";

// GET /api/goals/user/[userId] - Get user's goals (requires authentication)
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) => {
  try {
    // Require authentication to view any profile
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in to view profiles" },
        { status: 401 }
      );
    }

    const { userId } = await params;

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Determine what goals to show based on ownership
    const isOwnProfile = currentUser.id === userId;

    const goals = await prisma.goal.findMany({
      where: {
        userId: userId,
        // Privacy: Show all goals to owner, only COMPLETED goals to others
        // (ACTIVE goals are private planning, not for public viewing)
        ...(isOwnProfile ? {} : { status: "COMPLETED" }),
      },
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        period: true,
        startDate: true,
        deadline: true,
        status: true,
      },
    });

    return NextResponse.json({ goals }, { status: 200 });
  } catch (error) {
    logger.error(
      { err: error, userId: (await params).userId },
      "Public goals fetch error"
    );
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
};
