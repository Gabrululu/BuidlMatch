"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SKILL_OPTIONS, type Skill } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  onSubmit: (idea: string, skills: Skill[], tipAmount: string) => void;
  loading: boolean;
};

const TIP_PRESETS = ["0.5", "1", "2", "5"];

export function IdeaForm({ onSubmit, loading }: Props) {
  const [idea, setIdea] = useState("");
  const [selected, setSelected] = useState<Set<Skill>>(new Set());
  const [tipAmount, setTipAmount] = useState("1");

  function toggle(skill: Skill) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(skill) ? next.delete(skill) : next.add(skill);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!idea.trim() || loading) return;
    onSubmit(idea.trim(), Array.from(selected), tipAmount || "1");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      {/* Idea */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">¿Cuál es tu idea?</label>
        <Textarea
          placeholder="Ej: Una plataforma donde builders latinos se conectan con proyectos Web3 según sus skills y disponibilidad…"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={5}
          maxLength={600}
          className="resize-none text-sm"
          disabled={loading}
        />
        <span className="text-xs text-muted-foreground text-right">
          {idea.length}/600
        </span>
      </div>

      {/* Skills */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">
          Skills que necesitas{" "}
          <span className="text-muted-foreground font-normal">(opcional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SKILL_OPTIONS.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => toggle(skill)}
              disabled={loading}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                selected.has(skill)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              )}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Tip amount */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">
          Tip por builder{" "}
          <span className="text-muted-foreground font-normal">(USDC)</span>
        </label>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {TIP_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setTipAmount(p)}
                disabled={loading}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                  tipAmount === p
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <Input
            type="number"
            min="0.1"
            step="0.1"
            value={tipAmount}
            onChange={(e) => setTipAmount(e.target.value)}
            disabled={loading}
            className="w-20 text-xs text-center"
            placeholder="custom"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={!idea.trim() || loading}
        className="w-full"
      >
        {loading ? "Generando plan…" : "✨ Generar plan con IA"}
      </Button>
    </form>
  );
}
