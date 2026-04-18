"use client";

import { useState, useEffect } from "react";
import sdk from "@farcaster/miniapp-sdk";

// Use the SDK's inferred context type
type SDKContext = Awaited<typeof sdk.context>;

type AuthState =
  | { status: "loading" }
  | { status: "ready"; context: NonNullable<SDKContext> }
  | { status: "error"; message: string };

export function useFarcasterAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const context = await sdk.context;
        if (cancelled) return;

        if (!context) {
          setState({ status: "error", message: "No Farcaster context" });
          return;
        }

        setState({ status: "ready", context });
        await sdk.actions.ready();
      } catch (err) {
        if (cancelled) return;
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
