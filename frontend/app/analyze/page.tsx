"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../components/theme-context";
import Navbar from "../components/Navbar";
import {
  consumePredictionContext,
  clearPredictionContext,
  buildContextualQuery,
  type PredictionContext,
} from "../lib/prediction-store";

const API = "/api"; // proxied by next.config.ts → http://localhost:8000

interface AnalyzeResult {
  query: string;
  report: string;
}

const RESULT_COLORS: Record<string, { color: string; darkColor: string; label: string; icon: string }> = {
  DDoS:      { color: "#cc0000", darkColor: "#ff6b6b", label: "DDoS Attack",     icon: "⚡" },
  Botnet:    { color: "#9f1239", darkColor: "#fda4af", label: "Botnet Activity", icon: "🕸️" },
  PortScan:  { color: "#996600", darkColor: "#ffd580", label: "Port Scan",        icon: "🔍" },
  WebAttack: { color: "#7c2d12", darkColor: "#fb923c", label: "Web Attack",       icon: "🌐" },
};

const EXAMPLE_QUERIES = [
  "How to detect port scanning attacks?",
  "What indicators suggest a DDoS attack is underway?",
  "How do botnets communicate with command and control servers?",
  "What are the mitigation strategies for web application attacks?",
  "Explain the difference between DDoS and botnet attacks.",
  "What MITRE ATT&CK techniques are used in network-based attacks?",
];

const FIELD_LABELS: Record<string, string> = {
  flow_duration: "Flow Duration (ms)", total_fwd_packets: "Total Fwd Packets",
  total_backward_packets: "Total Bwd Packets", total_length_fwd_packets: "Total Fwd Length",
  total_length_bwd_packets: "Total Bwd Length", fwd_packet_length_max: "Fwd Pkt Max",
  fwd_packet_length_min: "Fwd Pkt Min", fwd_packet_length_mean: "Fwd Pkt Mean",
  bwd_packet_length_max: "Bwd Pkt Max", flow_bytes_s: "Flow Bytes/s",
  flow_packets_s: "Flow Packets/s", flow_iat_mean: "Flow IAT Mean",
  fwd_iat_total: "Fwd IAT Total", bwd_iat_total: "Bwd IAT Total",
  fin_flag_count: "FIN Flags", syn_flag_count: "SYN Flags",
  rst_flag_count: "RST Flags", psh_flag_count: "PSH Flags",
  ack_flag_count: "ACK Flags",
};

// Feature groups for the summary panel
const FEATURE_GROUPS = [
  { label: "Flow", keys: ["flow_duration", "flow_bytes_s", "flow_packets_s", "flow_iat_mean"] },
  { label: "Packets", keys: ["total_fwd_packets", "total_backward_packets", "fwd_packet_length_mean", "bwd_packet_length_max"] },
  { label: "TCP Flags", keys: ["syn_flag_count", "fin_flag_count", "rst_flag_count", "psh_flag_count", "ack_flag_count"] },
];

export default function AnalyzePage() {
  const { dark } = useTheme();

  // ── State ──────────────────────────────────────────────────────────────────
  const [query,    setQuery]   = useState("");
  const [result,   setResult]  = useState<AnalyzeResult | null>(null);
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState<string | null>(null);
  const [history,  setHistory] = useState<AnalyzeResult[]>([]);

  // Context passed from /predict
  const [predCtx, setPredCtx] = useState<PredictionContext | null>(null);
  // true while the auto-query is being prepared (shows a brief banner)
  const [autoMode, setAutoMode] = useState(false);

  const accent     = dark ? "#63ffb4" : "#0f7a4e";
  const cardBorder = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)";
  const cardBg     = dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)";

  // ── Core submit ────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (q?: string) => {
    const queryText = q || query;
    if (!queryText.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json: AnalyzeResult = await res.json();
      setResult(json);
      setHistory((prev) => [json, ...prev.slice(0, 4)]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to connect to backend.");
    } finally {
      setLoading(false);
      setAutoMode(false);
    }
  }, [query]);

  // ── On mount: consume prediction context from sessionStorage ───────────────
  useEffect(() => {
    const ctx = consumePredictionContext();
    if (!ctx) return;

    setPredCtx(ctx);
    setAutoMode(true);

    // Build the rich contextual query and auto-fire
    const contextualQuery = buildContextualQuery(ctx);
    setQuery(contextualQuery);
    handleSubmit(contextualQuery);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once on mount

  // ── Manual query reset (clears prediction context) ────────────────────────
  const handleManualQuery = () => {
    setPredCtx(null);
    setAutoMode(false);
    clearPredictionContext();
    setQuery("");
    setResult(null);
    setError(null);
  };

  const useExample = (q: string) => {
    handleManualQuery();
    setQuery(q);
    handleSubmit(q);
  };

  const predMeta = predCtx
    ? (RESULT_COLORS[predCtx.prediction] || { darkColor: accent, color: accent, label: predCtx.label, icon: "⚠️" })
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .section-label { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.45; margin-bottom: 14px; font-family: 'IBM Plex Mono', monospace; }
        .query-input { width: 100%; background: ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}; border: 1px solid ${cardBorder}; border-radius: 4px; padding: 14px 16px; font-size: 13px; font-family: 'IBM Plex Mono', monospace; color: inherit; outline: none; resize: vertical; min-height: 140px; transition: border-color 0.15s; line-height: 1.7; }
        .query-input:focus { border-color: ${accent}; }
        .query-input::placeholder { opacity: 0.35; }
        .submit-btn { padding: 12px 28px; border-radius: 4px; border: none; font-family: 'IBM Plex Mono', monospace; font-size: 13px; letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s; font-weight: 500; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .example-chip { font-family: 'IBM Plex Mono', monospace; font-size: 11px; padding: 6px 14px; border-radius: 20px; border: 1px solid; cursor: pointer; background: transparent; transition: all 0.15s; text-align: left; }
        .example-chip:hover { opacity: 0.8; }
        .feat-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 11px; border-bottom: 1px solid; }
        .feat-row:last-child { border-bottom: none; }
        .reset-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 2px; border: 1px solid; cursor: pointer; background: transparent; transition: all 0.15s; }
        .reset-btn:hover { opacity: 0.8; }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blink   { 0%,100% { opacity:1; } 50% { opacity:0; } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        .report-card { animation: fadeIn 0.4s ease; }
        .hist-item { padding: 10px 14px; border-radius: 4px; border: 1px solid; cursor: pointer; transition: all 0.15s; }
        .hist-item:hover { opacity: 0.8; }
      `}</style>

      <Navbar />

      <main style={{ paddingTop: 80, paddingBottom: 60, paddingLeft: 40, paddingRight: 40, maxWidth: 1200, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ marginTop: 20, marginBottom: 28 }}>
          <p className="section-label">RAG Investigation Engine — POST /analyze</p>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Threat Analyzer
          </h1>
          <p style={{ fontSize: 13, opacity: 0.55, marginTop: 8, maxWidth: 560 }}>
            {predCtx
              ? `Auto-generated investigation for ${predCtx.label} based on captured traffic features.`
              : "Ask any cybersecurity question. The RAG pipeline retrieves threat intelligence, then LLaMA3 generates a report."}
          </p>
        </div>

        {/* ── Auto-mode banner ── */}
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
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, color: dark ? predMeta.darkColor : predMeta.color }}>
                  {predMeta.label}
                </div>
                <div style={{ fontSize: 11, opacity: 0.4, marginTop: 2 }}>
                  {Object.keys(predCtx.features).length} traffic features · captured from /predict
                </div>
              </div>
            </div>
            <button className="reset-btn"
              onClick={handleManualQuery}
              style={{ borderColor: cardBorder, color: dark ? "#a0aec0" : "#4a5568" }}>
              ✕ CLEAR
            </button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>

          {/* ── Main column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Query box */}
            <div style={{ border: `1px solid ${cardBorder}`, borderRadius: 4, padding: 24, background: cardBg }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p className="section-label" style={{ marginBottom: 0 }}>
                  {predCtx ? "Auto-Generated Contextual Query" : "Investigation Query"}
                </p>
                {predCtx && (
                  <span style={{ fontSize: 10, letterSpacing: "0.1em", color: accent, opacity: 0.7 }}>
                    ⚡ AUTO-POPULATED
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                <span style={{ fontSize: 11, opacity: 0.35 }}>Ctrl+Enter to submit</span>
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

            {/* Error */}
            {error && (
              <div style={{ background: dark ? "rgba(255,107,107,0.08)" : "rgba(204,0,0,0.06)", border: `1px solid ${dark ? "rgba(255,107,107,0.2)" : "rgba(204,0,0,0.2)"}`, borderRadius: 4, padding: "14px 16px", fontSize: 12, color: dark ? "#ff6b6b" : "#cc0000" }}>
                ⚠ {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div style={{ border: `1px solid ${cardBorder}`, borderRadius: 4, padding: 28, background: cardBg }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent, animation: "blink 1s infinite" }} />
                  <span style={{ fontSize: 12, opacity: 0.5, letterSpacing: "0.08em" }}>RAG PIPELINE RUNNING</span>
                </div>
                <div style={{ fontSize: 12, opacity: 0.4, lineHeight: 2 }}>
                  <div>① Embedding query with MiniLM-L3-v2...</div>
                  <div>② Searching FAISS vector store (k=2)...</div>
                  <div>③ Retrieving threat intelligence context...</div>
                  <div>④ LLaMA3 generating investigation report...</div>
                </div>
              </div>
            )}

            {/* ── Report ── */}
            {result && !loading && (
              <div className="report-card" style={{ border: `1px solid ${dark ? "rgba(99,255,180,0.12)" : "rgba(15,122,78,0.15)"}`, borderRadius: 4, overflow: "hidden" }}>

                {/* Report header */}
                <div style={{
                  padding: "14px 24px", borderBottom: `1px solid ${dark ? "rgba(99,255,180,0.08)" : "rgba(15,122,78,0.08)"}`,
                  background: dark ? "rgba(99,255,180,0.04)" : "rgba(15,122,78,0.04)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <span style={{ fontSize: 12, color: accent, letterSpacing: "0.08em" }}>INVESTIGATION REPORT</span>
                    {predCtx && predMeta && (
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 2, letterSpacing: "0.08em",
                        background: dark ? predMeta.darkColor + "15" : predMeta.color + "10",
                        color: dark ? predMeta.darkColor : predMeta.color,
                        border: `1px solid ${dark ? predMeta.darkColor + "30" : predMeta.color + "25"}`,
                      }}>
                        {predMeta.icon} {predCtx.label.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, opacity: 0.4 }}>LLaMA3 · FAISS RAG</span>
                </div>

                {/* ── Traffic context summary (only when from /predict) ── */}
                {predCtx && (
                  <div style={{
                    padding: "16px 24px",
                    borderBottom: `1px solid ${cardBorder}`,
                    background: dark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
                  }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.12em", opacity: 0.4, marginBottom: 12 }}>
                      TRAFFIC FEATURES USED IN THIS REPORT
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0 24px" }}>
                      {FEATURE_GROUPS.map((group) => (
                        <div key={group.label}>
                          <div style={{ fontSize: 10, opacity: 0.35, letterSpacing: "0.1em", marginBottom: 6 }}>
                            {group.label}
                          </div>
                          {group.keys.map((k) => predCtx.features[k] !== undefined && (
                            <div key={k} className="feat-row" style={{ borderColor: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)" }}>
                              <span style={{ opacity: 0.5 }}>{FIELD_LABELS[k] || k}</span>
                              <span style={{ color: dark ? predMeta?.darkColor : predMeta?.color, fontWeight: 500 }}>
                                {predCtx.features[k].toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Report body */}
                <div style={{ padding: "20px 24px", background: cardBg }}>
                  {!predCtx && (
                    <div style={{ fontSize: 12, opacity: 0.4, marginBottom: 12, fontStyle: "italic" }}>
                      Query: &quot;{result.query}&quot;
                    </div>
                  )}
                  <div style={{ fontSize: 14, lineHeight: 1.85, whiteSpace: "pre-wrap", fontFamily: "'Space Grotesk', sans-serif", opacity: 0.85 }}>
                    {result.report}
                  </div>
                </div>

                {/* Report footer */}
                <div style={{
                  padding: "10px 24px", borderTop: `1px solid ${cardBorder}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  fontSize: 11, opacity: 0.4,
                }}>
                  <span>Generated by LLaMA3 via Ollama</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(result.report)}
                    style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 11, color: "inherit", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.06em", opacity: 0.7 }}
                  >
                    [ copy report ]
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Full feature dump (only shown when context exists) */}
            {predCtx && (
              <div style={{ border: `1px solid ${cardBorder}`, borderRadius: 4, padding: 18, background: cardBg }}>
                <p className="section-label">All Captured Features</p>
                <div style={{ maxHeight: 260, overflowY: "auto" }}>
                  {Object.entries(predCtx.features).map(([k, v]) => (
                    <div key={k} className="feat-row" style={{ borderColor: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)" }}>
                      <span style={{ opacity: 0.5 }}>{FIELD_LABELS[k] || k}</span>
                      <span style={{ fontWeight: 500 }}>{v.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Example queries */}
            <div style={{ border: `1px solid ${cardBorder}`, borderRadius: 4, padding: 20, background: cardBg }}>
              <p className="section-label">{predCtx ? "Or Try a Manual Query" : "Example Queries"}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {EXAMPLE_QUERIES.map((q) => (
                  <button key={q} className="example-chip"
                    onClick={() => useExample(q)}
                    style={{ borderColor: cardBorder, color: dark ? "#a0aec0" : "#4a5568", textAlign: "left" }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Pipeline */}
            <div style={{ border: `1px solid ${cardBorder}`, borderRadius: 4, padding: 20, background: cardBg }}>
              <p className="section-label">Pipeline</p>
              {[
                { step: "1", label: "Query embedding", tech: "MiniLM-L3-v2" },
                { step: "2", label: "Vector search",   tech: "FAISS (k=2)" },
                { step: "3", label: "Context retrieval", tech: "LangChain" },
                { step: "4", label: "Report generation", tech: "LLaMA3" },
              ].map((s) => (
                <div key={s.step} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"}` }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: dark ? "rgba(99,255,180,0.1)" : "rgba(15,122,78,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: accent, flexShrink: 0 }}>
                    {s.step}
                  </span>
                  <div>
                    <div style={{ fontSize: 12 }}>{s.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.4 }}>{s.tech}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* History */}
            {history.length > 0 && (
              <div style={{ border: `1px solid ${cardBorder}`, borderRadius: 4, padding: 20, background: cardBg }}>
                <p className="section-label">Recent Queries</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {history.map((h, i) => (
                    <div key={i} className="hist-item"
                      onClick={() => { setQuery(h.query); setResult(h); setPredCtx(null); }}
                      style={{ borderColor: cardBorder, background: "transparent" }}>
                      <div style={{ fontSize: 11, lineHeight: 1.5, opacity: 0.6 }}>
                        {h.query.length > 60 ? h.query.slice(0, 60) + "..." : h.query}
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