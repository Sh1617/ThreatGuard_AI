"use client";

import { useState } from "react";
import { useTheme } from "../components/theme-context";
import Navbar from "../components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AnalyzeResult {
  query: string;
  report: string;
}

const EXAMPLE_QUERIES = [
  "How to detect port scanning attacks?",
  "What indicators suggest a DDoS attack is underway?",
  "How do botnets communicate with command and control servers?",
  "What are the mitigation strategies for web application attacks?",
  "Explain the difference between DDoS and botnet attacks.",
  "What MITRE ATT&CK techniques are used in network-based attacks?",
];

export default function AnalyzePage() {
  const { dark } = useTheme();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalyzeResult[]>([]);

  const accent = dark ? "#63ffb4" : "#0f7a4e";
  const cardBorder = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)";
  const cardBg = dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)";

  const handleSubmit = async (q?: string) => {
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
    }
  };

  const useExample = (q: string) => {
    setQuery(q);
    handleSubmit(q);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .section-label { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.45; margin-bottom: 14px; font-family: 'IBM Plex Mono', monospace; }
        .query-input { width: 100%; background: ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}; border: 1px solid ${cardBorder}; border-radius: 4px; padding: 14px 16px; font-size: 14px; font-family: 'IBM Plex Mono', monospace; color: inherit; outline: none; resize: vertical; min-height: 100px; transition: border-color 0.15s; line-height: 1.7; }
        .query-input:focus { border-color: ${accent}; }
        .query-input::placeholder { opacity: 0.35; }
        .submit-btn { padding: 12px 28px; border-radius: 4px; border: none; font-family: 'IBM Plex Mono', monospace; font-size: 13px; letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s; font-weight: 500; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .example-chip { font-family: 'IBM Plex Mono', monospace; font-size: 11px; padding: 6px 14px; border-radius: 20px; border: 1px solid; cursor: pointer; background: transparent; transition: all 0.15s; text-align: left; }
        .example-chip:hover { opacity: 0.8; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .report-card { animation: fadeIn 0.4s ease; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
        .cursor { display: inline-block; width: 8px; height: 14px; background: ${accent}; animation: blink 1s infinite; vertical-align: -2px; margin-left: 2px; }
        .report-text { font-size: 14px; line-height: 1.85; white-space: pre-wrap; font-family: 'Space Grotesk', sans-serif; opacity: 0.85; }
        .hist-item { padding: 12px 16px; border-radius: 4px; border: 1px solid; cursor: pointer; transition: all 0.15s; }
        .hist-item:hover { opacity: 0.8; }
      `}</style>

      <Navbar />

      <main style={{ paddingTop: 80, paddingBottom: 60, paddingLeft: 40, paddingRight: 40, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginTop: 20, marginBottom: 32 }}>
          <p className="section-label">RAG Investigation Engine — POST /analyze</p>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Threat Analyzer
          </h1>
          <p style={{ fontSize: 13, opacity: 0.55, marginTop: 8, maxWidth: 560 }}>
            Ask any cybersecurity question. The RAG pipeline retrieves relevant threat intelligence from the knowledge base,
            then LLaMA3 generates a professional investigation report.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
          {/* Main column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Query input */}
            <div style={{ border: `1px solid ${cardBorder}`, borderRadius: 4, padding: 24, background: cardBg }}>
              <p className="section-label">Investigation Query</p>
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
                  style={{
                    background: dark ? "#63ffb4" : "#0f7a4e",
                    color: dark ? "#080c10" : "#fff",
                  }}
                >
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
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

            {/* Loading state */}
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

            {/* Result */}
            {result && !loading && (
              <div
                className="report-card"
                style={{
                  border: `1px solid ${dark ? "rgba(99,255,180,0.12)" : "rgba(15,122,78,0.15)"}`,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "14px 24px",
                    borderBottom: `1px solid ${dark ? "rgba(99,255,180,0.08)" : "rgba(15,122,78,0.08)"}`,
                    background: dark ? "rgba(99,255,180,0.04)" : "rgba(15,122,78,0.04)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10,9 9,9 8,9" />
                    </svg>
                    <span style={{ fontSize: 12, color: accent, letterSpacing: "0.08em" }}>INVESTIGATION REPORT</span>
                  </div>
                  <span style={{ fontSize: 11, opacity: 0.4 }}>LLaMA3 · FAISS RAG</span>
                </div>

                <div style={{ padding: "20px 24px", background: cardBg }}>
                  <div style={{ fontSize: 12, opacity: 0.4, marginBottom: 12, fontStyle: "italic" }}>
                    Query: "{result.query}"
                  </div>
                  <div className="report-text">{result.report}</div>
                </div>

                <div
                  style={{
                    padding: "10px 24px",
                    borderTop: `1px solid ${cardBorder}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 11,
                    opacity: 0.4,
                  }}
                >
                  <span>Generated by LLaMA3 via Ollama</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.report);
                    }}
                    style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 11, color: "inherit", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.06em", opacity: 0.7 }}
                  >
                    [ copy report ]
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Example queries */}
            <div style={{ border: `1px solid ${cardBorder}`, borderRadius: 4, padding: 20, background: cardBg }}>
              <p className="section-label">Example Queries</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {EXAMPLE_QUERIES.map((q) => (
                  <button
                    key={q}
                    className="example-chip"
                    onClick={() => useExample(q)}
                    style={{
                      borderColor: cardBorder,
                      color: dark ? "#a0aec0" : "#4a5568",
                      textAlign: "left",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Pipeline info */}
            <div style={{ border: `1px solid ${cardBorder}`, borderRadius: 4, padding: 20, background: cardBg }}>
              <p className="section-label">Pipeline</p>
              {[
                { step: "1", label: "Query embedding", tech: "MiniLM-L3-v2" },
                { step: "2", label: "Vector search", tech: "FAISS (k=2)" },
                { step: "3", label: "Context retrieval", tech: "LangChain" },
                { step: "4", label: "Report generation", tech: "LLaMA3" },
              ].map((s) => (
                <div key={s.step} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"}` }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: dark ? "rgba(99,255,180,0.1)" : "rgba(15,122,78,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: accent, flexShrink: 0 }}>{s.step}</span>
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
                    <div
                      key={i}
                      className="hist-item"
                      onClick={() => { setQuery(h.query); setResult(h); }}
                      style={{ borderColor: cardBorder, background: "transparent" }}
                    >
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