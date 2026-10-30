// Named events on top of PostHog's autocapture. PostHog itself is loaded by the
// script tag in app/layout.tsx, production only; here we just talk to it if present.
type PostHogLike = { capture: (event: string, properties?: Record<string, unknown>) => void };

declare global {
  interface Window {
    posthog?: PostHogLike;
  }
}

// Analytics must never break the page: a blocked or half-loaded PostHog is ignored.
export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    window.posthog?.capture?.(event, properties);
  } catch {
    // ignore
  }
}
