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

    // Fetch active goals
    const activeGoals = await prisma.goal.findMany({
      where: {
        userId: currentUser.id,
        status: "ACTIVE",
      },
      select: {
        title: true,
        period: true,
        startDate: true,
        deadline: true,
      },
      orderBy: {
        startDate: "desc",
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

    const goalsContext =
      activeGoals.length > 0
        ? activeGoals
            .map(
              (g) => `
- ${g.period} Goal: "${g.title}"
  Started: ${new Date(g.startDate).toLocaleDateString()}
  Deadline: ${new Date(g.deadline).toLocaleDateString()}
`.trim()
            )
            .join("\n")
        : "No active goals set.";

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
          content: `당신은 데이터 기반 커리어 코치입니다. 사용자의 목표와 실제 활동을 비교 분석하세요.

**핵심 임무:**
사용자가 "말한 목표"와 "실제 한 일"의 차이를 명확히 보여주기

**엄격한 요구사항:**
- 총 길이: 최대 150-200 단어
- 글머리 기호만 사용, 항목당 한 줄
- 구체적 수치로 근거 제시
- 솔직하고 직설적

**필수 구조:**

## 🎯 목표 vs 현실
- [목표명]: [게시물 수]개 활동 - [평가]
(목표당 1줄, 최대 3개 목표만)

## 🏆 주요 성과
- 구체적 결과물 2개만
- 게시물에서 직접 인용

## ⚠️ 격차
- 부족한 부분 1-2개만 핵심만

## 💡 다음 행동
- 실행 가능한 행동 2개만

**톤:** 친절하지만 솔직. 칭찬보다 개선점. 짧고 명확하게.`,
        },
        {
          role: "user",
          content: `이 전문가의 ${periodLabel} 분석하고 성장 스토리를 생성하세요:

${profileContext}

현재 활성 목표:
${goalsContext}

이 기간의 게시물:
${postsContext}

**중요: 각 목표와 연관된 게시물 개수를 세고, 목표 달성 여부를 분석하세요.**
**중요: 반드시 한국어로 응답하세요.**`,
        },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 300,
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
