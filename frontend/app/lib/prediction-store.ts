/**
 * prediction-store.ts
 * Lightweight sessionStorage bridge for passing prediction context
 * from /predict → /analyze without URL params or global state.
 *
 * sessionStorage is the right tool here:
 *  - persists through client-side navigation (unlike component state)
 *  - clears automatically when the browser tab closes (unlike localStorage)
 *  - no external dependencies needed
 *
 * Place this file at: frontend/app/lib/prediction-store.ts
 */

const KEY = "tg_prediction_context";

export interface PredictionContext {
  /** Raw XGBoost prediction e.g. "DDoS", "PortScan" */
  prediction: string;
  /** Human-readable label e.g. "DDoS Attack" */
  label: string;
  /** All 19 network traffic feature values submitted */
  features: Record<string, number>;
  /** Unix timestamp so the Analyze page can show "analysed X seconds ago" */
  timestamp: number;
}

/** Save prediction context before navigating to /analyze */
export function savePredictionContext(ctx: PredictionContext): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(ctx));
  } catch {
    // sessionStorage unavailable (SSR, private browsing quota exceeded) — fail silently
  }
}

/** Read and immediately clear the stored context (one-time use) */
export function consumePredictionContext(): PredictionContext | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY); // consume once
    return JSON.parse(raw) as PredictionContext;
  } catch {
    return null;
  }
}

/** Peek without clearing — used for "back" scenarios */
export function peekPredictionContext(): PredictionContext | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PredictionContext) : null;
  } catch {
    return null;
  }
}

/** Manually clear if the user starts a fresh manual query */
export function clearPredictionContext(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/**
 * Build the contextual AI prompt from stored prediction + features.
 * This is the exact query sent to the /analyze RAG endpoint.
 */
export function buildContextualQuery(ctx: PredictionContext): string {
  const featureLines = Object.entries(ctx.features)
    .map(([k, v]) => `  - ${formatFeatureLabel(k)}: ${v}`)
    .join("\n");

  return `Predicted Attack: ${ctx.label}

Network Traffic Features:
${featureLines}

Generate a professional cybersecurity investigation report that includes:
1. Attack Analysis — what this traffic pattern reveals about the attack
2. Indicators of Compromise (IoCs) — specific features that confirm ${ctx.label}
3. Severity Assessment — risk level and potential blast radius
4. Mitigation Recommendations — immediate and long-term defensive actions
5. Incident Response Suggestions — step-by-step containment and recovery steps`;
}

/** Convert snake_case feature key to a readable label */
function formatFeatureLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}