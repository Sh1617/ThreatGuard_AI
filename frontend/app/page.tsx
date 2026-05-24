"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggle = () => setDark((d) => !d);

  if (!mounted) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: dark ? "#080c10" : "#f0f2f5",
        color: dark ? "#e2e8f0" : "#1a202c",
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        transition: "background 0.3s ease, color 0.3s ease",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .nav-link {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-decoration: none;
          opacity: 0.6;
          transition: opacity 0.2s;
          cursor: pointer;
        }
        .nav-link:hover { opacity: 1; }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 2px;
          font-family: 'IBM Plex Mono', monospace;
        }

        .dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .hero-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }

        .stat-number {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 36px;
          font-weight: 600;
          letter-spacing: -0.02em;
        }

        .feature-card {
          border: 1px solid;
          border-radius: 4px;
          padding: 28px 24px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 3px; height: 100%;
        }
        .feature-card:hover {
          transform: translateY(-2px);
        }

        .tech-tag {
          display: inline-block;
          font-size: 11px;
          font-family: 'IBM Plex Mono', monospace;
          padding: 3px 10px;
          border-radius: 2px;
          letter-spacing: 0.06em;
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-family: 'IBM Plex Mono', monospace;
          letter-spacing: 0.08em;
          padding: 8px 16px;
          border-radius: 3px;
          border: 1px solid;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
        }

        .cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.08em;
          padding: 14px 28px;
          border-radius: 3px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .cta-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.08em;
          padding: 14px 28px;
          border-radius: 3px;
          border: 1px solid;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          text-decoration: none;
        }

        .terminal-block {
          border-radius: 6px;
          overflow: hidden;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
        }

        .terminal-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
        }

        .terminal-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
        }

        .terminal-body {
          padding: 20px 20px;
          line-height: 1.8;
        }

        .attack-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid;
          font-size: 12px;
          font-family: 'IBM Plex Mono', monospace;
        }
        .attack-row:last-child { border-bottom: none; }

        .severity {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 2px;
        }

        .grid-bg {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(99,255,180,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,255,180,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .section-label {
          font-size: 11px;
          font-family: 'IBM Plex Mono', monospace;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 36px !important; }
          .hide-mobile { display: none !important; }
          .stack-mobile { flex-direction: column !important; }
          .full-mobile { width: 100% !important; }
          .stat-number { font-size: 28px; }
        }
      `}</style>

      {/* Navbar */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          borderBottom: `1px solid ${dark ? "rgba(99,255,180,0.08)" : "rgba(0,0,0,0.08)"}`,
          background: dark ? "rgba(8,12,16,0.92)" : "rgba(240,242,245,0.92)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          height: 60,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L4 6v6c0 5.25 3.4 10.15 8 11.35C16.6 22.15 20 17.25 20 12V6l-8-4z"
              stroke={dark ? "#63ffb4" : "#0f7a4e"}
              strokeWidth="1.5"
              fill={dark ? "rgba(99,255,180,0.1)" : "rgba(15,122,78,0.1)"}
            />
            <path d="M9 12l2 2 4-4" stroke={dark ? "#63ffb4" : "#0f7a4e"} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em" }}>
            ThreatGuard<span style={{ color: dark ? "#63ffb4" : "#0f7a4e" }}>AI</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="hide-mobile">
          {["Features", "Architecture", "Tech Stack", "Demo"].map((l) => (
            <a key={l} className="nav-link" style={{ color: dark ? "#e2e8f0" : "#1a202c" }}>
              {l}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a
            href="https://github.com"
            className="nav-link"
            style={{ color: dark ? "#e2e8f0" : "#1a202c" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>
          <button
            className="toggle-btn"
            onClick={toggle}
            style={{
              borderColor: dark ? "rgba(99,255,180,0.25)" : "rgba(0,0,0,0.2)",
              color: dark ? "#63ffb4" : "#0f7a4e",
            }}
          >
            {dark ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
            {dark ? "LIGHT" : "DARK"}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ position: "relative", paddingTop: 140, paddingBottom: 80, paddingLeft: 40, paddingRight: 40, overflow: "hidden" }}>
        {dark && <div className="grid-bg" />}
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
          <div style={{ marginBottom: 24 }}>
            <span
              className="badge"
              style={{
                background: dark ? "rgba(99,255,180,0.08)" : "rgba(15,122,78,0.08)",
                border: `1px solid ${dark ? "rgba(99,255,180,0.2)" : "rgba(15,122,78,0.2)"}`,
                color: dark ? "#63ffb4" : "#0f7a4e",
              }}
            >
              <span className="dot" style={{ background: dark ? "#63ffb4" : "#0f7a4e" }} />
              AI-Powered Threat Intelligence
            </span>
          </div>

          <div style={{ display: "flex", gap: 60, alignItems: "flex-start" }} className="stack-mobile">
            <div style={{ flex: 1 }}>
              <h1
                className="hero-title"
                style={{
                  fontSize: 64,
                  color: dark ? "#f0f4f8" : "#0d1117",
                  marginBottom: 24,
                }}
              >
                Detect threats
                <br />
                <span style={{ color: dark ? "#63ffb4" : "#0f7a4e" }}>before they hit.</span>
              </h1>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 18,
                  lineHeight: 1.7,
                  opacity: 0.65,
                  maxWidth: 480,
                  marginBottom: 36,
                }}
              >
                ThreatGuard AI combines XGBoost classification, RAG-powered investigation reports,
                and LLaMA3 to identify DDoS, Botnets, Port Scans, and Web Attacks in real time.
              </p>

              <div style={{ display: "flex", gap: 14 }} className="stack-mobile">
                <a
                  href="https://github.com"
                  className="cta-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: dark ? "#63ffb4" : "#0f7a4e",
                    color: dark ? "#080c10" : "#fff",
                    fontWeight: 500,
                  }}
                >
                  View on GitHub ↗
                </a>
                <button
                  className="cta-secondary"
                  style={{
                    borderColor: dark ? "rgba(99,255,180,0.25)" : "rgba(0,0,0,0.2)",
                    color: dark ? "#e2e8f0" : "#1a202c",
                  }}
                >
                  Live Demo →
                </button>
              </div>
            </div>

            {/* Terminal Mock */}
            <div style={{ width: 380, flexShrink: 0 }} className="full-mobile">
              <div className="terminal-block" style={{ border: `1px solid ${dark ? "rgba(99,255,180,0.12)" : "rgba(0,0,0,0.1)"}` }}>
                <div
                  className="terminal-header"
                  style={{ background: dark ? "#0d1117" : "#e2e8f0", borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)"}` }}
                >
                  <div className="terminal-dot" style={{ background: "#ff5f57" }} />
                  <div className="terminal-dot" style={{ background: "#febc2e" }} />
                  <div className="terminal-dot" style={{ background: "#28c840" }} />
                  <span style={{ fontSize: 11, opacity: 0.4, marginLeft: 8, letterSpacing: "0.08em" }}>
                    threatguard_api — POST /predict
                  </span>
                </div>
                <div
                  className="terminal-body"
                  style={{ background: dark ? "#0a0f14" : "#f8f9fa", color: dark ? "#7ee8a2" : "#1a6640" }}
                >
                  <div><span style={{ opacity: 0.4 }}>$ </span>curl -X POST /api/predict \</div>
                  <div style={{ paddingLeft: 16, opacity: 0.7 }}>-H "Content-Type: application/json" \</div>
                  <div style={{ paddingLeft: 16, opacity: 0.7 }}>-d &#123;"flow_duration": 1200, ...&#125;</div>
                  <div style={{ marginTop: 12, opacity: 0.5 }}>→ analyzing traffic patterns...</div>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ opacity: 0.5 }}>response: </span>
                    <span style={{ color: dark ? "#63ffb4" : "#0f7a4e" }}>&#123;</span>
                  </div>
                  <div style={{ paddingLeft: 16 }}>
                    <span style={{ opacity: 0.5 }}>"prediction": </span>
                    <span style={{ color: dark ? "#ffd580" : "#996600" }}>"DDoS"</span>,
                  </div>
                  <div style={{ paddingLeft: 16 }}>
                    <span style={{ opacity: 0.5 }}>"confidence": </span>
                    <span>0.97</span>,
                  </div>
                  <div style={{ paddingLeft: 16 }}>
                    <span style={{ opacity: 0.5 }}>"severity": </span>
                    <span style={{ color: dark ? "#ff6b6b" : "#cc0000" }}>"HIGH"</span>
                  </div>
                  <div><span style={{ color: dark ? "#63ffb4" : "#0f7a4e" }}>&#125;</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1,
              marginTop: 64,
              borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
              paddingTop: 40,
            }}
            className="stack-mobile"
          >
            {[
              { val: "4", label: "Attack types detected" },
              { val: "97%", label: "Classification accuracy" },
              { val: "RAG", label: "Investigation pipeline" },
              { val: "LLaMA3", label: "Powered by local LLM" },
            ].map((s) => (
              <div key={s.label} style={{ paddingRight: 32 }}>
                <div className="stat-number" style={{ color: dark ? "#63ffb4" : "#0f7a4e" }}>
                  {s.val}
                </div>
                <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4, letterSpacing: "0.04em" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Attack types */}
      <section
        style={{
          padding: "60px 40px",
          borderTop: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)"}`,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p className="section-label">Threat Detection</p>
          <div style={{ display: "flex", gap: 24, marginBottom: 32, alignItems: "flex-end" }} className="stack-mobile">
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                flex: 1,
              }}
            >
              Four attack categories, one model.
            </h2>
          </div>

          <div style={{ borderRadius: 6, overflow: "hidden", border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)"}` }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr",
                padding: "8px 20px",
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                opacity: 0.4,
                borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
                background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
              }}
            >
              <span>Attack Type</span>
              <span>Severity</span>
              <span>Indicators</span>
              <span>Status</span>
            </div>

            {[
              { type: "DDoS Attack", sev: "HIGH", sevColor: dark ? "#ff6b6b" : "#cc0000", sevBg: dark ? "rgba(255,107,107,0.1)" : "rgba(204,0,0,0.08)", indicators: "Volumetric floods, SYN/UDP storms", status: "ACTIVE" },
              { type: "Botnet", sev: "HIGH", sevColor: dark ? "#ff6b6b" : "#cc0000", sevBg: dark ? "rgba(255,107,107,0.1)" : "rgba(204,0,0,0.08)", indicators: "C&C comms, beaconing, distributed activity", status: "ACTIVE" },
              { type: "Port Scan", sev: "MEDIUM", sevColor: dark ? "#ffd580" : "#996600", sevBg: dark ? "rgba(255,213,128,0.1)" : "rgba(153,102,0,0.08)", indicators: "Sequential port probing, half-open connections", status: "ACTIVE" },
              { type: "Web Attack", sev: "HIGH", sevColor: dark ? "#ff6b6b" : "#cc0000", sevBg: dark ? "rgba(255,107,107,0.1)" : "rgba(204,0,0,0.08)", indicators: "SQLi, XSS, path traversal, anomalous HTTP", status: "ACTIVE" },
            ].map((row, i) => (
              <div
                key={row.type}
                className="attack-row"
                style={{
                  borderColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)",
                  padding: "16px 20px",
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  background: i % 2 === 0 ? "transparent" : dark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: 500, fontSize: 14 }}>{row.type}</span>
                <span
                  className="severity"
                  style={{
                    color: row.sevColor,
                    background: row.sevBg,
                    display: "inline-block",
                    width: "fit-content",
                  }}
                >
                  {row.sev}
                </span>
                <span style={{ fontSize: 12, opacity: 0.55 }}>{row.indicators}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                  <span className="dot" style={{ background: dark ? "#63ffb4" : "#0f7a4e", width: 5, height: 5 }} />
                  <span style={{ color: dark ? "#63ffb4" : "#0f7a4e" }}>{row.status}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          padding: "60px 40px",
          borderTop: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)"}`,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p className="section-label">Core Capabilities</p>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 36 }}>
            Built for real threat intelligence.
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {[
              {
                icon: "🎯",
                title: "XGBoost Classifier",
                desc: "Multi-class attack detection trained on network traffic features. Classifies DDoS, Botnet, Port Scan, and Web Attacks with high precision.",
                accent: dark ? "#63ffb4" : "#0f7a4e",
                accentBg: dark ? "rgba(99,255,180,0.04)" : "rgba(15,122,78,0.04)",
              },
              {
                icon: "🔍",
                title: "RAG Investigation Pipeline",
                desc: "Retrieval-Augmented Generation with FAISS vector store. Searches curated threat intelligence knowledge base to enrich every detection.",
                accent: dark ? "#7dd3fc" : "#0369a1",
                accentBg: dark ? "rgba(125,211,252,0.04)" : "rgba(3,105,161,0.04)",
              },
              {
                icon: "🤖",
                title: "LLaMA3 Report Generation",
                desc: "Local LLM via Ollama generates professional cybersecurity investigation reports. No data leaves your infrastructure.",
                accent: dark ? "#c4b5fd" : "#5b21b6",
                accentBg: dark ? "rgba(196,181,253,0.04)" : "rgba(91,33,182,0.04)",
              },
              {
                icon: "⚡",
                title: "FastAPI Backend",
                desc: "High-performance REST API with endpoints for prediction, analysis, and health monitoring. Fully documented with OpenAPI schema.",
                accent: dark ? "#fda4af" : "#9f1239",
                accentBg: dark ? "rgba(253,164,175,0.04)" : "rgba(159,18,57,0.04)",
              },
              {
                icon: "🧬",
                title: "FAISS Vector Search",
                desc: "Efficient similarity search over threat intelligence documents using HuggingFace MiniLM-L3-v2 embeddings for contextual retrieval.",
                accent: dark ? "#fcd34d" : "#92400e",
                accentBg: dark ? "rgba(252,211,77,0.04)" : "rgba(146,64,14,0.04)",
              },
              {
                icon: "🛡️",
                title: "Next.js Dashboard",
                desc: "Modern React frontend with server-side rendering, real-time threat visualization, and a clean, responsive interface for security analysts.",
                accent: dark ? "#63ffb4" : "#0f7a4e",
                accentBg: dark ? "rgba(99,255,180,0.04)" : "rgba(15,122,78,0.04)",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="feature-card"
                style={{
                  borderColor: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)",
                  background: f.accentBg,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0, left: 0,
                    width: 3, height: "100%",
                    background: f.accent,
                    opacity: 0.6,
                  }}
                />
                <div style={{ fontSize: 24, marginBottom: 14 }}>{f.icon}</div>
                <h3
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: 16,
                    marginBottom: 10,
                    color: f.accent,
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section
        style={{
          padding: "60px 40px",
          borderTop: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)"}`,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p className="section-label">Tech Stack</p>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 36 }}>
            Full-stack, production-ready.
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {[
              { layer: "FRONTEND", items: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS"] },
              { layer: "BACKEND", items: ["FastAPI", "Python 3.11", "Pydantic", "Uvicorn"] },
              { layer: "ML MODEL", items: ["XGBoost", "scikit-learn", "joblib", "pandas"] },
              { layer: "AI / RAG", items: ["LLaMA3 (Ollama)", "LangChain", "FAISS", "MiniLM-L3-v2"] },
            ].map((stack) => (
              <div
                key={stack.layer}
                style={{
                  border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)"}`,
                  borderRadius: 4,
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.15em",
                    marginBottom: 14,
                    color: dark ? "#63ffb4" : "#0f7a4e",
                    fontWeight: 600,
                  }}
                >
                  {stack.layer}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {stack.items.map((item) => (
                    <span
                      key={item}
                      className="tech-tag"
                      style={{
                        background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)",
                        color: dark ? "#a0aec0" : "#4a5568",
                        border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section
        style={{
          padding: "60px 40px",
          borderTop: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)"}`,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p className="section-label">Architecture</p>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 36 }}>
            How it works.
          </h2>

          <div style={{ display: "flex", gap: 0, alignItems: "center", overflowX: "auto", paddingBottom: 8 }}>
            {[
              { step: "01", title: "Network Traffic", desc: "Raw network flow features as input" },
              { step: "02", title: "XGBoost Model", desc: "Multi-class attack classification" },
              { step: "03", title: "FAISS Lookup", desc: "Semantic search in threat knowledge base" },
              { step: "04", title: "LLaMA3 LLM", desc: "Context-aware report generation" },
              { step: "05", title: "Investigation Report", desc: "Professional threat analysis output" },
            ].map((s, i, arr) => (
              <div key={s.step} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <div
                  style={{
                    width: 160,
                    padding: "20px 16px",
                    border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)"}`,
                    borderRadius: 4,
                    background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                  }}
                >
                  <div style={{ fontSize: 11, opacity: 0.35, marginBottom: 6, letterSpacing: "0.1em" }}>{s.step}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, fontFamily: "'Space Grotesk', sans-serif" }}>{s.title}</div>
                  <div style={{ fontSize: 11, opacity: 0.5, lineHeight: 1.5 }}>{s.desc}</div>
                </div>
                {i < arr.length - 1 && (
                  <div
                    style={{
                      width: 32,
                      textAlign: "center",
                      fontSize: 16,
                      opacity: 0.3,
                      flexShrink: 0,
                    }}
                  >
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / CTA */}
      <section
        style={{
          padding: "60px 40px",
          borderTop: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)"}`,
          background: dark ? "rgba(99,255,180,0.02)" : "rgba(15,122,78,0.02)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }} className="stack-mobile">
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
              Explore the source code.
            </div>
            <p style={{ opacity: 0.5, fontSize: 14 }}>Open-source AI cybersecurity project built for portfolio & learning.</p>
          </div>
          <div style={{ display: "flex", gap: 12 }} className="stack-mobile">
            <a
              href="https://github.com"
              className="cta-primary"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: dark ? "#63ffb4" : "#0f7a4e",
                color: dark ? "#080c10" : "#fff",
                fontWeight: 500,
              }}
            >
              GitHub Repo ↗
            </a>
            <button
              className="cta-secondary"
              style={{
                borderColor: dark ? "rgba(99,255,180,0.25)" : "rgba(0,0,0,0.2)",
                color: dark ? "#e2e8f0" : "#1a202c",
              }}
            >
              API Docs →
            </button>
          </div>
        </div>

        <div
          style={{
            maxWidth: 1100,
            margin: "40px auto 0",
            paddingTop: 24,
            borderTop: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)"}`,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            opacity: 0.35,
          }}
          className="stack-mobile"
        >
          <span>ThreatGuard AI — Portfolio Project</span>
          <span>FastAPI · Next.js · XGBoost · FAISS · LLaMA3</span>
        </div>
      </section>
    </div>
  );
}