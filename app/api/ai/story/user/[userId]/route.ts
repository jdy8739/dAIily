import { NextRequest } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) => {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period");

    if (!period) {
      return new Response(JSON.stringify({ error: "Period is required" }), {
        status: 400,
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
    console.error("Story fetch error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch story" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
