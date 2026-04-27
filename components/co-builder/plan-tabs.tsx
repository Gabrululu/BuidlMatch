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

const AGENT_COLORS: Record<AgentKey, string> = {
  design:    "from-pink-500 to-rose-500",
  contracts: "from-amber-500 to-orange-500",
  frontend:  "from-blue-500 to-cyan-500",
  gtm:       "from-emerald-500 to-teal-500",
};

const AGENT_BG: Record<AgentKey, string> = {
  design:    "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  contracts: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  frontend:  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  gtm:       "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="rounded bg-muted px-1 py-0.5 text-[11px] font-mono">{part.slice(1, -1)}</code>;
    return part;
  });
}

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
        <div className={cn("h-1.5 w-full rounded-full bg-muted overflow-hidden")}>
          <div className={cn("h-full w-1/2 rounded-full bg-gradient-to-r animate-pulse", AGENT_COLORS[agentKey])} />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn("h-2.5 rounded-full bg-muted animate-pulse",
              i === 1 && "w-2/3",
              i === 2 && "w-full",
              i === 3 && "w-5/6",
              i === 4 && "w-1/2"
            )}
          />
        ))}
        <p className={cn("text-xs font-medium mt-1", AGENT_BG[agentKey].split(" ").slice(1).join(" "))}>
          {AGENT_LABELS[agentKey]} generando…
        </p>
      </div>
    );
  }

  if (!content) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        Genera un plan para ver el output de este agente.
      </p>
    );
  }

  return (
    <div className="py-2 flex flex-col gap-0.5">
      {content.split("\n").map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <h3 key={i} className="text-sm font-semibold mt-4 mb-1 first:mt-1">
              {renderInline(line.slice(3))}
            </h3>
          );
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <div key={i} className="flex gap-2 items-baseline ml-1 my-0.5">
              <span className={cn("text-[10px] mt-1 flex-shrink-0", AGENT_BG[agentKey].split(" ").slice(1).join(" "))}>●</span>
              <span className="text-sm leading-snug">{renderInline(line.slice(2))}</span>
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return (
          <p key={i} className="text-sm leading-snug">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

export function PlanTabs({ plan, loading, activeAgent }: Props) {
  return (
    <Tabs defaultValue="design" className="w-full">
      <TabsList className="grid w-full grid-cols-4 h-auto p-1 gap-1">
        {AGENTS.map((key) => {
          const isActive = activeAgent === key;
          const isDone = !!plan[key];
          const emoji = AGENT_LABELS[key].split(" ")[0];
          const label = AGENT_LABELS[key].split(" ").slice(1).join(" ");
          return (
            <TabsTrigger
              key={key}
              value={key}
              className="relative flex flex-col gap-0.5 py-2 px-1 text-xs leading-tight rounded-md"
            >
              {isActive && (
                <span className={cn(
                  "absolute inset-0 rounded-md opacity-15 bg-gradient-to-br",
                  AGENT_COLORS[key]
                )} />
              )}
              <span className="text-base leading-none">{emoji}</span>
              <span className="text-[10px] font-medium opacity-80 leading-none">{label}</span>
              {isDone && !isActive && (
                <span className="absolute top-1 right-1 text-[9px] text-emerald-500 font-bold">✓</span>
              )}
              {isActive && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {AGENTS.map((key) => (
        <TabsContent
          key={key}
          value={key}
          className="mt-3 min-h-[180px] rounded-xl border bg-card px-4 py-1"
        >
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
