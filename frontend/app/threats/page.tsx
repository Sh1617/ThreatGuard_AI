"use client";

import { useState } from "react";
import { useTheme } from "../components/theme-context";
import Navbar from "../components/Navbar";

const THREATS = [
  {
    id: "ddos",
    name: "DDoS Attack",
    severity: "HIGH",
    mitre: "T1498",
    mitreTitle: "Network Denial of Service",
    description:
      "Distributed Denial of Service attacks overwhelm a target system with massive traffic from multiple sources, rendering services unavailable to legitimate users.",
    indicators: [
      "Extremely high incoming traffic volume",
      "Repeated requests from many distributed IPs",
      "Slow or unresponsive network",
      "Service downtime and timeouts",
    ],
    impact: [
      "Server unavailability",
      "Network congestion",
      "Resource exhaustion",
    ],
    mitigation: [
      "Rate limiting on ingress traffic",
      "Web Application Firewall (WAF)",
      "CDN protection & traffic scrubbing",
      "Load balancing across infrastructure",
      "Traffic filtering and blackholing",
    ],
    color: { dark: "#ff6b6b", light: "#cc0000" },
    bgColor: { dark: "rgba(255,107,107,0.05)", light: "rgba(204,0,0,0.04)" },
    borderColor: { dark: "rgba(255,107,107,0.15)", light: "rgba(204,0,0,0.15)" },
  },
  {
    id: "botnet",
    name: "Botnet",
    severity: "HIGH",
    mitre: "T1071",
    mitreTitle: "Application Layer Protocol",
    description:
      "Botnets are networks of compromised devices (bots) controlled remotely by a threat actor through command-and-control (C2) infrastructure to perform coordinated malicious activities.",
    indicators: [
      "Command-and-control (C2) communication",
      "Unusual or persistent outbound traffic",
      "Repeated beaconing behavior at regular intervals",
      "Distributed malicious activity from many hosts",
    ],
    impact: [
      "DDoS attack amplification",
      "Spam and phishing campaigns",
      "Malware distribution",
      "Credential theft at scale",
    ],
    mitigation: [
      "Endpoint detection and response (EDR)",
      "Network segmentation",
      "Deep packet inspection for C2 traffic",
      "Threat intelligence feeds",
      "Device isolation and reimaging",
    ],
    color: { dark: "#fda4af", light: "#9f1239" },
    bgColor: { dark: "rgba(253,164,175,0.05)", light: "rgba(159,18,57,0.04)" },
    borderColor: { dark: "rgba(253,164,175,0.15)", light: "rgba(159,18,57,0.15)" },
  },
  {
    id: "portscan",
    name: "Port Scan",
    severity: "MEDIUM",
    mitre: "T1046",
    mitreTitle: "Network Service Discovery",
    description:
      "Port scanning is a reconnaissance technique used by attackers to identify open ports, running services, and potential vulnerabilities on a target system before launching an exploit.",
    indicators: [
      "Sequential connection attempts across port range",
      "High number of port probe requests",
      "Short-duration or half-open TCP connections",
      "Unusual scanning patterns from a single source",
    ],
    impact: [
      "Information gathering on target topology",
      "Exposure of vulnerable or misconfigured services",
      "Precursor to targeted exploitation",
    ],
    mitigation: [
      "Stateful firewall rules",
      "Intrusion Detection Systems (IDS/IPS)",
      "Port filtering and service minimization",
      "Rate limiting connection attempts",
      "Network flow monitoring and alerting",
    ],
    color: { dark: "#fcd34d", light: "#92400e" },
    bgColor: { dark: "rgba(252,211,77,0.05)", light: "rgba(146,64,14,0.04)" },
    borderColor: { dark: "rgba(252,211,77,0.15)", light: "rgba(146,64,14,0.15)" },
  },
  {
    id: "webattack",
    name: "Web Attack",
    severity: "HIGH",
    mitre: "T1190",
    mitreTitle: "Exploit Public-Facing Application",
    description:
      "Web attacks target web applications using malicious HTTP requests and payloads. Common types include SQL injection, cross-site scripting (XSS), command injection, brute force, and directory traversal.",
    indicators: [
      "Suspicious or malformed HTTP requests",
      "Unusual URL patterns and encoded payloads",
      "Repeated login attempts (brute force)",
      "Abnormal request body content",
    ],
    impact: [
      "Unauthorized access to application",
      "Data leakage and exfiltration",
      "Application compromise and RCE",
      "Credential theft",
    ],
    mitigation: [
      "Web Application Firewall (WAF)",
      "Input validation and sanitization",
      "Rate limiting on authentication endpoints",
      "Secure authentication (MFA, account lockout)",
      "HTTP request filtering and anomaly detection",
    ],
    color: { dark: "#86efac", light: "#166534" },
    bgColor: { dark: "rgba(134,239,172,0.05)", light: "rgba(22,101,52,0.04)" },
    borderColor: { dark: "rgba(134,239,172,0.15)", light: "rgba(22,101,52,0.15)" },
  },
];

export default function ThreatsPage() {
  const { dark } = useTheme();
  const [selected, setSelected] = useState<string>(THREATS[0].id);
  const [filter, setFilter] = useState<"ALL" | "HIGH" | "MEDIUM">("ALL");

  const accent = dark ? "#63ffb4" : "#0f7a4e";
  const cardBorder = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)";
  const cardBg = dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)";

  const filtered = filter === "ALL" ? THREATS : THREATS.filter((t) => t.severity === filter);
  const threat = THREATS.find((t) => t.id === selected) || THREATS[0];
  const threatColor = dark ? threat.color.dark : threat.color.light;
  const threatBg = dark ? threat.bgColor.dark : threat.bgColor.light;
  const threatBorder = dark ? threat.borderColor.dark : threat.borderColor.light;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .section-label { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.45; margin-bottom: 14px; font-family: 'IBM Plex Mono', monospace; }
        .threat-card { border: 1px solid; border-radius: 4px; padding: 16px 18px; cursor: pointer; transition: all 0.15s; }
        .threat-card:hover { transform: translateX(2px); }
        .filter-btn { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.08em; padding: 6px 14px; border-radius: 3px; border: 1px solid; cursor: pointer; background: transparent; transition: all 0.15s; }
        .info-section { margin-bottom: 24px; }
        .indicator-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid; font-size: 13px; line-height: 1.6; }
        .indicator-item:last-child { border-bottom: none; }
        .mit-item { display: flex; align-items: flex-start; gap: 10px; padding: 7px 0; font-size: 13px; line-height: 1.6; }
        .analyze-btn { display: inline-flex; align-items: center; gap: 8px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.08em; padding: 10px 20px; border-radius: 3px; border: 1px solid; cursor: pointer; background: transparent; transition: all 0.2s; text-decoration: none; }
        .analyze-btn:hover { opacity: 0.8; }
        @keyframes fadeSlide { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: translateX(0); } }
        .detail-panel { animation: fadeSlide 0.25s ease; }
      `}</style>

      <Navbar />

      <main style={{ paddingTop: 80, paddingBottom: 60, paddingLeft: 40, paddingRight: 40, maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginTop: 20, marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <p className="section-label">Knowledge Base</p>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Threat Library
            </h1>
            <p style={{ fontSize: 13, opacity: 0.55, marginTop: 8 }}>
              Four attack categories detected by ThreatGuard AI — indicators, impact, and mitigation.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {(["ALL", "HIGH", "MEDIUM"] as const).map((f) => (
              <button
                key={f}
                className="filter-btn"
                onClick={() => setFilter(f)}
                style={{
                  borderColor: filter === f ? accent : cardBorder,
                  color: filter === f ? accent : dark ? "#a0aec0" : "#4a5568",
                  background: filter === f ? (dark ? "rgba(99,255,180,0.08)" : "rgba(15,122,78,0.08)") : "transparent",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}>
          {/* Sidebar list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((t) => {
              const tc = dark ? t.color.dark : t.color.light;
              const isSelected = selected === t.id;
              return (
                <div
                  key={t.id}
                  className="threat-card"
                  onClick={() => setSelected(t.id)}
                  style={{
                    borderColor: isSelected ? (dark ? t.borderColor.dark : t.borderColor.light) : cardBorder,
                    background: isSelected ? (dark ? t.bgColor.dark : t.bgColor.light) : cardBg,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, color: isSelected ? tc : "inherit" }}>
                      {t.name}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.1em",
                        padding: "2px 8px",
                        borderRadius: 2,
                        background: dark ? t.bgColor.dark : t.bgColor.light,
                        color: tc,
                        border: `1px solid ${tc}30`,
                        flexShrink: 0,
                      }}
                    >
                      {t.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.4, letterSpacing: "0.06em" }}>
                    MITRE {t.mitre}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.35, marginTop: 4 }}>
                    {t.indicators.length} indicators · {t.mitigation.length} controls
                  </div>
                </div>
              );
            })}

            {/* Global stats */}
            <div style={{ border: `1px solid ${cardBorder}`, borderRadius: 4, padding: 16, background: cardBg, marginTop: 4 }}>
              <p className="section-label">Knowledge Base</p>
              <div style={{ fontSize: 12, opacity: 0.5, lineHeight: 2 }}>
                <div>4 attack categories</div>
                <div>Vector store: FAISS</div>
                <div>Embeddings: MiniLM-L3-v2</div>
                <div>Chunk size: 500 tokens</div>
                <div>Chunk overlap: 50</div>
              </div>
            </div>
          </div>

          {/* Detail panel */}
          <div key={threat.id} className="detail-panel">
            {/* Header */}
            <div
              style={{
                border: `1px solid ${threatBorder}`,
                borderRadius: 4,
                padding: "24px 28px",
                background: threatBg,
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.4, letterSpacing: "0.12em", marginBottom: 8 }}>
                    MITRE ATT&CK · {threat.mitre} · {threat.mitreTitle}
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 28,
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      color: threatColor,
                    }}
                  >
                    {threat.name}
                  </h2>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    padding: "6px 16px",
                    borderRadius: 3,
                    background: dark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.6)",
                    color: threatColor,
                    border: `1px solid ${threatBorder}`,
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  {threat.severity} SEVERITY
                </span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.75, opacity: 0.7, maxWidth: 640 }}>
                {threat.description}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Indicators */}
              <div style={{ border: `1px solid ${cardBorder}`, borderRadius: 4, padding: 22, background: cardBg }}>
                <p className="section-label">Detection Indicators</p>
                {threat.indicators.map((ind, i) => (
                  <div
                    key={i}
                    className="indicator-item"
                    style={{ borderColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)" }}
                  >
                    <div
                      style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: threatColor, flexShrink: 0, marginTop: 6,
                      }}
                    />
                    {ind}
                  </div>
                ))}
              </div>

              {/* Impact */}
              <div style={{ border: `1px solid ${cardBorder}`, borderRadius: 4, padding: 22, background: cardBg }}>
                <p className="section-label">Business Impact</p>
                {threat.impact.map((imp, i) => (
                  <div
                    key={i}
                    className="indicator-item"
                    style={{ borderColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)" }}
                  >
                    <div style={{ color: dark ? "#ff6b6b" : "#cc0000", flexShrink: 0, fontSize: 14, marginTop: 1 }}>!</div>
                    {imp}
                  </div>
                ))}
              </div>

              {/* Mitigation */}
              <div style={{ border: `1px solid ${cardBorder}`, borderRadius: 4, padding: 22, background: cardBg, gridColumn: "1 / -1" }}>
                <p className="section-label">Mitigation Controls</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                  {threat.mitigation.map((mit, i) => (
                    <div key={i} className="mit-item">
                      <div style={{ color: accent, flexShrink: 0, fontSize: 14, marginTop: 1 }}>✓</div>
                      <span style={{ fontSize: 13, opacity: 0.75 }}>{mit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action links */}
            <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
              <a
                href={`/analyze?q=Explain+${encodeURIComponent(threat.name)}+detection+and+mitigation`}
                className="analyze-btn"
                style={{ borderColor: threatBorder, color: threatColor }}
              >
                → Analyze with RAG
              </a>
              <a
                href="/predict"
                className="analyze-btn"
                style={{ borderColor: cardBorder, color: dark ? "#a0aec0" : "#4a5568" }}
              >
                → Run Prediction
              </a>
              <a
                href={`https://attack.mitre.org/techniques/${threat.mitre}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="analyze-btn"
                style={{ borderColor: cardBorder, color: dark ? "#a0aec0" : "#4a5568" }}
              >
                ↗ MITRE ATT&CK
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}