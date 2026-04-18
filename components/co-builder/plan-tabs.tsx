"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AGENT_LABELS, type AgentKey, type AgentPlan } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  plan: AgentPlan;
  loading: boolean;
  activeAgent: AgentKey | null;
};

const AGENTS: AgentKey[] = ["design", "contracts", "frontend", "gtm"];

function AgentContent({
  agentKey,
  content,
  isLoading,
}: {
  agentKey: AgentKey;
  content: string | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-3 rounded-full bg-muted animate-pulse",
              i === 1 && "w-3/4",
              i === 2 && "w-full",
              i === 3 && "w-1/2"
            )}
          />
        ))}
        <p className="text-xs text-muted-foreground mt-2">
          {AGENT_LABELS[agentKey]} trabajando…
        </p>
      </div>
    );
  }

  if (!content) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        Genera un plan para ver el output de este agente.
      </p>
    );
  }

  return (
    <div className="prose prose-sm max-w-none py-2">
      {content.split("\n").map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <h3 key={i} className="text-base font-semibold mt-4 mb-1">
              {line.slice(3)}
            </h3>
          );
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <li key={i} className="text-sm ml-3 my-0.5">
              {line.slice(2)}
            </li>
          );
        }
        if (line.trim() === "") return <br key={i} />;
        return (
          <p key={i} className="text-sm my-1">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export function PlanTabs({ plan, loading, activeAgent }: Props) {
  return (
    <Tabs defaultValue="design" className="w-full">
      <TabsList className="grid w-full grid-cols-4 h-auto">
        {AGENTS.map((key) => {
          const isActive = activeAgent === key;
          const isDone = !!plan[key];
          return (
            <TabsTrigger
              key={key}
              value={key}
              className="relative flex flex-col gap-0.5 py-2 text-xs leading-tight"
            >
              {isActive && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
              <span>{AGENT_LABELS[key].split(" ")[0]}</span>
              <span className="text-[10px] opacity-70">
                {AGENT_LABELS[key].split(" ").slice(1).join(" ")}
              </span>
              {isDone && !isActive && (
                <span className="absolute -top-0.5 -right-0.5 text-[8px]">✓</span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {AGENTS.map((key) => (
        <TabsContent key={key} value={key} className="mt-3 min-h-[180px]">
          <AgentContent
            agentKey={key}
            content={plan[key]}
            isLoading={loading && activeAgent === key}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
