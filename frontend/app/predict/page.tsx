"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../components/theme-context";
import Navbar from "../components/Navbar";
import { savePredictionContext, HIGHLIGHT_FEATURE_KEYS } from "../lib/prediction-store";
import { callPredict } from "../lib/api";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PredictionResult {
  prediction: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const ATTACK_META: Record<string, { color: string; darkColor: string; label: string; icon: string; severity: string }> = {
  DDoS:      { color: "#cc0000", darkColor: "#ff6b6b", label: "DDoS Attack",     icon: "⚡", severity: "CRITICAL" },
  Botnet:    { color: "#9f1239", darkColor: "#fda4af", label: "Botnet Activity", icon: "🕸️", severity: "HIGH" },
  PortScan:  { color: "#996600", darkColor: "#ffd580", label: "Port Scan",        icon: "🔍", severity: "MEDIUM" },
  WebAttack: { color: "#7c2d12", darkColor: "#fb923c", label: "Web Attack",       icon: "🌐", severity: "HIGH" },
};

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "#ff4444",
  HIGH:     "#ff8800",
  MEDIUM:   "#ffcc00",
  LOW:      "#44cc44",
};

const FIELDS = [
  "flow_duration", "total_fwd_packets", "total_backward_packets",
  "total_length_fwd_packets", "total_length_bwd_packets",
  "fwd_packet_length_max", "fwd_packet_length_min", "fwd_packet_length_mean",
  "bwd_packet_length_max", "flow_bytes_s", "flow_packets_s",
  "flow_iat_mean", "fwd_iat_total", "bwd_iat_total",
  "fin_flag_count", "syn_flag_count", "rst_flag_count",
  "psh_flag_count", "ack_flag_count",
];

const FIELD_LABELS: Record<string, string> = {
  flow_duration: "Flow Duration (ms)",
  total_fwd_packets: "Total Fwd Packets",
  total_backward_packets: "Total Bwd Packets",
  total_length_fwd_packets: "Total Fwd Length (bytes)",
  total_length_bwd_packets: "Total Bwd Length (bytes)",
  fwd_packet_length_max: "Fwd Pkt Length Max",
  fwd_packet_length_min: "Fwd Pkt Length Min",
  fwd_packet_length_mean: "Fwd Pkt Length Mean",
  bwd_packet_length_max: "Bwd Pkt Length Max",
  flow_bytes_s: "Flow Bytes/s",
  flow_packets_s: "Flow Packets/s",
  flow_iat_mean: "Flow IAT Mean (ms)",
  fwd_iat_total: "Fwd IAT Total",
  bwd_iat_total: "Bwd IAT Total",
  fin_flag_count: "FIN Flag Count",
  syn_flag_count: "SYN Flag Count",
  rst_flag_count: "RST Flag Count",
  psh_flag_count: "PSH Flag Count",
  ack_flag_count: "ACK Flag Count",
};

const EMPTY_TEMPLATE = FIELDS.reduce<Record<string, number>>((acc, k) => {
  acc[k] = 0;
  return acc;
}, {});

// ─── Component ──────────────────────────────────────────────────────────────

export default function PredictPage() {
  const { dark } = useTheme();
  const router = useRouter();

  const [jsonText, setJsonText]   = useState<string>(JSON.stringify(EMPTY_TEMPLATE, null, 2));
  const [formData, setFormData]   = useState<Record<string, number>>(EMPTY_TEMPLATE);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [result, setResult]       = useState<PredictionResult | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);

  // ── Theme tokens ────────────────────────────────────────────────────────
  const accent     = dark ? "#63ffb4" : "#0f7a4e";
  const cardBorder = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)";
  const cardBg     = dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)";
  const textMuted  = dark ? "#a0aec0" : "#4a5568";

  // ── JSON validation & parse ──────────────────────────────────────────────

  const parseJson = (text: string): Record<string, number> | null => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setJsonError("Invalid JSON — check for missing commas, brackets, or quotes.");
      return null;
    }

    // Accept {data: {...}} envelope or flat object
    let flat: Record<string, unknown>;
    if (
      parsed !== null && typeof parsed === "object" && !Array.isArray(parsed) &&
      "data" in (parsed as object)
    ) {
      flat = (parsed as { data: Record<string, unknown> }).data;
    } else if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      flat = parsed as Record<string, unknown>;
    } else {
      setJsonError('Expected a JSON object or {"data": {...}} envelope.');
      return null;
    }

    const missing = FIELDS.filter((k) => !(k in flat));
    if (missing.length > 0) {
      setJsonError(`Missing fields: ${missing.join(", ")}`);
      return null;
    }

    const coerced: Record<string, number> = {};
    const invalid: string[] = [];
    for (const k of FIELDS) {
      const v = Number(flat[k]);
      if (isNaN(v)) invalid.push(k);
      else coerced[k] = v;
    }
    if (invalid.length > 0) {
      setJsonError(`Non-numeric values: ${invalid.join(", ")}`);
      return null;
    }

    return coerced;
  };

  // ── Predict ──────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setJsonError(null);
    const data = parseJson(jsonText);
    if (!data) return;

    setFormData(data);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const json = await callPredict(data);
      setResult(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(JSON.stringify(EMPTY_TEMPLATE, null, 2));
  };

  const resetJson = () => {
    setJsonText(JSON.stringify(EMPTY_TEMPLATE, null, 2));
    setJsonError(null);
    setResult(null);
    setError(null);
  };

  // ── Navigate to /analyze ─────────────────────────────────────────────────

  const handleViewThreatDetails = () => {
    if (!result) return;
    setNavigating(true);

    const meta = ATTACK_META[result.prediction] ?? {
      label: result.prediction, icon: "⚠️",
      color: accent, darkColor: accent, severity: "UNKNOWN",
    };

    const keyFeatures: Partial<Record<typeof HIGHLIGHT_FEATURE_KEYS[number], number>> = {};
    for (const k of HIGHLIGHT_FEATURE_KEYS) {
      if (formData[k] !== undefined) keyFeatures[k] = formData[k];
    }

    savePredictionContext({
      prediction: result.prediction,
      label:      meta.label,
      keyFeatures,
      allFeatures: formData,
      timestamp:  Date.now(),
    });

    router.push("/analyze");
  };

  const resultMeta = result
    ? (ATTACK_META[result.prediction] ?? {
        color: accent, darkColor: accent,
        label: result.prediction, icon: "⚠️", severity: "UNKNOWN",
      })
    : null;

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

        .icon-btn {
          font-family: 'IBM Plex Mono', monospace; font-size: 10px;
          letter-spacing: 0.08em; padding: 6px 14px; border-radius: 3px;
          border: 1px solid ${cardBorder}; cursor: pointer;
          background: transparent; color: ${textMuted};
          transition: all 0.15s; display: flex; align-items: center; gap: 6px;
        }
        .icon-btn:hover { border-color: ${accent}; color: ${accent}; }

        .json-textarea {
          width: 100%; min-height: 480px; resize: vertical;
          background: ${dark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.025)"};
          border: 1px solid ${cardBorder}; border-radius: 4px;
          padding: 18px; font-size: 12.5px; line-height: 1.75;
          font-family: 'IBM Plex Mono', monospace; color: inherit;
          outline: none; transition: border-color 0.15s;
        }
        .json-textarea:focus { border-color: ${accent}; }

        .submit-btn {
          width: 100%; padding: 15px; border-radius: 4px; border: none;
          font-family: 'IBM Plex Mono', monospace; font-size: 13px;
          letter-spacing: 0.12em; cursor: pointer; transition: all 0.2s; font-weight: 600;
        }
        .submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .investigate-btn {
          width: 100%; padding: 14px; border-radius: 4px;
          font-family: 'IBM Plex Mono', monospace; font-size: 13px;
          letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s;
          font-weight: 500; border: 1px solid;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .investigate-btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
        .investigate-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .stat-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 6px 0; border-bottom: 1px solid; font-size: 12px;
          font-family: 'IBM Plex Mono', monospace;
        }
        .stat-row:last-child { border-bottom: none; }

        .error-box {
          border-radius: 4px; padding: 14px 16px; font-size: 12px;
          font-family: 'IBM Plex Mono', monospace; line-height: 1.6;
          display: flex; gap: 10px; align-items: flex-start;
        }

        .field-pill {
          display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 2px;
          font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.04em;
          border: 1px solid ${cardBorder}; opacity: 0.5; margin: 2px;
        }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin   { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

        .result-card { animation: fadeIn 0.35s ease; }

        .severity-badge {
          font-size: 10px; font-family: 'IBM Plex Mono', monospace;
          letter-spacing: 0.12em; padding: 3px 8px; border-radius: 2px; font-weight: 600;
        }
        .compact-note {
          font-size: 10px; opacity: 0.35; text-align: center;
          letter-spacing: 0.04em; font-family: 'IBM Plex Mono', monospace; line-height: 1.6;
        }
      `}</style>

      <Navbar />

      <main style={{
        paddingTop: 80, paddingBottom: 60,
        paddingLeft: 40, paddingRight: 40,
        maxWidth: 960, margin: "0 auto",
      }}>

        {/* ── Page header ── */}
        <div style={{ marginTop: 20, marginBottom: 36 }}>
          <p className="section-label">ML Classification — POST /predict</p>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em",
          }}>
            Attack Predictor
          </h1>
          <p style={{ fontSize: 13, opacity: 0.55, marginTop: 8, maxWidth: 520, lineHeight: 1.6 }}>
            Paste your network traffic features as JSON and classify in one click.
            Supports flat objects or <code style={{ opacity: 0.8 }}>{`{"data": {...}}`}</code> envelopes.
          </p>
        </div>

        {/* ── Main grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

          {/* ── JSON Editor ── */}
          <div>
            {/* Toolbar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p className="section-label" style={{ marginBottom: 0 }}>JSON Input</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="icon-btn" onClick={copyTemplate} title="Copy blank template">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  COPY TEMPLATE
                </button>
                <button className="icon-btn" onClick={resetJson} title="Reset to blank template">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 .49-3.9"/>
                  </svg>
                  RESET
                </button>
              </div>
            </div>

            <textarea
              className="json-textarea"
              value={jsonText}
              onChange={(e) => { setJsonText(e.target.value); setJsonError(null); }}
              spellCheck={false}
              placeholder={`{\n  "flow_duration": 0,\n  "total_fwd_packets": 0,\n  ...\n}`}
            />

            {/* JSON error */}
            {jsonError && (
              <div style={{
                marginTop: 10, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
                color: dark ? "#ff6b6b" : "#cc0000",
                display: "flex", alignItems: "flex-start", gap: 7,
                background: dark ? "rgba(255,107,107,0.07)" : "rgba(204,0,0,0.05)",
                border: `1px solid ${dark ? "rgba(255,107,107,0.2)" : "rgba(204,0,0,0.15)"}`,
                borderRadius: 4, padding: "10px 14px",
              }}>
                <span style={{ marginTop: 1 }}>⚠</span>
                <span>{jsonError}</span>
              </div>
            )}

            {/* Expected fields hint */}
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: 10, opacity: 0.35, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>
                EXPECTED FIELDS ({FIELDS.length})
              </p>
              <div>
                {FIELDS.map((k) => (
                  <span key={k} className="field-pill"
                    style={{ color: (HIGHLIGHT_FEATURE_KEYS as readonly string[]).includes(k) ? accent : "inherit",
                             opacity: (HIGHLIGHT_FEATURE_KEYS as readonly string[]).includes(k) ? 0.8 : 0.4 }}>
                    {(HIGHLIGHT_FEATURE_KEYS as readonly string[]).includes(k) && "★ "}{k}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: 10, opacity: 0.3, fontFamily: "'IBM Plex Mono', monospace", marginTop: 8 }}>
                ★ = key indicators used in AI threat report
              </p>
            </div>
          </div>

          {/* ── Right panel ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Classify button */}
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={loading}
              style={{ background: dark ? "#63ffb4" : "#0f7a4e", color: dark ? "#080c10" : "#fff" }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  CLASSIFYING...
                </span>
              ) : "→ CLASSIFY TRAFFIC"}
            </button>

            {/* How to use */}
            {!result && !error && (
              <div style={{
                border: `1px solid ${cardBorder}`, borderRadius: 4,
                padding: 18, background: cardBg,
                fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 2,
                opacity: 0.5,
              }}>
                <div style={{ marginBottom: 8, letterSpacing: "0.1em", opacity: 0.8 }}>HOW TO USE</div>
                <div>1. Paste your JSON on the left</div>
                <div>2. Or edit the template values</div>
                <div>3. Click Classify Traffic</div>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${cardBorder}` }}>
                  Accepts flat object or<br />
                  <code>{`{"data": {...}}`}</code> envelope
                </div>
              </div>
            )}

            {/* Backend error */}
            {error && (
              <div className="error-box" style={{
                background: dark ? "rgba(255,107,107,0.08)" : "rgba(204,0,0,0.06)",
                border: `1px solid ${dark ? "rgba(255,107,107,0.25)" : "rgba(204,0,0,0.2)"}`,
                color: dark ? "#ff6b6b" : "#cc0000",
              }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>⚠</span>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Prediction Failed</div>
                  <div style={{ opacity: 0.85 }}>{error}</div>
                  <div style={{ marginTop: 8, opacity: 0.6 }}>
                    Check FastAPI is running:<br /><code>uvicorn app:app --reload</code>
                  </div>
                </div>
              </div>
            )}

            {/* ── Result card ── */}
            {result && resultMeta && (
              <div className="result-card" style={{
                border: `1px solid ${dark ? resultMeta.darkColor + "40" : resultMeta.color + "30"}`,
                borderRadius: 4, overflow: "hidden",
                background: dark ? resultMeta.darkColor + "08" : resultMeta.color + "04",
              }}>
                {/* Header */}
                <div style={{
                  padding: "20px 20px 16px",
                  borderBottom: `1px solid ${dark ? resultMeta.darkColor + "20" : resultMeta.color + "15"}`,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 28 }}>{resultMeta.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, opacity: 0.45, letterSpacing: "0.12em", marginBottom: 3 }}>DETECTED ATTACK</div>
                      <div style={{
                        fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700,
                        color: dark ? resultMeta.darkColor : resultMeta.color, letterSpacing: "-0.02em",
                      }}>
                        {resultMeta.label}
                      </div>
                    </div>
                    <span className="severity-badge" style={{
                      background: SEVERITY_COLOR[resultMeta.severity] + "20",
                      color: SEVERITY_COLOR[resultMeta.severity],
                      border: `1px solid ${SEVERITY_COLOR[resultMeta.severity]}40`,
                    }}>
                      {resultMeta.severity}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, opacity: 0.4 }}>
                    <div style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: dark ? resultMeta.darkColor : resultMeta.color,
                      animation: "pulse 2s infinite",
                    }} />
                    XGBoost · raw: <code style={{ fontFamily: "inherit" }}>{result.prediction}</code>
                  </div>
                </div>

                {/* Key indicators */}
                <div style={{ padding: "12px 20px" }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.12em", opacity: 0.4, marginBottom: 8 }}>KEY INDICATORS ★</div>
                  {HIGHLIGHT_FEATURE_KEYS.filter((k) => formData[k] !== undefined).map((k) => (
                    <div key={k} className="stat-row"
                      style={{ borderColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)" }}>
                      <span style={{ opacity: 0.55 }}>{FIELD_LABELS[k] ?? k}</span>
                      <span style={{ color: dark ? resultMeta.darkColor : resultMeta.color, fontWeight: 600 }}>
                        {formData[k].toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div style={{ padding: "4px 20px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    className="investigate-btn"
                    onClick={handleViewThreatDetails}
                    disabled={navigating}
                    style={{
                      background:  dark ? resultMeta.darkColor + "15" : resultMeta.color + "10",
                      borderColor: dark ? resultMeta.darkColor + "50" : resultMeta.color + "40",
                      color:       dark ? resultMeta.darkColor : resultMeta.color,
                    }}
                  >
                    {navigating ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          style={{ animation: "spin 1s linear infinite" }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        LOADING ANALYZER...
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14,2 14,8 20,8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        VIEW THREAT DETAILS
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                  <div className="compact-note">
                    Sends compact prompt (6 key indicators only) to RAG + LLaMA3<br />
                    Prevents ECONNRESET / socket hang-up
                  </div>
                </div>
              </div>
            )}

            {/* Endpoint info */}
            <div style={{
              border: `1px solid ${cardBorder}`, borderRadius: 4, padding: 16, background: cardBg,
              fontSize: 11, opacity: 0.4, lineHeight: 1.9, fontFamily: "'IBM Plex Mono', monospace",
            }}>
              <div style={{ marginBottom: 4, letterSpacing: "0.1em", opacity: 0.8 }}>ENDPOINT</div>
              <code>POST http://localhost:8000/predict</code><br />
              <code>Body: {`{"data": {...features}}`}</code>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}