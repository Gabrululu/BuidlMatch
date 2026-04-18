"use client";

import { useEffect } from "react";
import { useConnect } from "wagmi";
import { useFarcasterAuth } from "@/lib/use-farcaster-auth";

export function MiniappInit() {
  const auth = useFarcasterAuth();
  const { connect, connectors } = useConnect();

  useEffect(() => {
    if (auth.status !== "ready") return;
    const inj = connectors.find((c) => c.id === "injected");
    if (inj) connect({ connector: inj });
  }, [auth.status, connect, connectors]);

  return null;
}
