"use server";

import { openai, agent } from "./agent";
import { logger } from "@/lib/logger";

// Proofread content (non-streaming version for Server Action)
// Note: For streaming AI responses, the API route pattern must be used
// as Server Actions don't support streaming responses yet
const proofreadContent = async (
  title: string,
  content: string
): Promise<
  | { success: true; result: { title: string; content: string } }
  | { success: false; error: string }
> => {
  try {
    if (!title?.trim() || !content?.trim()) {
      return { success: false, error: "Title and content are required" };
    }

    const prompt = `You are a ${agent.name}. ${agent.instructions}

Transform this work log into a professional career development record:

Title: ${title}
Content: ${content}

STRICT FORMATTING RULES:
1. Use the EXACT SAME LANGUAGE as input (Korean→Korean, English→English)
2. Identify EACH SEPARATE task/activity mentioned
3. Write ONE sentence per task
4. Separate each sentence with TWO newlines (\\n\\n)
5. Start each sentence with a professional action verb
6. Make each sentence standalone and complete

NEVER combine multiple tasks into one sentence.
NEVER use "and" to join different activities.
ALWAYS split "A and B" into two separate sentences.

Example 1:
Input: "Today at work, I made IAM logic and designed shared components."
Output: "Implemented IAM logic by designing and developing authentication/authorization workflows.\\n\\nDesigned reusable UI components to be used across the service."

Example 2:
Input: "오늘 IAM 로직 만들고 공통 컴포넌트 설계했어요."
Output: "✅ IAM 인증/인가 워크플로우를 설계하고 개발하여 로직을 구현했습니다.\\n\\n✅ 서비스 전반에 사용될 재사용 가능한 UI 컴포넌트를 설계했습니다."

Respond in JSON format:
{"title": "corrected title", "content": "corrected content"}`;

    const completion = await openai.chat.completions.create({
      model: agent.model,
      messages: [
        {
          role: "system",
          content: agent.instructions,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const result = completion.choices[0]?.message?.content;

    if (!result) {
      return { success: false, error: "No response from AI" };
    }

    const parsed = JSON.parse(result) as { title: string; content: string };

    return { success: true, result: parsed };
  } catch (error) {
    logger.error({ err: error }, "AI proofread error");
    return { success: false, error: "Failed to proofread content" };
  }
};

export { proofreadContent };
