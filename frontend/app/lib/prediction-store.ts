/**
 * prediction-store.ts
 * Lightweight sessionStorage bridge for /predict → /analyze context passing.
 *
 * KEY DESIGN DECISIONS:
 *  - Only 6 "highlight" features travel with the context (not all 19).
 *    This keeps the AI prompt compact and prevents Ollama ECONNRESET.
 *  - Session-scoped: cleared when the tab closes.
 *  - One-time consume: cleared after /analyze reads it (prevents stale replays).
 */

const KEY = "tg_prediction_context";

/** The 6 most diagnostic features for attack classification */
export const HIGHLIGHT_FEATURE_KEYS = [
  "flow_duration",
  "total_fwd_packets",
  "syn_flag_count",
  "flow_packets_s",
  "flow_bytes_s",
  "psh_flag_count",
] as const;

export type HighlightKey = (typeof HIGHLIGHT_FEATURE_KEYS)[number];

export interface PredictionContext {
  /** Raw XGBoost prediction e.g. "DDoS", "PortScan" */
  prediction: string;
  /** Human-readable label e.g. "DDoS Attack" */
  label: string;
  /**
   * ONLY the 6 key indicator features — NOT the full 19-field dump.
   * This is intentionally compact to keep AI prompts small.
   */
  keyFeatures: Partial<Record<HighlightKey, number>>;
  /** Full feature map kept locally for the UI display only — never sent to AI */
  allFeatures: Record<string, number>;
  /** Unix ms timestamp */
  timestamp: number;
}

/** Save prediction context before navigating to /analyze */
export function savePredictionContext(ctx: PredictionContext): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(ctx));
  } catch {
    // sessionStorage unavailable (SSR, private browsing) — fail silently
  }
}

/** Read and immediately clear the stored context (one-time use) */
export function consumePredictionContext(): PredictionContext | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    return JSON.parse(raw) as PredictionContext;
  } catch {
    return null;
  }
}

/** Peek without clearing — used for back-navigation scenarios */
export function peekPredictionContext(): PredictionContext | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PredictionContext) : null;
  } catch {
    return null;
  }
}

/** Manually clear if user starts a fresh manual query */
export function clearPredictionContext(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/**
 * Build a COMPACT contextual prompt — only 6 key features.
 *
 * This is the core fix for ECONNRESET: instead of sending all 19 features
 * (which can create a 1500+ token prompt), we send only the 6 most
 * diagnostically relevant ones (~200 tokens total).
 */
export function buildCompactQuery(ctx: PredictionContext): string {
  const featureLines = Object.entries(ctx.keyFeatures)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `  - ${formatFeatureLabel(k)}: ${v!.toLocaleString()}`)
    .join("\n");

  return `Predicted Attack: ${ctx.label}

Key Indicators:
${featureLines}

Generate a concise cybersecurity investigation report covering:
1. Attack Analysis
2. Severity Assessment
3. Mitigation Recommendations`;
}

/** Convert snake_case feature key to a readable label */
function formatFeatureLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}