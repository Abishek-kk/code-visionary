import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  pattern?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class VisualizerErrorBoundary extends Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  componentDidCatch(error: Error) {
    console.error("Visualizer error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="rounded-xl border border-[var(--neon-amber)] bg-[color-mix(in_oklab,var(--neon-amber)_10%,var(--panel))] px-6 py-4 max-w-sm">
            <p className="font-mono text-sm font-semibold text-[var(--neon-amber)]">
              ⚠ Visualization Error
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Could not render this step. The AI may have
              returned unexpected data for the{" "}
              {this.props.pattern ?? "current"} pattern.
            </p>
            <button
              onClick={() =>
                this.setState({
                  hasError: false,
                  errorMessage: "",
                })
              }
              className="mt-3 rounded-lg border border-[var(--neon-amber)] px-4 py-1 font-mono text-xs text-[var(--neon-amber)] hover:bg-[color-mix(in_oklab,var(--neon-amber)_15%,transparent)] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
