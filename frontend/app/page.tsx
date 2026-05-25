"use client";

import Link from "next/link";
import { useTheme } from "./components/theme-context";
import Navbar from "./components/Navbar";

const GITHUB_URL = "https://github.com/Sh1617/ThreatGuard_AI";

export default function Home() {
  const { dark } = useTheme();

  return (
    <div
      style={{
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

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
          transition: transform 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .feature-card:hover { transform: translateY(-2px); }

        .tech-tag {
          display: inline-block;
          font-size: 11px;
          font-family: 'IBM Plex Mono', monospace;
          padding: 3px 10px;
          border-radius: 2px;
          letter-spacing: 0.06em;
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
        .cta-primary:hover { opacity: 0.9; transform: translateY(-1px); }

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
        .cta-secondary:hover { opacity: 0.8; }

        .terminal-block {
          border-radius: 6px;
          overflow: hidden;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
        }

        .terminal-dot { width: 10px; height: 10px; border-radius: 50%; }

        .attack-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          align-items: center;
          padding: 16px 20px;
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
          display: inline-block;
          width: fit-content;
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
          .attack-row { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* ── Shared Navbar (has real Link routing + theme toggle) ── */}
      <Navbar />

      {/* ── Hero ── */}
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
                style={{ fontSize: 64, color: dark ? "#f0f4f8" : "#0d1117", marginBottom: 24 }}
              >
                Detect threats
                <br />
                <span style={{ color: dark ? "#63ffb4" : "#0f7a4e" }}>before they hit.</span>
              </h1>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, lineHeight: 1.7, opacity: 0.65, maxWidth: 480, marginBottom: 36 }}>
                ThreatGuard AI combines XGBoost classification, RAG-powered investigation reports,
                and LLaMA3 to identify DDoS, Botnets, Port Scans, and Web Attacks in real time.
              </p>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <a
                  href={GITHUB_URL}
                  className="cta-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: dark ? "#63ffb4" : "#0f7a4e", color: dark ? "#080c10" : "#fff", fontWeight: 500 }}
                >
                  View on GitHub ↗
                </a>
                <Link
                  href="/predict"
                  className="cta-secondary"
                  style={{ borderColor: dark ? "rgba(99,255,180,0.25)" : "rgba(0,0,0,0.2)", color: dark ? "#e2e8f0" : "#1a202c" }}
                >
                  Live Demo →
                </Link>
              </div>
            </div>

            {/* Terminal Mock */}
            <div style={{ width: 380, flexShrink: 0 }} className="full-mobile">
              <div className="terminal-block" style={{ border: `1px solid ${dark ? "rgba(99,255,180,0.12)" : "rgba(0,0,0,0.1)"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: dark ? "#0d1117" : "#e2e8f0", borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)"}` }}>
                  <div className="terminal-dot" style={{ background: "#ff5f57" }} />
                  <div className="terminal-dot" style={{ background: "#febc2e" }} />
                  <div className="terminal-dot" style={{ background: "#28c840" }} />
                  <span style={{ fontSize: 11, opacity: 0.4, marginLeft: 8, letterSpacing: "0.08em" }}>
                    threatguard_api — POST /predict
                  </span>
                </div>
                <div style={{ padding: "20px", lineHeight: 1.8, background: dark ? "#0a0f14" : "#f8f9fa", color: dark ? "#7ee8a2" : "#1a6640" }}>
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

          {/* Stats */}
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, marginTop: 64, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`, paddingTop: 40 }}
            className="stack-mobile"
          >
            {[
              { val: "4", label: "Attack types detected" },
              { val: "97%", label: "Classification accuracy" },
              { val: "RAG", label: "Investigation pipeline" },
              { val: "LLaMA3", label: "Powered by local LLM" },
            ].map((s) => (
              <div key={s.label} style={{ paddingRight: 32 }}>
                <div className="stat-number" style={{ color: dark ? "#63ffb4" : "#0f7a4e" }}>{s.val}</div>
                <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4, letterSpacing: "0.04em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Nav Cards ── */}
      <section style={{ padding: "40px 40px 20px", borderTop: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)"}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p className="section-label">Explore the platform</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {[
              { href: "/dashboard", label: "Dashboard", desc: "System health & model status", icon: "📊" },
              { href: "/predict", label: "Predict", desc: "Classify network traffic with XGBoost", icon: "🎯" },
              { href: "/analyze", label: "Analyze", desc: "RAG + LLaMA3 threat investigation", icon: "🔍" },
              { href: "/threats", label: "Threats", desc: "Browse the threat knowledge base", icon: "🛡️" },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                style={{
                  display: "block",
                  border: `1px solid ${dark ? "rgba(99,255,180,0.12)" : "rgba(15,122,78,0.15)"}`,
                  borderRadius: 4,
                  padding: "18px 20px",
                  textDecoration: "none",
                  background: dark ? "rgba(99,255,180,0.03)" : "rgba(15,122,78,0.03)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <div style={{ fontSize: 20, marginBottom: 8 }}>{card.icon}</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, color: dark ? "#63ffb4" : "#0f7a4e", marginBottom: 4 }}>
                  {card.label}
                </div>
                <div style={{ fontSize: 12, opacity: 0.5, lineHeight: 1.5 }}>{card.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Attack Types Table ── */}
      <section style={{ padding: "60px 40px", borderTop: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)"}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p className="section-label">Threat Detection</p>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 32 }}>
            Four attack categories, one model.
          </h2>

          <div style={{ borderRadius: 6, overflow: "hidden", border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)"}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "8px 20px", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.4, borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
              <span>Attack Type</span><span>Severity</span><span>Indicators</span><span>Status</span>
            </div>

            {[
              { type: "DDoS Attack", sev: "HIGH", sevColor: dark ? "#ff6b6b" : "#cc0000", sevBg: dark ? "rgba(255,107,107,0.1)" : "rgba(204,0,0,0.08)", indicators: "Volumetric floods, SYN/UDP storms" },
              { type: "Botnet", sev: "HIGH", sevColor: dark ? "#ff6b6b" : "#cc0000", sevBg: dark ? "rgba(255,107,107,0.1)" : "rgba(204,0,0,0.08)", indicators: "C&C comms, beaconing, distributed activity" },
              { type: "Port Scan", sev: "MEDIUM", sevColor: dark ? "#ffd580" : "#996600", sevBg: dark ? "rgba(255,213,128,0.1)" : "rgba(153,102,0,0.08)", indicators: "Sequential port probing, half-open connections" },
              { type: "Web Attack", sev: "HIGH", sevColor: dark ? "#ff6b6b" : "#cc0000", sevBg: dark ? "rgba(255,107,107,0.1)" : "rgba(204,0,0,0.08)", indicators: "SQLi, XSS, path traversal, anomalous HTTP" },
            ].map((row, i) => (
              <div
                key={row.type}
                className="attack-row"
                style={{
                  borderColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)",
                  background: i % 2 === 0 ? "transparent" : dark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
                }}
              >
                <span style={{ fontWeight: 500, fontSize: 14 }}>{row.type}</span>
                <span className="severity" style={{ color: row.sevColor, background: row.sevBg }}>{row.sev}</span>
                <span style={{ fontSize: 12, opacity: 0.55 }}>{row.indicators}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                  <span className="dot" style={{ background: dark ? "#63ffb4" : "#0f7a4e", width: 5, height: 5 }} />
                  <span style={{ color: dark ? "#63ffb4" : "#0f7a4e" }}>ACTIVE</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "60px 40px", borderTop: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)"}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p className="section-label">Core Capabilities</p>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 36 }}>
            Built for real threat intelligence.
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {[
              { icon: "🎯", title: "XGBoost Classifier", desc: "Multi-class attack detection trained on network traffic features. Classifies DDoS, Botnet, Port Scan, and Web Attacks with high precision.", accent: dark ? "#63ffb4" : "#0f7a4e", accentBg: dark ? "rgba(99,255,180,0.04)" : "rgba(15,122,78,0.04)" },
              { icon: "🔍", title: "RAG Investigation Pipeline", desc: "Retrieval-Augmented Generation with FAISS vector store. Searches curated threat intelligence knowledge base to enrich every detection.", accent: dark ? "#7dd3fc" : "#0369a1", accentBg: dark ? "rgba(125,211,252,0.04)" : "rgba(3,105,161,0.04)" },
              { icon: "🤖", title: "LLaMA3 Report Generation", desc: "Local LLM via Ollama generates professional cybersecurity investigation reports. No data leaves your infrastructure.", accent: dark ? "#c4b5fd" : "#5b21b6", accentBg: dark ? "rgba(196,181,253,0.04)" : "rgba(91,33,182,0.04)" },
              { icon: "⚡", title: "FastAPI Backend", desc: "High-performance REST API with endpoints for prediction, analysis, and health monitoring. Fully documented with OpenAPI schema.", accent: dark ? "#fda4af" : "#9f1239", accentBg: dark ? "rgba(253,164,175,0.04)" : "rgba(159,18,57,0.04)" },
              { icon: "🧬", title: "FAISS Vector Search", desc: "Efficient similarity search over threat intelligence documents using HuggingFace MiniLM-L3-v2 embeddings for contextual retrieval.", accent: dark ? "#fcd34d" : "#92400e", accentBg: dark ? "rgba(252,211,77,0.04)" : "rgba(146,64,14,0.04)" },
              { icon: "🛡️", title: "Next.js Dashboard", desc: "Modern React frontend with server-side rendering, real-time threat visualization, and a clean, responsive interface for security analysts.", accent: dark ? "#63ffb4" : "#0f7a4e", accentBg: dark ? "rgba(99,255,180,0.04)" : "rgba(15,122,78,0.04)" },
            ].map((f) => (
              <div key={f.title} className="feature-card" style={{ borderColor: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)", background: f.accentBg }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: f.accent, opacity: 0.6 }} />
                <div style={{ fontSize: 24, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, marginBottom: 10, color: f.accent }}>{f.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.7, opacity: 0.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section style={{ padding: "60px 40px", borderTop: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)"}` }}>
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
              <div key={stack.layer} style={{ border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)"}`, borderRadius: 4, padding: "20px" }}>
                <div style={{ fontSize: 10, letterSpacing: "0.15em", marginBottom: 14, color: dark ? "#63ffb4" : "#0f7a4e", fontWeight: 600 }}>{stack.layer}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {stack.items.map((item) => (
                    <span key={item} className="tech-tag" style={{ background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)", color: dark ? "#a0aec0" : "#4a5568", border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture ── */}
      <section style={{ padding: "60px 40px", borderTop: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)"}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p className="section-label">Architecture</p>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 36 }}>How it works.</h2>
          <div style={{ display: "flex", gap: 0, alignItems: "center", overflowX: "auto", paddingBottom: 8 }}>
            {[
              { step: "01", title: "Network Traffic", desc: "Raw network flow features as input" },
              { step: "02", title: "XGBoost Model", desc: "Multi-class attack classification" },
              { step: "03", title: "FAISS Lookup", desc: "Semantic search in threat knowledge base" },
              { step: "04", title: "LLaMA3 LLM", desc: "Context-aware report generation" },
              { step: "05", title: "Investigation Report", desc: "Professional threat analysis output" },
            ].map((s, i, arr) => (
              <div key={s.step} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <div style={{ width: 160, padding: "20px 16px", border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)"}`, borderRadius: 4, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                  <div style={{ fontSize: 11, opacity: 0.35, marginBottom: 6, letterSpacing: "0.1em" }}>{s.step}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, fontFamily: "'Space Grotesk', sans-serif" }}>{s.title}</div>
                  <div style={{ fontSize: 11, opacity: 0.5, lineHeight: 1.5 }}>{s.desc}</div>
                </div>
                {i < arr.length - 1 && <div style={{ width: 32, textAlign: "center", fontSize: 16, opacity: 0.3, flexShrink: 0 }}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section style={{ padding: "60px 40px", borderTop: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)"}`, background: dark ? "rgba(99,255,180,0.02)" : "rgba(15,122,78,0.02)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>Explore the source code.</div>
            <p style={{ opacity: 0.5, fontSize: 14 }}>Open-source AI cybersecurity project built for portfolio & learning.</p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href={GITHUB_URL}
              className="cta-primary"
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: dark ? "#63ffb4" : "#0f7a4e", color: dark ? "#080c10" : "#fff", fontWeight: 500 }}
            >
              GitHub Repo ↗
            </a>
            <a
              href={`${GITHUB_URL}#readme`}
              className="cta-secondary"
              target="_blank"
              rel="noopener noreferrer"
              style={{ borderColor: dark ? "rgba(99,255,180,0.25)" : "rgba(0,0,0,0.2)", color: dark ? "#e2e8f0" : "#1a202c" }}
            >
              README →
            </a>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: "40px auto 0", paddingTop: 24, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.07)"}`, display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.35, flexWrap: "wrap", gap: 8 }}>
          <span>ThreatGuard AI — Portfolio Project</span>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>github.com/Sh1617/ThreatGuard_AI ↗</a>
        </div>
      </section>
    </div>
  );
}