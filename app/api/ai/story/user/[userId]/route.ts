import { NextRequest } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../../lib/auth";
import { logger } from "../../../../../../lib/logger";
import { sanitizePeriod } from "../../../../../../lib/sanitize";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) => {
  try {
    // Require authentication to view any profile
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized - Please log in to view profiles",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { userId } = await params;
    const { searchParams } = new URL(req.url);
    const rawPeriod = searchParams.get("period");

    // Validate and sanitize period parameter
    const period = sanitizePeriod(rawPeriod);

    if (!period) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid period. Must be one of: daily, weekly, monthly, yearly, all",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch the story for this user and period
    const story = await prisma.story.findUnique({
      where: {
        userId_period: {
          userId: userId,
          period: period,
        },
      },
    });

    if (!story) {
      return new Response(JSON.stringify({ story: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        story: {
          content: story.content,
          createdAt: story.createdAt,
          updatedAt: story.updatedAt,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    logger.error(
      { err: error, userId: (await params).userId },
      "Public story fetch error"
    );
    return new Response(JSON.stringify({ error: "Failed to fetch story" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
