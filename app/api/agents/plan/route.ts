import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPTS } from "@/agents/prompts";
import { type AgentKey } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

          const agentStream = client.messages.stream({
            model: "claude-sonnet-4-20250514",
            max_tokens: 600,
            system: SYSTEM_PROMPTS[agent],
            messages: [{ role: "user", content: userMessage }],
          });

          for await (const event of agentStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              emit({ type: "agent_chunk", agent, text: event.delta.text });
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
