"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "../components/theme-context";
import Navbar from "../components/Navbar";
import {
  savePredictionContext,
} from "../lib/prediction-store";

const API = "/api"; // proxied by next.config.ts → http://localhost:8000

interface PredictionResult {
  prediction: string;
}

const PRESETS: Record<string, { label: string; data: Record<string, number> }> = {
  ddos: {
    label: "DDoS Profile",
    data: {
      flow_duration: 120, total_fwd_packets: 50000, total_backward_packets: 100,
      total_length_fwd_packets: 5000000, total_length_bwd_packets: 1000,
      fwd_packet_length_max: 1500, fwd_packet_length_min: 0, fwd_packet_length_mean: 100,
      bwd_packet_length_max: 10, flow_bytes_s: 41666, flow_packets_s: 416,
      flow_iat_mean: 0.24, fwd_iat_total: 12, bwd_iat_total: 0,
      fin_flag_count: 0, syn_flag_count: 50000, rst_flag_count: 0,
      psh_flag_count: 0, ack_flag_count: 0,
    },
  },
  portscan: {
    label: "Port Scan Profile",
    data: {
      flow_duration: 5000, total_fwd_packets: 1000, total_backward_packets: 0,
      total_length_fwd_packets: 44000, total_length_bwd_packets: 0,
      fwd_packet_length_max: 44, fwd_packet_length_min: 44, fwd_packet_length_mean: 44,
      bwd_packet_length_max: 0, flow_bytes_s: 8800, flow_packets_s: 200,
      flow_iat_mean: 5, fwd_iat_total: 5000, bwd_iat_total: 0,
      fin_flag_count: 0, syn_flag_count: 1000, rst_flag_count: 1000,
      psh_flag_count: 0, ack_flag_count: 0,
    },
  },
  webattack: {
    label: "Web Attack Profile",
    data: {
      flow_duration: 30000, total_fwd_packets: 500, total_backward_packets: 450,
      total_length_fwd_packets: 150000, total_length_bwd_packets: 120000,
      fwd_packet_length_max: 1460, fwd_packet_length_min: 20, fwd_packet_length_mean: 300,
      bwd_packet_length_max: 1460, flow_bytes_s: 9000, flow_packets_s: 31,
      flow_iat_mean: 60, fwd_iat_total: 30000, bwd_iat_total: 28000,
      fin_flag_count: 10, syn_flag_count: 10, rst_flag_count: 2,
      psh_flag_count: 400, ack_flag_count: 480,
    },
  },
  botnet: {
    label: "Botnet Profile",
    data: {
      flow_duration: 60000, total_fwd_packets: 120, total_backward_packets: 110,
      total_length_fwd_packets: 12000, total_length_bwd_packets: 11000,
      fwd_packet_length_max: 200, fwd_packet_length_min: 60, fwd_packet_length_mean: 100,
      bwd_packet_length_max: 200, flow_bytes_s: 383, flow_packets_s: 3.83,
      flow_iat_mean: 500, fwd_iat_total: 60000, bwd_iat_total: 60000,
      fin_flag_count: 5, syn_flag_count: 5, rst_flag_count: 0,
      psh_flag_count: 110, ack_flag_count: 115,
    },
  },
};

const RESULT_COLORS: Record<string, { color: string; darkColor: string; label: string; icon: string }> = {
  DDoS:      { color: "#cc0000", darkColor: "#ff6b6b", label: "DDoS Attack",     icon: "⚡" },
  Botnet:    { color: "#9f1239", darkColor: "#fda4af", label: "Botnet Activity", icon: "🕸️" },
  PortScan:  { color: "#996600", darkColor: "#ffd580", label: "Port Scan",        icon: "🔍" },
  WebAttack: { color: "#7c2d12", darkColor: "#fb923c", label: "Web Attack",       icon: "🌐" },
};

const FIELDS = [
  { key: "flow_duration",              label: "Flow Duration (ms)" },
  { key: "total_fwd_packets",          label: "Total Fwd Packets" },
  { key: "total_backward_packets",     label: "Total Bwd Packets" },
  { key: "total_length_fwd_packets",   label: "Total Fwd Length (bytes)" },
  { key: "total_length_bwd_packets",   label: "Total Bwd Length (bytes)" },
  { key: "fwd_packet_length_max",      label: "Fwd Pkt Length Max" },
  { key: "fwd_packet_length_min",      label: "Fwd Pkt Length Min" },
  { key: "fwd_packet_length_mean",     label: "Fwd Pkt Length Mean" },
  { key: "bwd_packet_length_max",      label: "Bwd Pkt Length Max" },
  { key: "flow_bytes_s",               label: "Flow Bytes/s" },
  { key: "flow_packets_s",             label: "Flow Packets/s" },
  { key: "flow_iat_mean",              label: "Flow IAT Mean (ms)" },
  { key: "fwd_iat_total",              label: "Fwd IAT Total" },
  { key: "bwd_iat_total",              label: "Bwd IAT Total" },
  { key: "fin_flag_count",             label: "FIN Flag Count" },
  { key: "syn_flag_count",             label: "SYN Flag Count" },
  { key: "rst_flag_count",             label: "RST Flag Count" },
  { key: "psh_flag_count",             label: "PSH Flag Count" },
  { key: "ack_flag_count",             label: "ACK Flag Count" },
];

const HIGHLIGHT_FIELDS = [
  "flow_duration", "total_fwd_packets", "syn_flag_count",
  "flow_packets_s", "flow_bytes_s", "psh_flag_count",
];

export default function PredictPage() {
  const { dark } = useTheme();
  const router = useRouter();

  const [formData, setFormData] = useState<Record<string, number>>(PRESETS.ddos.data);
  const [result, setResult]     = useState<PredictionResult | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string>("ddos");

  const accent     = dark ? "#63ffb4" : "#0f7a4e";
  const cardBorder = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)";
  const cardBg     = dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)";
  const inputBg    = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";

  const applyPreset = (key: string) => {
    setActivePreset(key);
    setFormData(PRESETS[key].data);
    setResult(null);
    setError(null);
  };

  const handleChange = (key: string, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: parseFloat(val) || 0 }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = await res.json();
      setResult(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  // ── Save context → navigate to /analyze ────────────────────────────────────
  const handleViewThreatDetails = () => {
    if (!result) return;
    const meta = RESULT_COLORS[result.prediction] || {
      label: result.prediction, icon: "⚠️", color: accent, darkColor: accent,
    };
    savePredictionContext({
      prediction: result.prediction,
      label:      meta.label,
      features:   formData,
      timestamp:  Date.now(),
    });
    router.push("/analyze");
  };

  const resultMeta = result
    ? (RESULT_COLORS[result.prediction] || { color: accent, darkColor: accent, label: result.prediction, icon: "⚠️" })
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .section-label { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.45; margin-bottom: 14px; font-family: 'IBM Plex Mono', monospace; }
        .field-input { width: 100%; background: ${inputBg}; border: 1px solid ${cardBorder}; border-radius: 3px; padding: 8px 12px; font-size: 13px; font-family: 'IBM Plex Mono', monospace; color: inherit; outline: none; transition: border-color 0.15s; }
        .field-input:focus { border-color: ${accent}; }
        .preset-btn { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.08em; padding: 7px 14px; border-radius: 3px; border: 1px solid; cursor: pointer; transition: all 0.15s; }
        .submit-btn { width: 100%; padding: 14px; border-radius: 4px; border: none; font-family: 'IBM Plex Mono', monospace; font-size: 13px; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; font-weight: 500; }
        .submit-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .investigate-btn { width: 100%; padding: 14px; border-radius: 4px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s; font-weight: 500; border: 1px solid; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .investigate-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .stat-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid; font-size: 12px; }
        .stat-row:last-child { border-bottom: none; }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .result-card { animation: fadeIn 0.3s ease; }
      `}</style>

      <Navbar />

      <main style={{ paddingTop: 80, paddingBottom: 60, paddingLeft: 40, paddingRight: 40, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginTop: 20, marginBottom: 32 }}>
          <p className="section-label">ML Classification — POST /predict</p>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Attack Predictor
          </h1>
          <p style={{ fontSize: 13, opacity: 0.55, marginTop: 8, maxWidth: 560 }}>
            Submit network traffic features to the XGBoost classifier. After prediction, generate a full AI investigation report with one click.
          </p>
        </div>

        {/* Presets */}
        <div style={{ marginBottom: 28 }}>
          <p className="section-label">Quick Presets</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {Object.entries(PRESETS).map(([k, p]) => (
              <button key={k} className="preset-btn" onClick={() => applyPreset(k)}
                style={{
                  background: activePreset === k ? (dark ? "rgba(99,255,180,0.1)" : "rgba(15,122,78,0.1)") : "transparent",
                  borderColor: activePreset === k ? accent : cardBorder,
                  color: activePreset === k ? accent : dark ? "#a0aec0" : "#4a5568",
                }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

          {/* Feature inputs */}
          <div style={{ border: `1px solid ${cardBorder}`, borderRadius: 4, padding: 24, background: cardBg }}>
            <p className="section-label">Network Traffic Features</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: 11, opacity: 0.5, marginBottom: 5, letterSpacing: "0.04em" }}>
                    {f.label}
                  </label>
                  <input type="number" className="field-input" value={formData[f.key] ?? 0}
                    onChange={(e) => handleChange(f.key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Payload preview */}
            <div style={{ border: `1px solid ${cardBorder}`, borderRadius: 4, padding: 20, background: cardBg }}>
              <p className="section-label">Request Payload</p>
              <pre style={{ fontSize: 11, lineHeight: 1.7, opacity: 0.6, maxHeight: 200, overflowY: "auto", fontFamily: "'IBM Plex Mono', monospace" }}>
                {JSON.stringify({ data: formData }, null, 2).slice(0, 600)}...
              </pre>
            </div>

            {/* Classify */}
            <button className="submit-btn" onClick={handleSubmit} disabled={loading}
              style={{ background: dark ? "#63ffb4" : "#0f7a4e", color: dark ? "#080c10" : "#fff" }}>
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

            {/* Error */}
            {error && (
              <div style={{ background: dark ? "rgba(255,107,107,0.08)" : "rgba(204,0,0,0.06)", border: `1px solid ${dark ? "rgba(255,107,107,0.2)" : "rgba(204,0,0,0.2)"}`, borderRadius: 4, padding: "14px 16px", fontSize: 12, color: dark ? "#ff6b6b" : "#cc0000" }}>
                ⚠ {error}
              </div>
            )}

            {/* ── Result card with investigation button ── */}
            {result && resultMeta && (
              <div className="result-card" style={{
                border: `1px solid ${dark ? resultMeta.darkColor + "40" : resultMeta.color + "30"}`,
                borderRadius: 4, overflow: "hidden",
                background: dark ? resultMeta.darkColor + "08" : resultMeta.color + "04",
              }}>

                {/* Attack header */}
                <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${dark ? resultMeta.darkColor + "20" : resultMeta.color + "15"}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: 28 }}>{resultMeta.icon}</span>
                    <div>
                      <div style={{ fontSize: 10, opacity: 0.45, letterSpacing: "0.12em", marginBottom: 3 }}>DETECTED ATTACK</div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: dark ? resultMeta.darkColor : resultMeta.color, letterSpacing: "-0.02em" }}>
                        {resultMeta.label}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, opacity: 0.4 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: dark ? resultMeta.darkColor : resultMeta.color, animation: "pulse 2s infinite" }} />
                    XGBoost · raw: <code style={{ fontFamily: "inherit" }}>{result.prediction}</code>
                  </div>
                </div>

                {/* Key indicators summary */}
                <div style={{ padding: "12px 20px" }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.12em", opacity: 0.4, marginBottom: 8 }}>KEY TRAFFIC INDICATORS</div>
                  {HIGHLIGHT_FIELDS.filter((k) => formData[k] !== undefined).map((k) => {
                    const field = FIELDS.find((f) => f.key === k);
                    return (
                      <div key={k} className="stat-row" style={{ borderColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)" }}>
                        <span style={{ opacity: 0.55 }}>{field?.label || k}</span>
                        <span style={{ color: dark ? resultMeta.darkColor : resultMeta.color, fontWeight: 500 }}>
                          {formData[k].toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* ── Investigation CTA ── */}
                <div style={{ padding: "4px 20px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    className="investigate-btn"
                    onClick={handleViewThreatDetails}
                    style={{
                      background: dark ? resultMeta.darkColor + "15" : resultMeta.color + "10",
                      borderColor: dark ? resultMeta.darkColor + "50" : resultMeta.color + "40",
                      color: dark ? resultMeta.darkColor : resultMeta.color,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    GENERATE AI INVESTIGATION REPORT
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div style={{ fontSize: 10, opacity: 0.3, textAlign: "center", letterSpacing: "0.04em" }}>
                    Passes all traffic features + prediction to RAG + LLaMA3
                  </div>
                </div>
              </div>
            )}

            {/* Endpoint info */}
            <div style={{ border: `1px solid ${cardBorder}`, borderRadius: 4, padding: 16, background: cardBg, fontSize: 11, opacity: 0.5, lineHeight: 1.8 }}>
              <div style={{ marginBottom: 6, letterSpacing: "0.1em", opacity: 0.7 }}>ENDPOINT</div>
              <code>POST http://localhost:8000/predict</code><br />
              <code>Body: {"{'data': {...features}}"}</code>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}