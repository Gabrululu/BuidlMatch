"use client";

import { useEffect, useState } from "react";
import { BuilderCard } from "./builder-card";
import { type Builder } from "@/lib/supabase";
import { type Skill } from "@/lib/types";

type Props = {
  skills: Skill[];
  tipAmount: string;
};

export function BuilderSuggestions({ skills, tipAmount }: Props) {
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = skills.length > 0 ? `?skills=${skills.join(",")}` : "";
    fetch(`/api/registry/builders${params}`)
      .then((r) => r.json())
      .then((data: { builders: Builder[] }) => setBuilders(data.builders ?? []))
      .catch(() => setBuilders([]))
      .finally(() => setLoading(false));
  }, [skills]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <div className="h-4 w-40 rounded bg-muted animate-pulse" />
        {[1, 2].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (builders.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold">
        🤝 Builders que pueden ayudarte
      </h2>
      {builders.map((b) => (
        <BuilderCard key={b.fid} builder={b} tipAmount={tipAmount} />
      ))}
    </div>
  );
}
