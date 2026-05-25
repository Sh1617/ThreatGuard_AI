"use client";

import { useState, useEffect } from "react";
import { useTheme } from "../components/theme-context";
import Navbar from "../components/Navbar";

const API = "/api";  // proxied by next.config.ts → http://localhost:8000

interface HealthData {
  status: string;
  llm: string;
  vector_db: string;
  backend: string;
}

interface ModelInfo {
  model: string;
  embedding_model: string;
  llm: string;
  vector_database: string;
}

interface AttacksData {
  supported_attacks: string[];
}

export default function Dashboard() {
  const { dark } = useTheme();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [attacks, setAttacks] = useState<AttacksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string>("");

  const accent = dark ? "#63ffb4" : "#0f7a4e";
  const cardBorder = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)";
  const cardBg = dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)";
  const mutedText = dark ? "#718096" : "#718096";

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [h, m, a] = await Promise.all([
        fetch(`${API}/health`).then((r) => r.json()),
        fetch(`${API}/model-info`).then((r) => r.json()),
        fetch(`${API}/attacks`).then((r) => r.json()),
      ]);
      setHealth(h);
      setModelInfo(m);
      setAttacks(a);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch {
      setError("Cannot reach backend. Make sure the FastAPI server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const severityMap: Record<string, { label: string; color: string; bg: string }> = {
    DDoS: { label: "HIGH", color: dark ? "#ff6b6b" : "#cc0000", bg: dark ? "rgba(255,107,107,0.1)" : "rgba(204,0,0,0.07)" },
    Botnet: { label: "HIGH", color: dark ? "#ff6b6b" : "#cc0000", bg: dark ? "rgba(255,107,107,0.1)" : "rgba(204,0,0,0.07)" },
    PortScan: { label: "MEDIUM", color: dark ? "#ffd580" : "#996600", bg: dark ? "rgba(255,213,128,0.1)" : "rgba(153,102,0,0.07)" },
    WebAttack: { label: "HIGH", color: dark ? "#ff6b6b" : "#cc0000", bg: dark ? "rgba(255,107,107,0.1)" : "rgba(204,0,0,0.07)" },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .refresh-btn { display: flex; align-items: center; gap: 8px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.08em; padding: 8px 16px; border-radius: 3px; border: 1px solid; cursor: pointer; background: transparent; transition: all 0.2s; }
        .refresh-btn:hover { opacity: 0.8; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        .dot-pulse { animation: pulse 2s infinite; }
        .stat-card { border-radius: 4px; padding: 24px; border: 1px solid; }
        .section-label { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.45; margin-bottom: 14px; }
        .info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; font-size: 13px; border-bottom: 1px solid; }
        .info-row:last-child { border-bottom: none; }
        .badge { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 10px; border-radius: 2px; }
      `}</style>

      <Navbar />

      <main style={{ paddingTop: 80, paddingBottom: 60, paddingLeft: 40, paddingRight: 40, maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36, marginTop: 20 }}>
          <div>
            <p className="section-label">System Overview</p>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Dashboard
            </h1>
            {lastRefresh && (
              <p style={{ fontSize: 12, color: mutedText, marginTop: 6 }}>Last updated: {lastRefresh}</p>
            )}
          </div>
          <button
            className="refresh-btn"
            onClick={fetchAll}
            style={{ borderColor: dark ? "rgba(99,255,180,0.25)" : "rgba(0,0,0,0.2)", color: accent }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ animation: loading ? "spin 1s linear infinite" : "none" }}>
              <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            REFRESH
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ background: dark ? "rgba(255,107,107,0.08)" : "rgba(204,0,0,0.06)", border: `1px solid ${dark ? "rgba(255,107,107,0.2)" : "rgba(204,0,0,0.2)"}`, borderRadius: 4, padding: "14px 20px", marginBottom: 28, fontSize: 13, color: dark ? "#ff6b6b" : "#cc0000", display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            {error}
          </div>
        )}

        {/* Status cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 32 }}>
          {[
            {
              label: "API Status",
              value: loading ? "..." : health ? "Healthy" : "Offline",
              sub: health?.backend || "FastAPI",
              accent: !loading && health ? (dark ? "#63ffb4" : "#0f7a4e") : (dark ? "#ff6b6b" : "#cc0000"),
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              ),
            },
            {
              label: "LLM Model",
              value: loading ? "..." : health?.llm || modelInfo?.llm || "—",
              sub: "via Ollama",
              accent: dark ? "#c4b5fd" : "#5b21b6",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
                </svg>
              ),
            },
            {
              label: "Vector DB",
              value: loading ? "..." : health?.vector_db || "FAISS",
              sub: "MiniLM-L3-v2 embeddings",
              accent: dark ? "#7dd3fc" : "#0369a1",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12" /><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
                </svg>
              ),
            },
            {
              label: "ML Classifier",
              value: "XGBoost",
              sub: loading ? "..." : `${attacks?.supported_attacks?.length || 4} attack types`,
              accent: dark ? "#fda4af" : "#9f1239",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              ),
            },
          ].map((c) => (
            <div key={c.label} className="stat-card" style={{ borderColor: cardBorder, background: cardBg }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ color: c.accent }}>{c.icon}</div>
                <div className="dot-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: c.accent }} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em", color: c.accent, marginBottom: 4 }}>
                {c.value}
              </div>
              <div style={{ fontSize: 11, opacity: 0.45, letterSpacing: "0.06em" }}>{c.label}</div>
              <div style={{ fontSize: 11, marginTop: 4, opacity: 0.35 }}>{c.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Health Details */}
          <div style={{ border: `1px solid ${cardBorder}`, borderRadius: 4, padding: 24, background: cardBg }}>
            <p className="section-label">Health Check — GET /health</p>
            {loading ? (
              <div style={{ opacity: 0.4, fontSize: 13 }}>Fetching...</div>
            ) : health ? (
              <>
                {Object.entries(health).map(([k, v]) => (
                  <div key={k} className="info-row" style={{ borderColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)" }}>
                    <span style={{ opacity: 0.5, fontSize: 12, letterSpacing: "0.04em" }}>{k}</span>
                    <span
                      className="badge"
                      style={{
                        background: v === "healthy" ? (dark ? "rgba(99,255,180,0.1)" : "rgba(15,122,78,0.1)") : cardBg,
                        color: v === "healthy" ? accent : dark ? "#e2e8f0" : "#1a202c",
                        border: `1px solid ${v === "healthy" ? (dark ? "rgba(99,255,180,0.2)" : "rgba(15,122,78,0.2)") : cardBorder}`,
                      }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <div style={{ opacity: 0.4, fontSize: 13 }}>Backend offline</div>
            )}
          </div>

          {/* Model Info */}
          <div style={{ border: `1px solid ${cardBorder}`, borderRadius: 4, padding: 24, background: cardBg }}>
            <p className="section-label">Model Info — GET /model-info</p>
            {loading ? (
              <div style={{ opacity: 0.4, fontSize: 13 }}>Fetching...</div>
            ) : modelInfo ? (
              <>
                {Object.entries(modelInfo).map(([k, v]) => (
                  <div key={k} className="info-row" style={{ borderColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)" }}>
                    <span style={{ opacity: 0.5, fontSize: 12 }}>{k.replace(/_/g, " ")}</span>
                    <span style={{ fontSize: 13, textAlign: "right", maxWidth: 200 }}>{v}</span>
                  </div>
                ))}
              </>
            ) : (
              <div style={{ opacity: 0.4, fontSize: 13 }}>Backend offline</div>
            )}
          </div>

          {/* Supported Attacks */}
          <div style={{ border: `1px solid ${cardBorder}`, borderRadius: 4, padding: 24, background: cardBg, gridColumn: "1 / -1" }}>
            <p className="section-label">Detected Attack Types — GET /attacks</p>
            {loading ? (
              <div style={{ opacity: 0.4, fontSize: 13 }}>Fetching...</div>
            ) : attacks?.supported_attacks ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 4 }}>
                {attacks.supported_attacks.map((atk) => {
                  const sev = severityMap[atk] || { label: "UNKNOWN", color: mutedText, bg: cardBg };
                  return (
                    <div
                      key={atk}
                      style={{
                        border: `1px solid ${cardBorder}`,
                        borderRadius: 4,
                        padding: "14px 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: dark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="dot-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: sev.color }} />
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{atk}</span>
                      </div>
                      <span className="badge" style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.color}20` }}>
                        {sev.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ opacity: 0.4, fontSize: 13 }}>Backend offline</div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div style={{ marginTop: 28, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)"}`, paddingTop: 24, display: "flex", gap: 12 }}>
          {[
            { href: "/predict", label: "→ Run Prediction" },
            { href: "/analyze", label: "→ Analyze Threat" },
            { href: "/threats", label: "→ Browse Threats" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{
                fontSize: 12, letterSpacing: "0.08em", padding: "8px 16px", borderRadius: 3,
                border: `1px solid ${dark ? "rgba(99,255,180,0.2)" : "rgba(15,122,78,0.2)"}`,
                color: accent, textDecoration: "none", transition: "all 0.2s",
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      </main>
    </>
  );
}