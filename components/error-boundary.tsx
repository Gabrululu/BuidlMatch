"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 gap-3">
            <p className="text-2xl">⚠️</p>
            <p className="text-sm font-medium">Algo salió mal</p>
            <p className="text-xs text-muted-foreground text-center">
              {this.state.error.message}
            </p>
            <button
              onClick={() => this.setState({ error: null })}
              className="text-xs text-primary underline"
            >
              Reintentar
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
