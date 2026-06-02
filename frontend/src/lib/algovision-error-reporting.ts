type AlgoVisionErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type AlgoVisionEvents = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: AlgoVisionErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __algovisionEvents?: AlgoVisionEvents;
  }
}

export function reportAlgoVisionError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.__algovisionEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context,
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    },
  );
}
