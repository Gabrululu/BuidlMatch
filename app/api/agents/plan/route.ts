import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPTS } from "@/agents/prompts";
import { type AgentKey } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const AGENTS: AgentKey[] = ["design", "contracts", "frontend", "gtm"];

function sse(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  const { idea, skills } = (await req.json()) as {
    idea: string;
    skills: string[];
  };

  const userMessage = [
    `Idea del proyecto: ${idea}`,
    skills.length > 0 ? `Skills que necesitan: ${skills.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function emit(data: object) {
        controller.enqueue(encoder.encode(sse(data)));
      }

      try {
        for (const agent of AGENTS) {
          emit({ type: "agent_start", agent });

          const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: SYSTEM_PROMPTS[agent],
          });

          const result = await model.generateContentStream(userMessage);

          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              emit({ type: "agent_chunk", agent, text });
            }
          }

          emit({ type: "agent_done", agent });
        }

        emit({ type: "done" });
      } catch (err) {
        emit({
          type: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
