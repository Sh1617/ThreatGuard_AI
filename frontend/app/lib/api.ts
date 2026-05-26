/**
 * api.ts  (v1.2)
 * Centralised API utilities for ThreatGuard AI frontend.
 *
 * FIX (v1.2):
 *  - ANALYZE_TIMEOUT_MS raised to 95s (backend timeout is 80s, so frontend
 *    waits 15s longer and always sees a clean HTTP 500 rather than ECONNRESET).
 *  - classifyFetchError now also catches "load failed" (Safari) and
 *    "net::ERR_CONNECTION_REFUSED" (Chrome when backend is down).
 *  - callAnalyze surfaces the backend's detail message verbatim for 500 errors
 *    so users see "LLM timed out after 80s" instead of generic "HTTP 500".
 */

const BASE = "/api"; // proxied by next.config.ts → http://localhost:8000

/** 
 * FIX: 95s — must be LONGER than backend OllamaLLM timeout (80s).
 * If frontend times out first, the browser closes the socket and the backend
 * sees a broken pipe, causing misleading ECONNRESET logs on both sides.
 * With 95s frontend / 80s backend, the backend always responds first with
 * a clean HTTP 500 and an actionable error message.
 */
export const ANALYZE_TIMEOUT_MS = 95_000; // 95 s  ← was 90s
export const PREDICT_TIMEOUT_MS = 15_000; // 15 s

// ─── Generic fetch with timeout ─────────────────────────────────────────────

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

// ─── Typed errors ────────────────────────────────────────────────────────────

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

    if (msg.includes("econnreset") || msg.includes("socket hang up")) {
      return new ConnectionResetError();
    }

    // FIX: also catch Safari ("load failed") and Chrome when backend is down
    if (
      msg.includes("failed to fetch") ||
      msg.includes("network error") ||
      msg.includes("load failed") ||
      msg.includes("err_connection_refused")
    ) {
      return new BackendUnavailableError();
    }
  }
  return err instanceof Error ? err : new Error(String(err));
}

// ─── /predict ────────────────────────────────────────────────────────────────

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
    let detail = `Prediction failed — server returned HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch { /* ignore */ }
    throw new Error(detail);
  }

  return res.json() as Promise<PredictResponse>;
}

// ─── /analyze ────────────────────────────────────────────────────────────────

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
    // FIX: surface the backend's detail message verbatim so users see
    // "LLM timed out after 80s" instead of the generic "HTTP 500".
    let detail = `Analysis failed — HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch { /* ignore parse errors */ }
    throw new Error(detail);
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