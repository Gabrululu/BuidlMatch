"use client";

import { useState } from "react";
import { useWriteContract, useReadContract, useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { REGISTRY_ABI, registryAddress } from "@/lib/contracts";
import { type AgentPlan, type Skill } from "@/lib/types";

type Phase =
  | "idle"
  | "registering"
  | "publishing"
  | "saving"
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
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");

  const contractAddress = registryAddress();

  const { data: isRegistered } = useReadContract({
    address: contractAddress,
    abi: REGISTRY_ABI,
    functionName: "isRegistered",
    args: [BigInt(fid)],
    query: { enabled: fid > 0 && contractAddress !== "0x0000000000000000000000000000000000000000" },
  });

  async function handlePublish() {
    if (!address) {
      setError("Conecta tu wallet primero");
      setPhase("error");
      return;
    }

    setError("");

    try {
      // Step 1: register if needed
      if (!isRegistered) {
        setPhase("registering");
        await writeContractAsync({
          address: contractAddress,
          abi: REGISTRY_ABI,
          functionName: "register",
          args: [BigInt(fid), username, "", skills, address],
        });
      }

      // Step 2: publish project onchain
      setPhase("publishing");
      const title = titleFromIdea(idea);
      const metadataUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/registry/projects`;

      const txHash = await writeContractAsync({
        address: contractAddress,
        abi: REGISTRY_ABI,
        functionName: "publishProject",
        args: [BigInt(fid), title, metadataUri],
      });

      // Step 3: save to Supabase
      setPhase("saving");
      await fetch("/api/registry/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner_fid: fid,
          title,
          plan_json: plan,
          tx_hash: txHash,
          metadata_uri: metadataUri,
        }),
      });

      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setPhase("error");
    }
  }

  const labels: Record<Phase, string> = {
    idle: "🚀 Publicar proyecto",
    registering: "Registrando en Base…",
    publishing: "Publicando onchain…",
    saving: "Guardando…",
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
        disabled={["registering", "publishing", "saving"].includes(phase)}
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
