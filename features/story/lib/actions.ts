"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import OpenAI from "openai";
import { env } from "@/lib/env";
import {
  sanitizeContent,
  sanitizeGoalTitle,
  sanitizePeriod,
} from "@/lib/sanitize";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

type GoalSelect = {
  id: string;
  title: string;
  period: string;
  startDate: Date;
  deadline: Date;
  status: string;
};

type Story = {
  content: string;
  createdAt: Date;
  updatedAt: Date;
} | null;

// Fetch goals for a specific user (requires authentication)
const getUserGoals = async (
  userId: string
): Promise<{ goals: GoalSelect[] } | { error: string }> => {
  try {
    // Require authentication to view any profile
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { error: "Unauthorized - Please log in to view profiles" };
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return { error: "User not found" };
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

    return { goals };
  } catch (error) {
    console.error("Goals fetch error:", error);
    return { error: "Failed to fetch goals" };
  }
};

// Fetch story for a specific user and period (public)
const getUserStory = async (
  userId: string,
  rawPeriod: string
): Promise<{ story: Story } | { error: string }> => {
  try {
    // Validate and sanitize period parameter
    const period = sanitizePeriod(rawPeriod);

    if (!period) {
      return {
        error: "Invalid period. Must be one of: daily, weekly, monthly, yearly, all",
      };
    }

    const story = await prisma.story.findUnique({
      where: {
        userId_period: {
          userId: userId,
          period: period,
        },
      },
      select: {
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { story: story || null };
  } catch (error) {
    console.error("Story fetch error:", error);
    return { error: "Failed to fetch story" };
  }
};

// Get cached story for authenticated user
const getCachedStory = async (
  rawPeriod: string
): Promise<{ story: Story } | { error: string }> => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { error: "Unauthorized" };
    }

    // Validate and sanitize period parameter
    const period = sanitizePeriod(rawPeriod);

    if (!period) {
      return {
        error: "Invalid period. Must be one of: daily, weekly, monthly, yearly, all",
      };
    }

    const story = await prisma.story.findUnique({
      where: {
        userId_period: {
          userId: currentUser.id,
          period: period,
        },
      },
      select: {
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { story: story || null };
  } catch (error) {
    console.error("Story fetch error:", error);
    return { error: "Failed to fetch story" };
  }
};

// Generate story for authenticated user (streaming not supported in Server Actions)
// Returns the complete story after generation
const generateStory = async (
  rawPeriod: string,
  csrfToken?: string
): Promise<
  | { success: true; content: string; updatedAt: Date }
  | { success: false; error: string }
> => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate and sanitize period parameter
    const period = sanitizePeriod(rawPeriod);

    if (!period) {
      return {
        success: false,
        error: "Invalid period. Must be one of: daily, weekly, monthly, yearly, all",
      };
    }

    // CSRF Protection - validate token
    const { validateCsrf } = await import("@/lib/csrf-middleware");
    if (!validateCsrf(csrfToken)) {
      return { success: false, error: "Invalid CSRF token" };
    }

    // Rate Limiting - Atomic check and increment (prevents race conditions)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // First, get current user state to determine if we need to reset
    const currentUser_state = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        dailyGenerationCount: true,
        lastGenerationDate: true,
      },
    });

    if (!currentUser_state) {
      return { success: false, error: "User not found" };
    }

    // Determine if we need to reset the count (new day)
    const lastGenDate = currentUser_state.lastGenerationDate
      ? new Date(
          currentUser_state.lastGenerationDate.getFullYear(),
          currentUser_state.lastGenerationDate.getMonth(),
          currentUser_state.lastGenerationDate.getDate()
        )
      : null;

    const isNewDay = !lastGenDate || lastGenDate.getTime() !== today.getTime();

    // Atomic operation: Update only if count is below limit
    // This prevents race conditions by doing check and increment in one operation
    const updateResult = await prisma.user.updateMany({
      where: {
        id: currentUser.id,
        ...(isNewDay
          ? {} // If new day, no count check needed (will be reset)
          : { dailyGenerationCount: { lt: 10 } }), // Same day: only update if count < 10
      },
      data: {
        dailyGenerationCount: isNewDay ? 1 : { increment: 1 },
        lastGenerationDate: now,
      },
    });

    // If no rows were updated, the limit was exceeded
    if (updateResult.count === 0) {
      return {
        success: false,
        error: "RATE_LIMIT_EXCEEDED",
      };
    }

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
      return { success: false, error: "User not found" };
    }

    // Calculate date range based on period
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

    // If no posts, return early
    if (posts.length === 0) {
      return { success: false, error: "NO_POSTS" };
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
            .map((p, i) =>
              `
Post ${i + 1} (${new Date(p.createdAt).toLocaleDateString()}):
Title: ${sanitizeContent(p.title, 200)}
Content: ${sanitizeContent(p.content, 2000)}
`.trim()
            )
            .join("\n\n")
        : "No posts in this period.";

    const goalsContext =
      activeGoals.length > 0
        ? activeGoals
            .map(g =>
              `
- ${g.period} Goal: "${sanitizeGoalTitle(g.title)}"
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

    // Generate story (non-streaming)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `당신은 데이터 기반 커리어 코치입니다. 사용자의 활동을 분석하세요.

**엄격한 요구사항:**
- 총 길이: 최대 150-200 단어
- 글머리 기호만 사용, 항목당 한 줄
- 구체적 수치로 근거 제시
- 솔직하고 직설적

**필수 구조 (목표가 있는 경우):**

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

**필수 구조 (목표가 없는 경우):**

## 🏆 주요 활동
- 구체적 활동 2-3개만
- 게시물에서 직접 인용

## 💡 다음 스텝
- 목표 설정 추천 (1줄)
- 실행 가능한 행동 1-2개

**중요:**
- "No active goals set." 메시지를 받으면 목표 관련 섹션을 절대 포함하지 말 것
- 목표가 없으면 활동 중심으로만 분석
- 목표가 없다고 명시적으로 언급하지 말 것, 자연스럽게 활동에 집중

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
      temperature: 0.7,
      max_tokens: 300,
    });

    const content = completion.choices[0]?.message?.content || "";

    if (!content) {
      return { success: false, error: "Failed to generate story" };
    }

    // Save story to database
    const story = await prisma.story.upsert({
      where: {
        userId_period: {
          userId: currentUser.id,
          period: period,
        },
      },
      update: {
        content: content,
      },
      create: {
        userId: currentUser.id,
        period: period,
        content: content,
      },
    });

    return {
      success: true,
      content: story.content,
      updatedAt: story.updatedAt,
    };
  } catch (error) {
    console.error("Story generation error:", error);
    return { success: false, error: "Failed to generate story" };
  }
};

export { getUserGoals, getUserStory, getCachedStory, generateStory };
