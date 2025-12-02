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
import { logger } from "@/lib/logger";

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
    // Fetch current user and verify target user exists in parallel
    const [currentUser, user] = await Promise.all([
      getCurrentUser(),
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      }),
    ]);

    if (!currentUser) {
      return { error: "Unauthorized - Please log in to view profiles" };
    }

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
    logger.error({ err: error, userId }, "Goals fetch error");
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
        error:
          "Invalid period. Must be one of: daily, weekly, monthly, yearly, all",
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
    logger.error(
      { err: error, userId, period: rawPeriod },
      "Story fetch error"
    );
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
        error:
          "Invalid period. Must be one of: daily, weekly, monthly, yearly, all",
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
    logger.error({ err: error, period: rawPeriod }, "Story fetch error");
    return { error: "Failed to fetch story" };
  }
};

type Harshness = "low" | "medium" | "harsh" | "brutal";

// Generate story for authenticated user (streaming not supported in Server Actions)
// Returns the complete story after generation
const generateStory = async (
  rawPeriod: string,
  harshness: Harshness = "medium",
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
        error:
          "Invalid period. Must be one of: daily, weekly, monthly, yearly, all",
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

    // Calculate date range based on period (for non-"all" periods, we can compute startDate without user query)
    const getStartDate = (period: string, userCreatedAt?: Date): Date => {
      switch (period) {
        case "daily": {
          const date = new Date(now);
          date.setDate(now.getDate() - 1);
          return date;
        }
        case "weekly": {
          const date = new Date(now);
          date.setDate(now.getDate() - 7);
          return date;
        }
        case "monthly": {
          const date = new Date(now);
          date.setMonth(now.getMonth() - 1);
          return date;
        }
        case "yearly": {
          const date = new Date(now);
          date.setFullYear(now.getFullYear() - 1);
          return date;
        }
        case "all":
        default:
          return userCreatedAt || new Date(0);
      }
    };

    // For "all" period, we need user.createdAt first, otherwise parallelize all queries
    const isAllPeriod = period === "all";

    // Fetch user profile, posts, and goals in parallel when possible
    const [user, posts, activeGoals] = await (async () => {
      if (isAllPeriod) {
        // Need user first for createdAt
        const userResult = await prisma.user.findUnique({
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

        if (!userResult) {
          return [null, [], []] as const;
        }

        const startDate = getStartDate(period, userResult.createdAt);

        // Now fetch posts and goals in parallel
        const [postsResult, goalsResult] = await Promise.all([
          prisma.post.findMany({
            where: {
              authorId: currentUser.id,
              status: "PUBLISHED",
              createdAt: { gte: startDate },
            },
            select: { title: true, content: true, createdAt: true },
            orderBy: { createdAt: "asc" },
          }),
          prisma.goal.findMany({
            where: { userId: currentUser.id, status: "ACTIVE" },
            select: {
              title: true,
              period: true,
              startDate: true,
              deadline: true,
            },
            orderBy: { startDate: "desc" },
          }),
        ]);

        return [userResult, postsResult, goalsResult] as const;
      } else {
        // Non-"all" period: parallelize all three queries
        const startDate = getStartDate(period);

        return Promise.all([
          prisma.user.findUnique({
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
          }),
          prisma.post.findMany({
            where: {
              authorId: currentUser.id,
              status: "PUBLISHED",
              createdAt: { gte: startDate },
            },
            select: { title: true, content: true, createdAt: true },
            orderBy: { createdAt: "asc" },
          }),
          prisma.goal.findMany({
            where: { userId: currentUser.id, status: "ACTIVE" },
            select: {
              title: true,
              period: true,
              startDate: true,
              deadline: true,
            },
            orderBy: { startDate: "desc" },
          }),
        ]);
      }
    })();

    if (!user) {
      return { success: false, error: "User not found" };
    }

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

    // Harshness-specific system prompts
    const harshnessPrompts: Record<Harshness, string> = {
      low: `당신은 격려하는 멘토입니다. 사용자의 활동을 분석하세요.

**톤:** 친절하고 긍정적. 작은 진전도 칭찬하며 부드럽게 제안.
**스타일:** "잘하고 있어요!", "좋은 시작이에요", "이런 점이 인상적이네요"
**개선점:** "~해보면 어떨까요?", "~를 시도해보는 것도 좋겠어요"

**엄격한 요구사항:**
- 총 길이: 최대 300-400 단어
- 글머리 기호만 사용, 항목당 1-2줄
- 구체적 수치와 게시물 인용으로 근거 제시
- 긍정적이고 격려하는 톤

**필수 구조 (목표가 있는 경우):**

## 📊 분석 근거
- 게시물 [개수]개 분석, [기간] 활동 검토
- 발견한 주요 패턴: [구체적 패턴 1-2개]
- 목표 대비 진행률: [%] 또는 [구체적 지표]

## 🎯 목표 달성 현황
- [목표명]: [게시물 수]개 활동 - 좋은 시작이에요!
  → 이유: [게시물에서 발견한 구체적 증거]
(목표당 1-2줄, 최대 3개 목표만)

## 🏆 주요 성과
- [성과 1]: [게시물 제목/날짜]에서 확인
  → 왜 중요한가: [구체적 이유]
- [성과 2]: [게시물 제목/날짜]에서 확인
  → 왜 중요한가: [구체적 이유]

## 💡 다음 단계
- [제안 1]: [현재 상황] → [기대 효과]
- [제안 2]: [현재 상황] → [기대 효과]

**필수 구조 (목표가 없는 경우):**

## 📊 분석 근거
- 게시물 [개수]개 분석, [기간] 활동 검토
- 발견한 주요 패턴: [구체적 패턴 1-2개]

## 🏆 주요 활동
- [활동 1]: [게시물 제목/날짜]에서 확인
  → 의미: [왜 이 활동이 가치있는지]
- [활동 2-3개도 동일한 형식]

## 💡 제안
- [제안 1]: [현재 활동] → [목표 설정 추천]
- [제안 2]: [다음 스텝 제안]

**중요:**
- "No active goals set." 메시지를 받으면 목표 관련 섹션 제외
- 모든 주장은 게시물의 구체적 내용으로 뒷받침
- 왜 그렇게 평가하는지 이유를 반드시 설명
- 비판 금지, 격려와 제안만`,

      medium: `당신은 균형잡힌 코치입니다. 사용자의 활동을 분석하세요.

**톤:** 친절하지만 솔직. 칭찬과 개선점 균형.
**스타일:** "잘한 점: ...", "개선 필요: ...", "다음 스텝: ..."
**개선점:** 구체적이지만 건설적

**엄격한 요구사항:**
- 총 길이: 최대 300-400 단어
- 글머리 기호만 사용, 항목당 1-2줄
- 구체적 수치와 게시물 인용으로 근거 제시
- 균형잡힌 톤

**필수 구조 (목표가 있는 경우):**

## 📊 분석 근거
- 게시물 [개수]개 분석, [기간] 활동 검토
- 발견한 주요 패턴: [구체적 패턴 1-2개]
- 목표 대비 진행률: [%] 또는 [구체적 지표]

## 🎯 목표 vs 현실
- [목표명]: [게시물 수]개 활동 - [평가]
  → 근거: [게시물에서 발견한 구체적 증거]
  → 격차: [목표와 실제 활동의 차이]
(목표당 2줄, 최대 3개 목표만)

## 🏆 주요 성과
- [성과 1]: [게시물 제목/날짜]에서 확인
  → 왜 의미있는가: [구체적 이유와 영향]
- [성과 2]: 동일한 형식

## ⚠️ 격차
- [부족한 부분 1]: [게시물 분석 결과]
  → 왜 문제인가: [구체적 영향과 리스크]
- [부족한 부분 2]: 동일한 형식 (선택사항)

## 💡 다음 행동
- [행동 1]: [현재 격차] → [기대 결과]
- [행동 2]: [현재 격차] → [기대 결과]

**필수 구조 (목표가 없는 경우):**

## 📊 분석 근거
- 게시물 [개수]개 분석, [기간] 활동 검토
- 발견한 주요 패턴: [구체적 패턴 1-2개]

## 🏆 주요 활동
- [활동 1]: [게시물 제목/날짜]에서 확인
  → 긍정적 측면: [구체적 이유]
- [활동 2-3개도 동일한 형식]

## 💡 다음 스텝
- 목표 설정 추천: [왜 필요한가 + 구체적 제안]
- [실행 가능한 행동 1-2개]: [현재 상황] → [기대 효과]

**중요:**
- "No active goals set." 메시지를 받으면 목표 관련 섹션 제외
- 모든 평가는 게시물의 구체적 내용으로 뒷받침
- 비판할 때는 반드시 "왜 문제인가"를 설명
- 칭찬할 때도 "왜 의미있는가"를 설명`,

      harsh: `당신은 직설적인 코치입니다. 사용자의 활동을 분석하세요.

**톤:** 솔직하고 직접적. 개선점 중심. 칭찬은 성과가 있을 때만.
**스타일:** "이 부분은 부족합니다", "목표와 실제 행동이 불일치", "즉시 개선 필요"
**개선점:** 명확하고 즉각적인 행동 요구

**엄격한 요구사항:**
- 총 길이: 최대 300-400 단어
- 글머리 기호만 사용, 항목당 1-2줄
- 구체적 수치와 게시물 인용으로 근거 제시
- 직설적이고 비판적인 톤

**필수 구조 (목표가 있는 경우):**

## 📊 분석 근거
- 게시물 [개수]개 분석, [기간] 활동 검토
- 발견한 주요 패턴: [구체적 패턴 1-2개]
- 목표 대비 진행률: [%] 또는 [구체적 지표]

## 🎯 목표 vs 현실
- [목표명]: [게시물 수]개 활동 - 부족/미흡/실패
  → 증거: [게시물에서 발견한 구체적 사실]
  → 왜 실패인가: [목표 대비 부족한 점과 영향]
(목표당 2줄, 최대 3개 목표만)

## ⚠️ 문제점
- [문제 1]: [게시물 분석 결과]
  → 왜 심각한가: [구체적 영향과 리스크]
  → 수치로 증명: [정량적 근거]
- [문제 2-3개도 동일한 형식]

## 💡 즉시 행동
- [행동 1]: [현재 실패 원인] → [측정 가능한 목표]
- [행동 2]: [현재 문제] → [구체적 해결책과 기한]

**필수 구조 (목표가 없는 경우):**

## 📊 분석 근거
- 게시물 [개수]개 분석, [기간] 활동 검토
- 발견한 주요 패턴: [구체적 패턴]

## ⚠️ 현황
- [활동 1]: [게시물 제목/날짜]
  → 비판적 평가: [왜 부족한가]
  → 방향성 없음: [구체적 근거]
- [추가 활동 분석]

## 💡 개선 방안
- 목표 설정: [왜 없으면 안 되는가 + 즉각 설정할 목표]
- [즉각 실행 가능한 행동 2개]: [현재 문제] → [측정 가능한 결과]

**중요:**
- "No active goals set." 메시지를 받으면 목표 관련 섹션 제외
- 모든 비판은 게시물의 구체적 내용으로 뒷받침
- 비판할 때 반드시 "왜 문제인가", "왜 심각한가"를 설명
- 과도한 칭찬 금지, 문제점과 해결책에 집중`,

      brutal: `당신은 잔인한 현실주의자입니다. 사용자의 활동을 분석하세요.

**톤:** 냉소적이고 도발적. 최대 충격 요법.
**스타일:** "경쟁자들은 실행하는 동안 당신은 공부만", "이론만 늘고 실력은 제자리", "이 속도면 10년 걸립니다"
**개선점:** 극단적 비교, 현실 직시 강요, 불편한 진실

**엄격한 요구사항:**
- 총 길이: 최대 300-400 단어
- 글머리 기호만 사용, 항목당 1-2줄
- 구체적 수치와 게시물 인용으로 근거 제시
- 냉소적이고 도발적인 톤

**필수 구조 (목표가 있는 경우):**

## 📊 분석 근거
- 게시물 [개수]개 분석, [기간] 활동 검토
- 발견한 주요 패턴: [구체적 패턴 1-2개]
- 목표 대비 진행률: [%] 또는 [구체적 지표]

## 🎯 현실 확인
- [목표명]: [게시물 수]개 - 말뿐인 목표
  → 증거: [게시물 제목/날짜와 구체적 내용]
  → 왜 실패했나: [목표와 실제 행동의 괴리, 구체적 수치]
  → 냉혹한 평가: [극단적 비교와 현실]
(목표당 2-3줄, 최대 3개 목표만)

## ⚠️ 냉혹한 평가
- [실패 이유 1]: [게시물 분석 결과]
  → 왜 이것이 치명적인가: [구체적 영향과 기회비용]
  → 수치로 증명: [정량적 근거와 비교]
- [실패 이유 2-3개도 동일한 형식]

## 💡 정신 차리기
- [즉각 행동 1]: [현재 실패 원인] → [측정 가능한 목표와 기한]
  → 안 하면: [냉혹한 미래 예측]
- [즉각 행동 2]: 동일한 형식

**필수 구조 (목표가 없는 경우):**

## 📊 분석 근거
- 게시물 [개수]개 분석, [기간] 활동 검토
- 발견한 주요 패턴: [구체적 패턴]

## ⚠️ 방황 중
- [활동 1]: [게시물 제목/날짜]
  → 냉혹한 평가: [왜 비생산적인가]
  → 결과: [목표 없이 표류하는 증거]
- 기회비용: [이 시간에 할 수 있었던 것들]

## 💡 각성
- 목표 설정: [왜 지금 당장 필요한가 + 충격 요법]
  → 안 하면: [냉혹한 미래]
- [즉각 실행 행동 2개]: [현재 문제] → [측정 가능한 결과와 기한]
  → 안 하면: [도발적 경고]

**중요:**
- "No active goals set." 메시지를 받으면 목표 관련 섹션 제외
- 모든 비판은 게시물의 구체적 내용으로 뒷받침
- 비판할 때 반드시 "왜 실패했나", "왜 치명적인가"를 설명
- 극단적 비교 사용 (경쟁자, 업계 평균, 시간 낭비 등)
- 모든 위로, 칭찬 금지
- 불편한 진실만 전달
- 사용자를 불편하게 만들어 행동 변화 유도`,
    };

    // Generate story (non-streaming)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: harshnessPrompts[harshness],
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
**중요: 게시물 제목과 날짜를 인용하여 구체적인 증거를 제시하세요.**
**중요: 모든 평가와 비판에 대해 "왜"를 설명하세요.**
**중요: 반드시 한국어로 응답하세요.**`,
        },
      ],
      temperature: 0.7,
      max_tokens: 600,
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
    logger.error({ err: error, period: rawPeriod }, "Story generation error");
    return { success: false, error: "Failed to generate story" };
  }
};

// Share story to feed as a post
const shareStoryToFeed = async (
  rawPeriod: string,
  csrfToken?: string
): Promise<
  { success: true; postId: string } | { success: false; error: string }
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
        error:
          "Invalid period. Must be one of: daily, weekly, monthly, yearly, all",
      };
    }

    // CSRF Protection - validate token
    const { validateCsrf } = await import("@/lib/csrf-middleware");
    if (!validateCsrf(csrfToken)) {
      return { success: false, error: "Invalid CSRF token" };
    }

    // Get the story
    const story = await prisma.story.findUnique({
      where: {
        userId_period: {
          userId: currentUser.id,
          period: period,
        },
      },
    });

    if (!story) {
      return {
        success: false,
        error: "Story not found. Generate a story first.",
      };
    }

    // Check if this story generation was already shared
    // Use storyGenerationId (timestamp) to track exact generation
    const storyGenerationId = story.updatedAt.getTime().toString();
    const existingPost = await prisma.post.findFirst({
      where: {
        authorId: currentUser.id,
        storyGenerationId: storyGenerationId,
      },
    });

    if (existingPost) {
      return {
        success: false,
        error: "This story has already been shared to your feed.",
      };
    }

    // Format as post
    const periodLabels: Record<string, string> = {
      daily: "지난 24시간",
      weekly: "지난 주",
      monthly: "지난 달",
      yearly: "지난 1년",
      all: "전체 여정",
    };

    const title = `[AI] ${periodLabels[period]} 성장 스토리`;

    // Create post with story metadata
    const post = await prisma.post.create({
      data: {
        title: sanitizeContent(title, 200),
        content: sanitizeContent(story.content, 10000),
        authorId: currentUser.id,
        status: "PUBLISHED",
        storyGenerationId: storyGenerationId,
        storyPeriod: period,
      },
    });

    logger.info(
      {
        userId: currentUser.id,
        storyPeriod: period,
        postId: post.id,
      },
      "Story shared to feed"
    );

    return { success: true, postId: post.id };
  } catch (error) {
    logger.error(
      { err: error, period: rawPeriod },
      "Share story to feed error"
    );
    return { success: false, error: "Failed to share story to feed" };
  }
};

export {
  getUserGoals,
  getUserStory,
  getCachedStory,
  generateStory,
  shareStoryToFeed,
};
