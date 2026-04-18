"use client";

import { useState } from "react";
import { useFarcasterAuth } from "@/lib/use-farcaster-auth";
import { IdeaForm } from "@/components/co-builder/idea-form";
import { PlanTabs } from "@/components/co-builder/plan-tabs";
import { BuilderSuggestions } from "@/components/co-builder/builder-suggestions";
import { PublishButton } from "@/components/co-builder/publish-button";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  type AgentKey,
  type AgentPlan,
  type PlanStatus,
  type Skill,
} from "@/lib/types";

type View = "form" | "plan";

export default function MiniappHome() {
  const auth = useFarcasterAuth();
  const [view, setView] = useState<View>("form");
  const [status, setStatus] = useState<PlanStatus>({ phase: "idle" });
  const [plan, setPlan] = useState<AgentPlan>({});
  const [activeAgent, setActiveAgent] = useState<AgentKey | null>(null);
  const [lastSkills, setLastSkills] = useState<Skill[]>([]);
  const [lastIdea, setLastIdea] = useState("");
  const [tipAmount, setTipAmount] = useState("1");

  async function handleGenerate(idea: string, skills: Skill[], tip: string) {
    setView("plan");
    setPlan({});
    setActiveAgent(null);
    setLastSkills(skills);
    setLastIdea(idea);
    setTipAmount(tip);
    setStatus({ phase: "loading", current: "design" });

    try {
      const res = await fetch("/api/agents/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, skills }),
      });

      if (!res.ok || !res.body) {
        setStatus({ phase: "error", message: "Error generando el plan" });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const accumulated: AgentPlan = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw || raw === "[DONE]") continue;

          try {
            const event = JSON.parse(raw) as
              | { type: "agent_start"; agent: AgentKey }
              | { type: "agent_chunk"; agent: AgentKey; text: string }
              | { type: "agent_done"; agent: AgentKey }
              | { type: "done" };

            if (event.type === "agent_start") {
              setActiveAgent(event.agent);
              setStatus({ phase: "loading", current: event.agent });
            } else if (event.type === "agent_chunk") {
              accumulated[event.agent] =
                (accumulated[event.agent] ?? "") + event.text;
              setPlan({ ...accumulated });
            } else if (event.type === "agent_done") {
              setActiveAgent(null);
            } else if (event.type === "done") {
              setActiveAgent(null);
              setStatus({ phase: "done", plan: accumulated });
            }
          } catch {
            // malformed SSE chunk
          }
        }
      }

      setStatus((prev) =>
        prev.phase !== "error" ? { phase: "done", plan: accumulated } : prev
      );
      setActiveAgent(null);
    } catch {
      setStatus({ phase: "error", message: "Error de conexión" });
    }
  }

  if (auth.status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground text-sm animate-pulse">
          Cargando…
        </div>
      </div>
    );
  }

  const username =
    auth.status === "ready"
      ? (auth.context.user?.username ?? `fid:${auth.context.user?.fid}`)
      : "guest";

  const isLoading = status.phase === "loading";
  const isDone = status.phase === "done";

  return (
    <ErrorBoundary>
      <div className="flex flex-1 flex-col gap-4 p-4 max-w-lg mx-auto w-full pb-10">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-lg font-bold leading-none">BuidlMatch</h1>
            <p className="text-xs text-muted-foreground">Co-Builder</p>
          </div>
          <div className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
            @{username}
          </div>
        </div>

        {view === "form" ? (
          <IdeaForm onSubmit={handleGenerate} loading={isLoading} />
        ) : (
          <div className="flex flex-col gap-5">
            <button
              onClick={() => {
                setView("form");
                setStatus({ phase: "idle" });
                setPlan({});
              }}
              className="self-start text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Nueva idea
            </button>

            {status.phase === "error" && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
                <p className="text-sm text-destructive">{status.message}</p>
                <button
                  onClick={() => setView("form")}
                  className="text-xs text-destructive underline mt-1"
                >
                  Volver al form
                </button>
              </div>
            )}

            <PlanTabs
              plan={plan}
              loading={isLoading}
              activeAgent={activeAgent}
            />

            {isDone && (
              <>
                <BuilderSuggestions
                  skills={lastSkills}
                  tipAmount={tipAmount}
                />
                {auth.status === "ready" && (
                  <PublishButton
                    fid={auth.context.user?.fid ?? 0}
                    username={auth.context.user?.username ?? ""}
                    skills={lastSkills}
                    idea={lastIdea}
                    plan={plan}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
