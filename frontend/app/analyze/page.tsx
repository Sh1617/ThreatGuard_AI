"use client";

/**
 * analyze/page.tsx
 *
 * FIXES applied vs the broken version:
 *
 * 1. ECONNRESET / socket hang-up
 *    - Root cause: buildContextualQuery() sent all 19 features (1500+ token prompt)
 *    - Fix: buildCompactQuery() uses only the 6 key indicator features (~150 tokens)
 *    - Fix: 90-second AbortController timeout via fetchWithTimeout in api.ts
 *
 * 2. Race condition on mount
 *    - Root cause: useEffect called handleSubmit(contextualQuery) but handleSubmit
 *      closed over the initial empty `query` state, so the submission used "".
 *    - Fix: handleSubmit accepts an explicit `q` argument; we pass contextualQuery
 *      directly. No closure-over-stale-state problem.
 *
 * 3. Error handling
 *    - TimeoutError, ConnectionResetError, BackendUnavailableError all surface
 *      distinct user-facing messages with actionable guidance.
 *
 * 4. Empty response guard
 *    - callAnalyze() throws if report is empty (Ollama timeout masquerading as 200 OK)
 */

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../components/theme-context";
import Navbar from "../components/Navbar";
import {
  consumePredictionContext,
  clearPredictionContext,
  buildCompactQuery,
  type PredictionContext,
} from "../lib/prediction-store";
import { callAnalyze, type AnalyzeResponse } from "../lib/api";


// ─── Types ──────────────────────────────────────────────────────────────────

type ErrorKind = "timeout" | "connection_reset" | "unavailable" | "empty_response" | "generic";

interface AppError {
  kind: ErrorKind;
  message: string;
}

function classifyError(e: unknown): AppError {
  if (!(e instanceof Error)) {
    return { kind: "generic", message: String(e) };
  }
  if (e.name === "TimeoutError") {
    return { kind: "timeout", message: e.message };
  }
  if (e.name === "ConnectionResetError") {
    return { kind: "connection_reset", message: e.message };
  }
  if (e.name === "BackendUnavailableError") {
    return { kind: "unavailable", message: e.message };
  }
  if (e.message.toLowerCase().includes("empty report")) {
    return { kind: "empty_response", message: e.message };
  }
  return { kind: "generic", message: e.message };
}

// ─── Constants ──────────────────────────────────────────────────────────────

const ATTACK_META: Record<string, { color: string; darkColor: string; label: string; icon: string; severity: string }> = {
  DDoS:      { color: "#cc0000", darkColor: "#ff6b6b", label: "DDoS Attack",     icon: "⚡", severity: "CRITICAL" },
  Botnet:    { color: "#9f1239", darkColor: "#fda4af", label: "Botnet Activity", icon: "🕸️", severity: "HIGH" },
  PortScan:  { color: "#996600", darkColor: "#ffd580", label: "Port Scan",        icon: "🔍", severity: "MEDIUM" },
  WebAttack: { color: "#7c2d12", darkColor: "#fb923c", label: "Web Attack",       icon: "🌐", severity: "HIGH" },
};

const FIELD_LABELS: Record<string, string> = {
  flow_duration:             "Flow Duration (ms)",
  total_fwd_packets:         "Total Fwd Packets",
  total_backward_packets:    "Total Bwd Packets",
  total_length_fwd_packets:  "Total Fwd Length",
  total_length_bwd_packets:  "Total Bwd Length",
  fwd_packet_length_max:     "Fwd Pkt Max",
  fwd_packet_length_min:     "Fwd Pkt Min",
  fwd_packet_length_mean:    "Fwd Pkt Mean",
  bwd_packet_length_max:     "Bwd Pkt Max",
  flow_bytes_s:              "Flow Bytes/s",
  flow_packets_s:            "Flow Packets/s",
  flow_iat_mean:             "Flow IAT Mean",
  fwd_iat_total:             "Fwd IAT Total",
  bwd_iat_total:             "Bwd IAT Total",
  fin_flag_count:            "FIN Flags",
  syn_flag_count:            "SYN Flags",
  rst_flag_count:            "RST Flags",
  psh_flag_count:            "PSH Flags",
  ack_flag_count:            "ACK Flags",
};

const EXAMPLE_QUERIES = [
  "How to detect port scanning attacks?",
  "What indicators suggest a DDoS attack is underway?",
  "How do botnets communicate with C2 servers?",
  "What are the mitigation strategies for web application attacks?",
  "Explain the difference between DDoS and botnet attacks.",
  "What MITRE ATT&CK techniques are used in network-based attacks?",
];

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "#ff4444",
  HIGH:     "#ff8800",
  MEDIUM:   "#ffcc00",
  LOW:      "#44cc44",
  UNKNOWN:  "#888888",
};

// ─── Error guidance map ─────────────────────────────────────────────────────

const ERROR_GUIDANCE: Record<ErrorKind, { title: string; hint: string; icon: string }> = {
  timeout: {
    icon: "⏱",
    title: "Request Timed Out",
    hint: "LLaMA3 is taking too long. Ollama may be loading the model for the first time — wait 30s and retry.",
  },
  connection_reset: {
    icon: "🔌",
    title: "Connection Reset (ECONNRESET)",
    hint: "Ollama dropped the connection — possibly out of memory or the model crashed. Run: ollama serve",
  },
  unavailable: {
    icon: "🚫",
    title: "Backend Unavailable",
    hint: "FastAPI is not running. Start it with: cd backend && uvicorn app:app --reload",
  },
  empty_response: {
    icon: "📭",
    title: "Empty Report Received",
    hint: "Ollama returned a blank response — LLaMA3 may have timed out internally. Please retry.",
  },
  generic: {
    icon: "⚠",
    title: "Analysis Failed",
    hint: "An unexpected error occurred. Check the browser console and backend logs.",
  },
};

// ─── Loading steps ──────────────────────────────────────────────────────────

const PIPELINE_STEPS = [
  { id: 1, label: "Embedding query",        tech: "MiniLM-L3-v2" },
  { id: 2, label: "Searching vector store", tech: "FAISS (k=2)" },
  { id: 3, label: "Retrieving context",     tech: "LangChain RAG" },
  { id: 4, label: "Generating report",      tech: "LLaMA3 via Ollama" },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function AnalyzePage() {
  const { dark } = useTheme();

  const [query,   setQuery]   = useState("");
  const [result,  setResult]  = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [appError, setAppError] = useState<AppError | null>(null);
  const [history,  setHistory]  = useState<AnalyzeResponse[]>([]);
  const [predCtx,  setPredCtx]  = useState<PredictionContext | null>(null);
  const [loadingStep, setLoadingStep] = useState(0); // 0-3 for pipeline animation

  // ── Theme tokens ────────────────────────────────────────────────────────
  const accent     = dark ? "#63ffb4" : "#0f7a4e";
  const cardBorder = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)";
  const cardBg     = dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)";
  const textMuted  = dark ? "#a0aec0" : "#4a5568";

  const predMeta = predCtx
    ? (ATTACK_META[predCtx.prediction] ?? {
        color: accent, darkColor: accent,
        label: predCtx.label, icon: "⚠️", severity: "UNKNOWN",
      })
    : null;

  // ── Pipeline step animator while loading ────────────────────────────────
  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }
    let step = 0;
    const interval = setInterval(() => {
      step = Math.min(step + 1, PIPELINE_STEPS.length - 1);
      setLoadingStep(step);
    }, 4000); // advance every 4s — matches typical Ollama latency
    return () => clearInterval(interval);
  }, [loading]);

  // ── Core submit ─────────────────────────────────────────────────────────
  //
  // IMPORTANT: accepts explicit `q` so callers can pass the query string
  // directly without relying on the `query` state (avoids stale closure).

  const handleSubmit = useCallback(async (q?: string) => {
    const queryText = (q ?? query).trim();
    if (!queryText) return;

    setLoading(true);
    setAppError(null);
    setResult(null);
    setLoadingStep(0);

    try {
      const json = await callAnalyze(queryText);
      setResult(json);
      setHistory((prev) => [json, ...prev.slice(0, 4)]);
    } catch (e: unknown) {
      setAppError(classifyError(e));
    } finally {
      setLoading(false);
    }
  }, [query]);

  // ── Mount: consume prediction context and auto-fire ──────────────────────
  //
  // FIX for stale closure race:
  //   We read the context synchronously, build the compact query string,
  //   then pass it DIRECTLY to handleSubmit(compactQuery).
  //   We do NOT call setQuery() and then handleSubmit() in the same tick —
  //   that would submit the old empty string because state updates are async.

  useEffect(() => {
    const ctx = consumePredictionContext();
    if (!ctx) return;

    setPredCtx(ctx);

    // buildCompactQuery uses only 6 key features — safe prompt size
    const compactQuery = buildCompactQuery(ctx);
    setQuery(compactQuery);         // populate the textarea for display
    handleSubmit(compactQuery);     // pass directly — no stale-state problem
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally once on mount

  // ── Reset to manual mode ────────────────────────────────────────────────
  const handleManualReset = () => {
    setPredCtx(null);
    clearPredictionContext();
    setQuery("");
    setResult(null);
    setAppError(null);
  };

  const useExample = (q: string) => {
    handleManualReset();
    setQuery(q);
    handleSubmit(q);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .section-label {
          font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
          opacity: 0.45; margin-bottom: 14px; font-family: 'IBM Plex Mono', monospace;
        }
        .query-input {
          width: 100%;
          background: ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"};
          border: 1px solid ${cardBorder}; border-radius: 4px;
          padding: 14px 16px; font-size: 13px;
          font-family: 'IBM Plex Mono', monospace; color: inherit;
          outline: none; resize: vertical; min-height: 120px;
          transition: border-color 0.15s; line-height: 1.7;
        }
        .query-input:focus { border-color: ${accent}; }
        .query-input::placeholder { opacity: 0.35; }

        .submit-btn {
          padding: 12px 28px; border-radius: 4px; border: none;
          font-family: 'IBM Plex Mono', monospace; font-size: 13px;
          letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s; font-weight: 500;
        }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }

        .example-chip {
          font-family: 'IBM Plex Mono', monospace; font-size: 11px;
          padding: 6px 14px; border-radius: 20px; border: 1px solid;
          cursor: pointer; background: transparent; transition: all 0.15s; text-align: left;
        }
        .example-chip:hover { opacity: 0.8; transform: translateY(-1px); }

        .feat-row {
          display: flex; justify-content: space-between;
          padding: 5px 0; font-size: 11px; border-bottom: 1px solid;
          font-family: 'IBM Plex Mono', monospace;
        }
        .feat-row:last-child { border-bottom: none; }

        .reset-btn {
          font-family: 'IBM Plex Mono', monospace; font-size: 10px;
          letter-spacing: 0.08em; padding: 4px 10px; border-radius: 2px;
          border: 1px solid; cursor: pointer; background: transparent; transition: all 0.15s;
        }
        .reset-btn:hover { opacity: 0.7; }

        .hist-item {
          padding: 10px 14px; border-radius: 4px; border: 1px solid;
          cursor: pointer; transition: all 0.15s;
          font-family: 'IBM Plex Mono', monospace;
        }
        .hist-item:hover { opacity: 0.8; }

        .pipeline-step {
          display: flex; align-items: center; gap: 12;
          padding: 10px 0; border-bottom: 1px solid;
          transition: opacity 0.3s;
        }
        .pipeline-step:last-child { border-bottom: none; }

        .severity-badge {
          font-size: 10px; font-family: 'IBM Plex Mono', monospace;
          letter-spacing: 0.12em; padding: 3px 8px; border-radius: 2px; font-weight: 600;
        }

        @keyframes fadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blink   { 0%,100% { opacity:1; } 50% { opacity:0; } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

        .report-card { animation: fadeIn 0.4s ease; }
        .error-card  { animation: fadeIn 0.3s ease; }

        /* Retry button */
        .retry-btn {
          font-family: 'IBM Plex Mono', monospace; font-size: 11px;
          letter-spacing: 0.08em; padding: 8px 16px; border-radius: 3px;
          border: 1px solid; cursor: pointer; background: transparent;
          transition: all 0.15s; margin-top: 12px;
        }
        .retry-btn:hover { opacity: 0.8; transform: translateY(-1px); }
      `}</style>

      <Navbar />

      <main style={{
        paddingTop: 80, paddingBottom: 60,
        paddingLeft: 40, paddingRight: 40,
        maxWidth: 1200, margin: "0 auto",
      }}>

        {/* ── Page header ── */}
        <div style={{ marginTop: 20, marginBottom: 28 }}>
          <p className="section-label">RAG Investigation Engine — POST /analyze</p>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em",
          }}>
            Threat Analyzer
          </h1>
          <p style={{ fontSize: 13, opacity: 0.55, marginTop: 8, maxWidth: 580, lineHeight: 1.6 }}>
            {predCtx
              ? `Auto-generating investigation report for ${predCtx.label} using compact prompt (6 key indicators).`
              : "Ask any cybersecurity question. The RAG pipeline retrieves threat intelligence, then LLaMA3 generates a report."}
          </p>
        </div>

        {/* ── Prediction context banner ── */}
        {predCtx && predMeta && (
          <div style={{
            border: `1px solid ${dark ? predMeta.darkColor + "40" : predMeta.color + "30"}`,
            borderRadius: 4, padding: "14px 20px", marginBottom: 24,
            background: dark ? predMeta.darkColor + "08" : predMeta.color + "05",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 22 }}>{predMeta.icon}</span>
              <div>
                <div style={{ fontSize: 11, opacity: 0.45, letterSpacing: "0.1em", marginBottom: 3 }}>
                  PREDICTION CONTEXT LOADED
                </div>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600, fontSize: 16,
                  color: dark ? predMeta.darkColor : predMeta.color,
                }}>
                  {predMeta.label}
                </div>
                <div style={{ fontSize: 11, opacity: 0.4, marginTop: 2, display: "flex", gap: 12 }}>
                  <span>{Object.keys(predCtx.keyFeatures).length} key indicators in prompt</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span>{Object.keys(predCtx.allFeatures).length} total features captured</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Severity badge */}
              <span
                className="severity-badge"
                style={{
                  background: SEVERITY_COLOR[predMeta.severity] + "20",
                  color:      SEVERITY_COLOR[predMeta.severity],
                  border:     `1px solid ${SEVERITY_COLOR[predMeta.severity]}40`,
                }}
              >
                {predMeta.severity}
              </span>
              <button
                className="reset-btn"
                onClick={handleManualReset}
                style={{ borderColor: cardBorder, color: textMuted }}
              >
                ✕ CLEAR
              </button>
            </div>
          </div>
        )}

        {/* ── Main grid ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 320px",
          gap: 24, alignItems: "start",
        }}>

          {/* ── Left: query + results ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Query textarea */}
            <div style={{
              border: `1px solid ${cardBorder}`, borderRadius: 4,
              padding: 24, background: cardBg,
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 14,
              }}>
                <p className="section-label" style={{ marginBottom: 0 }}>
                  {predCtx ? "Compact Contextual Query" : "Investigation Query"}
                </p>
                {predCtx && (
                  <span style={{ fontSize: 10, letterSpacing: "0.1em", color: accent, opacity: 0.7 }}>
                    ⚡ COMPACT PROMPT
                  </span>
                )}
              </div>

              <textarea
                className="query-input"
                placeholder="e.g. How to detect port scanning attacks?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
                }}
              />

              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginTop: 14,
              }}>
                <span style={{ fontSize: 11, opacity: 0.35, fontFamily: "'IBM Plex Mono', monospace" }}>
                  Ctrl+Enter to submit
                </span>
                <button
                  className="submit-btn"
                  onClick={() => handleSubmit()}
                  disabled={loading || !query.trim()}
                  style={{ background: dark ? "#63ffb4" : "#0f7a4e", color: dark ? "#080c10" : "#fff" }}
                >
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        style={{ animation: "spin 1s linear infinite" }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      GENERATING REPORT...
                    </span>
                  ) : "→ ANALYZE"}
                </button>
              </div>
            </div>

            {/* ── Loading state with pipeline steps ── */}
            {loading && (
              <div style={{
                border: `1px solid ${cardBorder}`, borderRadius: 4,
                padding: 28, background: cardBg,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: accent, animation: "blink 1s infinite",
                  }} />
                  <span style={{
                    fontSize: 12, opacity: 0.6, letterSpacing: "0.08em",
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}>
                    RAG PIPELINE RUNNING — this may take up to 90 seconds
                  </span>
                </div>

                {PIPELINE_STEPS.map((step, i) => {
                  const isActive  = i === loadingStep;
                  const isDone    = i < loadingStep;
                  const isPending = i > loadingStep;
                  return (
                    <div
                      key={step.id}
                      className="pipeline-step"
                      style={{
                        borderColor: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)",
                        opacity: isPending ? 0.3 : 1,
                        gap: 12,
                      }}
                    >
                      <span style={{
                        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11,
                        background: isDone
                          ? (dark ? accent + "30" : "#0f7a4e30")
                          : isActive
                            ? (dark ? accent + "20" : "#0f7a4e20")
                            : (dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"),
                        color: isDone || isActive ? accent : "inherit",
                        border: isActive ? `1px solid ${accent}50` : "1px solid transparent",
                        animation: isActive ? "pulse 1.5s infinite" : "none",
                      }}>
                        {isDone ? "✓" : step.id}
                      </span>
                      <div>
                        <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
                          {step.label}
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.4 }}>{step.tech}</div>
                      </div>
                      {isActive && (
                        <div style={{ marginLeft: "auto" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2"
                            style={{ animation: "spin 1s linear infinite" }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Error display ── */}
            {appError && !loading && (() => {
              const guidance = ERROR_GUIDANCE[appError.kind];
              return (
                <div
                  className="error-card"
                  style={{
                    background: dark ? "rgba(255,107,107,0.06)" : "rgba(204,0,0,0.04)",
                    border: `1px solid ${dark ? "rgba(255,107,107,0.25)" : "rgba(204,0,0,0.2)"}`,
                    borderRadius: 4, padding: 20,
                    color: dark ? "#ff6b6b" : "#cc0000",
                  }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{guidance.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600, fontSize: 15, marginBottom: 6,
                      }}>
                        {guidance.title}
                      </div>
                      <div style={{
                        fontSize: 12, opacity: 0.85, lineHeight: 1.6,
                        fontFamily: "'IBM Plex Mono', monospace",
                        marginBottom: 6,
                      }}>
                        {appError.message}
                      </div>
                      <div style={{
                        fontSize: 12, opacity: 0.6, lineHeight: 1.6,
                        fontFamily: "'IBM Plex Mono', monospace",
                        borderTop: `1px solid ${dark ? "rgba(255,107,107,0.15)" : "rgba(204,0,0,0.15)"}`,
                        paddingTop: 10, marginTop: 4,
                      }}>
                        💡 {guidance.hint}
                      </div>
                      <button
                        className="retry-btn"
                        onClick={() => handleSubmit()}
                        style={{
                          borderColor: dark ? "rgba(255,107,107,0.4)" : "rgba(204,0,0,0.3)",
                          color: dark ? "#ff6b6b" : "#cc0000",
                        }}
                      >
                        ↻ RETRY
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── Report ── */}
            {result && !loading && (
              <div
                className="report-card"
                style={{
                  border: `1px solid ${dark ? "rgba(99,255,180,0.12)" : "rgba(15,122,78,0.15)"}`,
                  borderRadius: 4, overflow: "hidden",
                }}
              >
                {/* Report header */}
                <div style={{
                  padding: "14px 24px",
                  borderBottom: `1px solid ${dark ? "rgba(99,255,180,0.08)" : "rgba(15,122,78,0.08)"}`,
                  background: dark ? "rgba(99,255,180,0.04)" : "rgba(15,122,78,0.04)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14,2 14,8 20,8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <span style={{
                      fontSize: 12, color: accent, letterSpacing: "0.08em",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}>
                      INVESTIGATION REPORT
                    </span>
                    {predCtx && predMeta && (
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 2, letterSpacing: "0.08em",
                        background: dark ? predMeta.darkColor + "15" : predMeta.color + "10",
                        color: dark ? predMeta.darkColor : predMeta.color,
                        border: `1px solid ${dark ? predMeta.darkColor + "30" : predMeta.color + "25"}`,
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}>
                        {predMeta.icon} {predCtx.label.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 11, opacity: 0.4,
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}>
                    LLaMA3 · FAISS RAG
                  </span>
                </div>

                {/* Traffic indicators summary card (only when from /predict) */}
                {predCtx && (
                  <div style={{
                    padding: "16px 24px",
                    borderBottom: `1px solid ${cardBorder}`,
                    background: dark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
                  }}>
                    <div style={{
                      fontSize: 10, letterSpacing: "0.12em", opacity: 0.4, marginBottom: 12,
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}>
                      KEY INDICATORS USED IN THIS REPORT (6 of {Object.keys(predCtx.allFeatures).length})
                    </div>
                    <div style={{
                      display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "0 24px",
                    }}>
                      {Object.entries(predCtx.keyFeatures).map(([k, v]) => (
                        <div key={k} className="feat-row"
                          style={{ borderColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)" }}>
                          <span style={{ opacity: 0.55 }}>{FIELD_LABELS[k] ?? k}</span>
                          <span style={{
                            color: dark ? predMeta?.darkColor : predMeta?.color,
                            fontWeight: 600,
                          }}>
                            {v?.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Report body */}
                <div style={{ padding: "20px 24px", background: cardBg }}>
                  {!predCtx && (
                    <div style={{
                      fontSize: 12, opacity: 0.4, marginBottom: 12, fontStyle: "italic",
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}>
                      Query: &quot;{result.query}&quot;
                    </div>
                  )}
                  <div style={{
                    fontSize: 14, lineHeight: 1.9, whiteSpace: "pre-wrap",
                    fontFamily: "'Space Grotesk', sans-serif", opacity: 0.87,
                  }}>
                    {result.report}
                  </div>
                </div>

                {/* Report footer */}
                <div style={{
                  padding: "10px 24px",
                  borderTop: `1px solid ${cardBorder}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  fontSize: 11, opacity: 0.4, fontFamily: "'IBM Plex Mono', monospace",
                }}>
                  <span>Generated by LLaMA3 via Ollama</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(result.report)}
                    style={{
                      background: "transparent", border: "none", cursor: "pointer",
                      fontSize: 11, color: "inherit",
                      fontFamily: "'IBM Plex Mono', monospace",
                      letterSpacing: "0.06em", opacity: 0.7,
                    }}
                  >
                    [ copy report ]
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Key indicators summary (sidebar, when context exists) */}
            {predCtx && (
              <div style={{
                border: `1px solid ${cardBorder}`, borderRadius: 4,
                padding: 18, background: cardBg,
              }}>
                <p className="section-label">Key Indicators in Prompt</p>
                {Object.entries(predCtx.keyFeatures).map(([k, v]) => (
                  <div key={k} className="feat-row"
                    style={{ borderColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)" }}>
                    <span style={{ opacity: 0.5 }}>{FIELD_LABELS[k] ?? k}</span>
                    <span style={{
                      fontWeight: 600,
                      color: dark ? predMeta?.darkColor : predMeta?.color,
                    }}>
                      {v?.toLocaleString()}
                    </span>
                  </div>
                ))}

                {/* All features section — display only, NOT sent to AI */}
                <details style={{ marginTop: 14 }}>
                  <summary style={{
                    fontSize: 10, opacity: 0.35, cursor: "pointer",
                    letterSpacing: "0.08em", fontFamily: "'IBM Plex Mono', monospace",
                    listStyle: "none",
                  }}>
                    ▸ View all {Object.keys(predCtx.allFeatures).length} features (display only)
                  </summary>
                  <div style={{ marginTop: 10, maxHeight: 220, overflowY: "auto" }}>
                    {Object.entries(predCtx.allFeatures).map(([k, v]) => (
                      <div key={k} className="feat-row"
                        style={{ borderColor: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)" }}>
                        <span style={{ opacity: 0.45 }}>{FIELD_LABELS[k] ?? k}</span>
                        <span style={{ opacity: 0.7 }}>{v.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    marginTop: 8, fontSize: 10, opacity: 0.3,
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}>
                    These are shown for reference only — never sent to the AI.
                  </div>
                </details>
              </div>
            )}

            {/* Example queries */}
            <div style={{
              border: `1px solid ${cardBorder}`, borderRadius: 4,
              padding: 20, background: cardBg,
            }}>
              <p className="section-label">
                {predCtx ? "Or Try a Manual Query" : "Example Queries"}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {EXAMPLE_QUERIES.map((q) => (
                  <button
                    key={q}
                    className="example-chip"
                    onClick={() => useExample(q)}
                    style={{ borderColor: cardBorder, color: textMuted, textAlign: "left" }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Pipeline info */}
            <div style={{
              border: `1px solid ${cardBorder}`, borderRadius: 4,
              padding: 20, background: cardBg,
            }}>
              <p className="section-label">Pipeline</p>
              {PIPELINE_STEPS.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "8px 0",
                    borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"}`,
                  }}
                >
                  <span style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: dark ? "rgba(99,255,180,0.1)" : "rgba(15,122,78,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: accent, flexShrink: 0,
                  }}>
                    {s.id}
                  </span>
                  <div>
                    <div style={{ fontSize: 12 }}>{s.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.4 }}>{s.tech}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent history */}
            {history.length > 0 && (
              <div style={{
                border: `1px solid ${cardBorder}`, borderRadius: 4,
                padding: 20, background: cardBg,
              }}>
                <p className="section-label">Recent Queries</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {history.map((h, i) => (
                    <div
                      key={i}
                      className="hist-item"
                      onClick={() => { setQuery(h.query); setResult(h); setPredCtx(null); }}
                      style={{ borderColor: cardBorder, background: "transparent" }}
                    >
                      <div style={{ fontSize: 11, lineHeight: 1.5, opacity: 0.6 }}>
                        {h.query.length > 65 ? h.query.slice(0, 65) + "…" : h.query}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}