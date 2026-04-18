export type AgentKey = "design" | "contracts" | "frontend" | "gtm";

export type AgentPlan = Partial<Record<AgentKey, string>>;

export type PlanStatus =
  | { phase: "idle" }
  | { phase: "loading"; current: AgentKey }
  | { phase: "done"; plan: AgentPlan }
  | { phase: "error"; message: string };

export const AGENT_LABELS: Record<AgentKey, string> = {
  design: "🎨 Diseño",
  contracts: "📜 Contratos",
  frontend: "💻 Frontend",
  gtm: "🚀 GTM",
};

export const SKILL_OPTIONS = [
  "Solidity",
  "Frontend",
  "DeFi",
  "Design",
  "GTM",
  "Backend",
  "Mobile",
  "Infra",
  "Community",
  "Product",
] as const;

export type Skill = (typeof SKILL_OPTIONS)[number];
