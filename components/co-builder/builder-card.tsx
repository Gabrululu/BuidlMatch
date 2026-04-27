"use client";

import { useState } from "react";
import { useWriteContract, useAccount } from "wagmi";
import { parseUnits } from "viem";
import { type Builder } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const USDC_ADDRESS: Record<string, `0x${string}`> = {
  "84532": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  "8453": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

type Props = {
  builder: Builder;
  tipAmount: string;
};

export function BuilderCard({ builder, tipAmount }: Props) {
  const { chainId } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const [tipped, setTipped] = useState(false);

  const fcHandle = builder.username
    .replace(/\.eth$/, "")
    .replace(/\.fc$/, "")
    .replace(/\.base$/, "");

  async function handleTip() {
    const usdcAddress =
      USDC_ADDRESS[String(chainId)] ?? USDC_ADDRESS["84532"];
    try {
      await writeContractAsync({
        address: usdcAddress,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [
          builder.wallet as `0x${string}`,
          parseUnits(tipAmount || "1", 6),
        ],
      });
      setTipped(true);
    } catch {
      // user rejected or error — silently ignore
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4">
      {/* Top row */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-lg flex-shrink-0">
          🏗️
        </div>
        {/* Info */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm font-semibold truncate">
            @{fcHandle}
          </span>
          {builder.bio && (
            <span className="text-xs text-muted-foreground line-clamp-2">
              {builder.bio}
            </span>
          )}
        </div>
      </div>

      {/* Skills */}
      {builder.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {builder.skills.slice(0, 5).map((s) => (
            <span
              key={s}
              className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <a
          href={`https://warpcast.com/${fcHandle}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex-1 inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          👤 Seguir
        </a>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 text-xs"
          onClick={handleTip}
          disabled={isPending || tipped}
        >
          {tipped ? "✓ Enviado" : isPending ? "…" : `💸 Tip ${tipAmount} USDC`}
        </Button>
      </div>
    </div>
  );
}
