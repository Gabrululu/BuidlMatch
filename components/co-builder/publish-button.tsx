"use client";

import { useState } from "react";
import { useWriteContract, useReadContract, useConnection } from "wagmi";
import { Button } from "@/components/ui/button";
import { REGISTRY_ABI, registryAddress } from "@/lib/contracts";
import { type AgentPlan, type Skill } from "@/lib/types";

type Phase =
  | "idle"
  | "registering"
  | "saving"
  | "publishing"
  | "done"
  | "error";

type Props = {
  fid: number;
  username: string;
  skills: Skill[];
  idea: string;
  plan: AgentPlan;
};

function titleFromIdea(idea: string): string {
  const first = idea.split(/[.\n]/)[0]?.trim() ?? idea;
  return first.length > 80 ? first.slice(0, 77) + "…" : first;
}

export function PublishButton({ fid, username, skills, idea, plan }: Props) {
  const { address } = useConnection();
  const { mutateAsync: writeContractAsync } = useWriteContract();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");

  const contractAddress = registryAddress();

  const { data: isRegistered } = useReadContract({
    address: contractAddress,
    abi: REGISTRY_ABI,
    functionName: "isRegistered",
    args: [BigInt(fid)],
    query: {
      enabled:
        fid > 0 &&
        contractAddress !== "0x0000000000000000000000000000000000000000",
    },
  });

  async function handlePublish() {
    if (!address) {
      setError("Conecta tu wallet primero");
      setPhase("error");
      return;
    }

    setError("");

    try {
      // Step 1: register onchain if needed
      if (!isRegistered) {
        setPhase("registering");
        await writeContractAsync({
          address: contractAddress,
          abi: REGISTRY_ABI,
          functionName: "register",
          args: [BigInt(fid), username, "", skills, address],
        });
      }

      // Step 2: upsert builder in DB (ensures FK constraint is satisfied)
      await fetch("/api/registry/builders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fid,
          username,
          bio: "",
          skills,
          wallet: address,
        }),
      });

      // Step 3: save project to DB first to get its ID for the metadataUri
      setPhase("saving");
      const title = titleFromIdea(idea);
      const saveRes = await fetch("/api/registry/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner_fid: fid, title, plan_json: plan }),
      });

      if (!saveRes.ok) throw new Error("Error al guardar el proyecto");

      const { project } = (await saveRes.json()) as { project: { id: number } };
      const metadataUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/registry/projects/${project.id}`;

      // Step 4: publish onchain with the real metadataUri
      setPhase("publishing");
      const txHash = await writeContractAsync({
        address: contractAddress,
        abi: REGISTRY_ABI,
        functionName: "publishProject",
        args: [BigInt(fid), title, metadataUri],
      });

      // Step 5: store txHash in DB (best effort, non-blocking)
      fetch(`/api/registry/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tx_hash: txHash }),
      }).catch(() => {});

      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setPhase("error");
    }
  }

  const labels: Record<Phase, string> = {
    idle: "🚀 Publicar proyecto",
    registering: "Registrando en Base…",
    saving: "Guardando plan…",
    publishing: "Publicando onchain…",
    done: "✓ Publicado en Base",
    error: "Reintentar",
  };

  if (phase === "done") {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center">
        <p className="text-sm font-medium text-green-600">
          ✓ Proyecto publicado en BuilderRegistry
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Aparecerá en Spin — BuidlMatch
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {phase === "error" && error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      <Button
        onClick={handlePublish}
        disabled={["registering", "saving", "publishing"].includes(phase)}
        className="w-full"
      >
        {labels[phase]}
      </Button>
      {!isRegistered && phase === "idle" && (
        <p className="text-xs text-muted-foreground text-center">
          Te registrará automáticamente en BuilderRegistry
        </p>
      )}
    </div>
  );
}
