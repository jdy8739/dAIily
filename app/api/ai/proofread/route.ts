import { NextRequest } from "next/server";
import { openai, agent } from "../../../../features/ai/lib/agent";
import { logger } from "../../../../lib/logger";
import { sanitizeContent } from "../../../../lib/sanitize";

const runtime = "edge";

async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json();

    if (!title?.trim() || !content?.trim()) {
      return new Response("Title and content are required", { status: 400 });
    }

    // Sanitize inputs to prevent prompt injection
    const sanitizedTitle = sanitizeContent(title, 200);
    const sanitizedContent = sanitizeContent(content, 5000);

    const prompt = `You are a ${agent.name}. ${agent.instructions}

Transform this work log into a professional career development record:

Title: ${sanitizedTitle}
Content: ${sanitizedContent}

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

    const stream = await openai.chat.completions.create({
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
      stream: true,
      response_format: { type: "json_object" },
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    logger.error({ err: error }, "AI proofread streaming error");
    return new Response("Failed to proofread content", { status: 500 });
  }
}

export { runtime, POST };
