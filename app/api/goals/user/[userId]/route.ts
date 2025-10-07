import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

// GET /api/goals/user/[userId] - Get user's active goals (public)
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) => {
  try {
    const { userId } = await params;

    const goals = await prisma.goal.findMany({
      where: {
        userId: userId,
        status: "ACTIVE",
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
    console.error("Goals fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
};
