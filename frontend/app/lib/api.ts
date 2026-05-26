/**
 * api.ts
 * Centralised API utilities for ThreatGuard AI frontend.
 *
 * Provides:
 *  - fetchWithTimeout: fetch wrapper with AbortController timeout
 *  - classifyError: maps network/HTTP errors to user-friendly messages
 *  - callPredict / callAnalyze: typed wrappers for the two backend endpoints
 */

const BASE = "/api"; // proxied by next.config.ts → http://localhost:8000

/** Default timeout in ms — long enough for LLaMA3, short enough to fail fast */
export const ANALYZE_TIMEOUT_MS = 90_000; // 90 s
export const PREDICT_TIMEOUT_MS = 15_000; // 15 s

// ─── Generic fetch with timeout ────────────────────────────────────────────

export async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new TimeoutError(timeoutMs);
    }
    throw classifyFetchError(err);
  } finally {
    clearTimeout(timer);
  }
}

// ─── Typed errors ───────────────────────────────────────────────────────────

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(
      `Request timed out after ${ms / 1000}s. ` +
      `LLaMA3/Ollama may be slow or unresponsive — try again in a moment.`
    );
    this.name = "TimeoutError";
  }
}

export class BackendUnavailableError extends Error {
  constructor() {
    super(
      "Cannot reach the backend (http://localhost:8000). " +
      "Make sure the FastAPI server is running: cd backend && uvicorn app:app"
    );
    this.name = "BackendUnavailableError";
  }
}

export class ConnectionResetError extends Error {
  constructor() {
    super(
      "Connection was reset (ECONNRESET). " +
      "Ollama/LLaMA3 likely ran out of memory or the prompt was too large. " +
      "The prompt has been trimmed — please retry."
    );
    this.name = "ConnectionResetError";
  }
}

/** Map a raw fetch error to a descriptive, user-friendly error */
function classifyFetchError(err: unknown): Error {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (
      msg.includes("econnreset") ||
      msg.includes("socket hang up") ||
      msg.includes("network error") ||
      msg.includes("failed to fetch")
    ) {
      // Could be ECONNRESET or backend not running
      if (msg.includes("econnreset") || msg.includes("socket hang up")) {
        return new ConnectionResetError();
      }
      return new BackendUnavailableError();
    }
  }
  return err instanceof Error ? err : new Error(String(err));
}

// ─── /predict ───────────────────────────────────────────────────────────────

export interface PredictRequest {
  data: Record<string, number>;
}

export interface PredictResponse {
  prediction: string;
}

export async function callPredict(data: Record<string, number>): Promise<PredictResponse> {
  const res = await fetchWithTimeout(
    `${BASE}/predict`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    },
    PREDICT_TIMEOUT_MS
  );

  if (!res.ok) {
    throw new Error(`Prediction failed — server returned HTTP ${res.status}`);
  }

  return res.json() as Promise<PredictResponse>;
}

// ─── /analyze ───────────────────────────────────────────────────────────────

export interface AnalyzeRequest {
  query: string;
}

export interface AnalyzeResponse {
  query: string;
  report: string;
}

export async function callAnalyze(query: string): Promise<AnalyzeResponse> {
  const res = await fetchWithTimeout(
    `${BASE}/analyze`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    },
    ANALYZE_TIMEOUT_MS
  );

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      // ignore parse errors
    }
    throw new Error(`Analysis failed — ${detail}`);
  }

  const json = await res.json() as AnalyzeResponse;

  if (!json.report || json.report.trim().length === 0) {
    throw new Error(
      "Backend returned an empty report. " +
      "Ollama may have timed out internally — please retry."
    );
  }

  return json;
}