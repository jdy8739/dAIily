import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getCurrentUser } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { env } from "../../../../lib/env";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const GET = async (req: NextRequest) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period");

    if (!period) {
      return new Response(JSON.stringify({ error: "Period is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const story = await prisma.story.findUnique({
      where: {
        userId_period: {
          userId: currentUser.id,
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
    return new Response(
      JSON.stringify({ error: "Failed to fetch story" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { period } = await req.json();

    // Fetch user profile and posts
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        name: true,
        currentRole: true,
        industry: true,
        experienceLevel: true,
        yearsOfExperience: true,
        currentSkills: true,
        targetSkills: true,
        currentGoals: true,
        createdAt: true,
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "daily":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        break;
      case "weekly":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "monthly":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "yearly":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case "all":
      default:
        startDate = user.createdAt;
    }

    // Fetch posts in period
    const posts = await prisma.post.findMany({
      where: {
        authorId: currentUser.id,
        status: "PUBLISHED",
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        title: true,
        content: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // If no posts, return early without calling OpenAI
    if (posts.length === 0) {
      return new Response(
        JSON.stringify({
          error: "NO_POSTS",
          message: "No posts found in this period",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Build context for AI
    const profileContext = `
Profile:
- Name: ${user.name}
- Role: ${user.currentRole || "Not specified"}
- Industry: ${user.industry || "Not specified"}
- Experience Level: ${user.experienceLevel || "Not specified"}
- Years of Experience: ${user.yearsOfExperience || "Not specified"}
- Current Skills: ${user.currentSkills?.join(", ") || "Not specified"}
- Target Skills: ${user.targetSkills?.join(", ") || "Not specified"}
- Current Goals: ${user.currentGoals?.join(", ") || "Not specified"}
`.trim();

    const postsContext =
      posts.length > 0
        ? posts
            .map(
              (p, i) => `
Post ${i + 1} (${new Date(p.createdAt).toLocaleDateString()}):
Title: ${p.title}
Content: ${p.content}
`.trim()
            )
            .join("\n\n")
        : "No posts in this period.";

    const periodLabel =
      period === "all"
        ? "entire journey"
        : `${period.replace("ly", "")} period`;

    // Generate story with streaming
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `당신은 커리어 코치입니다. 마크다운으로 간결한 성장 요약을 작성하세요. 짧고 명확하게 유지하세요.

**엄격한 요구사항:**
- 총 길이: 최대 200-300 단어
- 글머리 기호만 사용 (문단 없음)
- 섹션당 최대 3-4개 항목
- 항목당 한 줄

**구조:**

## 📊 현재 상태
- 역할 & 집중 분야 (1줄)
- 경력 수준 (1줄)

## ✅ 성과 (게시물 기반)
- 구체적인 성과 3개만

## 🎯 목표 진행상황
- ✅ 진행중 (1-2개)
- ⏳ 대기중 (1-2개)

## 🚀 다음 단계
- 실행 가능한 항목 3개

**스타일:** 직접적, 구체적, 이모지 아이콘, 군더더기 없이.`,
        },
        {
          role: "user",
          content: `이 전문가의 ${periodLabel} 분석하고 성장 스토리를 생성하세요:

${profileContext}

이 기간의 게시물:
${postsContext}

**중요: 반드시 한국어로 응답하세요.**`,
        },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 400,
    });

    // Create streaming response and accumulate content
    const encoder = new TextEncoder();
    let accumulatedContent = "";

    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              accumulatedContent += content;
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();

          // Save story to database after streaming completes
          await prisma.story.upsert({
            where: {
              userId_period: {
                userId: currentUser.id,
                period: period,
              },
            },
            update: {
              content: accumulatedContent,
            },
            create: {
              userId: currentUser.id,
              period: period,
              content: accumulatedContent,
            },
          });
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(customStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Story generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate story" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
