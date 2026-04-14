import { useState, useRef } from "react";
import axios from "axios";

const FILES = [
  {
    key: "inventory",
    label: "Road Inventory",
    desc: "segment_id · road_name · road_class · length_km · subdivision · importance_weight",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="2" width="16" height="18" rx="3" stroke="#00ADB5" strokeWidth="1.2" fill="none"/>
        <path d="M7 8h8M7 11h8M7 14h5" stroke="#00ADB5" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: "complaints",
    label: "Citizen Complaints",
    desc: "complaint_id · segment_id · road_name · complaint_type · complaint_date · status",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8.5" stroke="#00ADB5" strokeWidth="1.2" fill="none"/>
        <path d="M11 7v5" stroke="#00ADB5" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="11" cy="15" r="1" fill="#00ADB5"/>
      </svg>
    ),
  },
  {
    key: "maintenance",
    label: "Maintenance Logs",
    desc: "maintenance_id · segment_id · road_name · repair_type · repair_date · cost_inr",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M5 18l5-5m4-5l3 3-2 2-1-1-3.5 3.5-1-1 3.5-3.5-1-1z" stroke="#00ADB5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="7.5" cy="14.5" r="3" stroke="#00ADB5" strokeWidth="1.2" fill="none"/>
      </svg>
    ),
  },
];

const STATUS_COLORS = {
  done: "#00ADB5",
  error: "#F07070",
  uploading: "#888",
  idle: "#3E454F",
};

export default function Upload({ onProcessed }) {
  const [uploads, setUploads] = useState({ inventory: null, complaints: null, maintenance: null });
  const [status, setStatus] = useState({ inventory: "idle", complaints: "idle", maintenance: "idle" });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const refs = { inventory: useRef(), complaints: useRef(), maintenance: useRef() };

  const allUploaded = Object.values(status).every(s => s === "done");
  const doneCount = Object.values(status).filter(s => s === "done").length;

  const handleFile = async (key, file) => {
    if (!file) return;
    setUploads(p => ({ ...p, [key]: file }));
    setStatus(p => ({ ...p, [key]: "uploading" }));
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", key);
      await axios.post("/api/upload", form);
      setStatus(p => ({ ...p, [key]: "done" }));
    } catch {
      setStatus(p => ({ ...p, [key]: "error" }));
      setError(`Failed to upload ${key}. Check that it's a valid CSV.`);
    }
  };

  const handleProcess = async () => {
    setProcessing(true);
    setError(null);
    try {
      await axios.post("/api/process");
      onProcessed();
    } catch {
      setError("Processing failed. Check that all CSV files are valid.");
      setProcessing(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
        background: "radial-gradient(ellipse at 30% 20%, rgba(0,173,181,0.06) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(240,112,112,0.05) 0%, transparent 55%), #161C24",
      }}
    >
      {/* Big Civora wordmark */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <h1
            style={{
              fontSize: "clamp(56px, 10vw, 96px)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              margin: 0,
              lineHeight: 1,
              background: "linear-gradient(135deg, #EEEEEE 30%, #00ADB5 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              userSelect: "none",
            }}
          >
            Civora
          </h1>
          {/* Underline accent */}
          <div
            style={{
              height: "2px",
              background: "linear-gradient(90deg, transparent, #00ADB5, transparent)",
              marginTop: "6px",
              borderRadius: "2px",
              opacity: 0.6,
            }}
          />
        </div>
        <div style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", color: "#3E454F", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Road Maintenance Triage Dashboard
          </span>
        </div>
      </div>

      {/* Sub-header */}
      <div style={{ textAlign: "center", marginBottom: "40px", maxWidth: "420px" }}>
        <p style={{ fontSize: "14px", color: "#484F5A", lineHeight: 1.7, margin: 0 }}>
          Upload all three CSV datasets to generate your triage view.
          Files are processed locally and never stored externally.
        </p>
      </div>

      {/* Progress strip */}
      <div style={{ width: "100%", maxWidth: "840px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ flex: 1, height: "1px", background: "#2C323C", position: "relative", borderRadius: "2px" }}>
          <div
            style={{
              position: "absolute",
              left: 0, top: 0, bottom: 0,
              width: `${(doneCount / 3) * 100}%`,
              background: "linear-gradient(90deg, #00ADB5, #52C7C5)",
              borderRadius: "2px",
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <span style={{ fontSize: "11px", color: doneCount === 3 ? "#00ADB5" : "#484F5A", whiteSpace: "nowrap" }}>
          {doneCount} / 3 uploaded
        </span>
      </div>

      {/* Upload cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", width: "100%", maxWidth: "840px", marginBottom: "32px" }}>
        {FILES.map(({ key, label, desc, icon }) => {
          const s = status[key];
          const file = uploads[key];
          const accentColor = STATUS_COLORS[s];
          const isClickable = s === "idle" || s === "error";

          return (
            <div
              key={key}
              onClick={() => isClickable && refs[key].current.click()}
              style={{
                background: "#1C2128",
                border: `0.5px solid ${s === "done" ? "rgba(0,173,181,0.3)" : s === "error" ? "rgba(240,112,112,0.3)" : "#2C323C"}`,
                borderRadius: "14px",
                padding: "24px 20px",
                cursor: isClickable ? "pointer" : "default",
                transition: "border-color 0.15s, transform 0.15s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={e => {
                if (isClickable) {
                  e.currentTarget.style.borderColor = s === "error" ? "rgba(240,112,112,0.5)" : "rgba(0,173,181,0.4)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = s === "done" ? "rgba(0,173,181,0.3)" : s === "error" ? "rgba(240,112,112,0.3)" : "#2C323C";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <input
                ref={refs[key]}
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={e => handleFile(key, e.target.files[0])}
              />

              {/* Status badge */}
              <div style={{ position: "absolute", top: "16px", right: "16px" }}>
                {s === "done" && (
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(0,173,181,0.12)", display: "grid", placeItems: "center" }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5 4-4" stroke="#00ADB5" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                {s === "uploading" && (
                  <div
                    style={{
                      width: "16px", height: "16px",
                      border: "1.5px solid #2C323C",
                      borderTop: "1.5px solid #00ADB5",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                )}
                {s === "error" && (
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(240,112,112,0.1)", display: "grid", placeItems: "center" }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M3 3l4 4M7 3l-4 4" stroke="#F07070" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Icon */}
              <div
                style={{
                  width: "40px", height: "40px",
                  borderRadius: "10px",
                  background: s === "done" ? "rgba(0,173,181,0.08)" : "rgba(255,255,255,0.03)",
                  border: `0.5px solid ${s === "done" ? "rgba(0,173,181,0.15)" : "#2C323C"}`,
                  display: "grid", placeItems: "center",
                  marginBottom: "16px",
                  transition: "background 0.15s, border-color 0.15s",
                }}
              >
                {icon}
              </div>

              <div style={{ fontSize: "13px", fontWeight: 500, color: "#EEEEEE", marginBottom: "8px" }}>{label}</div>

              <div
                style={{
                  fontSize: "10.5px",
                  color: "#3E454F",
                  lineHeight: 1.7,
                  fontFamily: "monospace",
                  letterSpacing: "0.01em",
                }}
              >
                {desc}
              </div>

              {/* File info */}
              {file && (
                <div
                  style={{
                    marginTop: "16px",
                    paddingTop: "12px",
                    borderTop: "0.5px solid #2C323C",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2h5l3 3v5H2z" stroke={accentColor} strokeWidth="1" fill="none"/>
                    <path d="M7 2v3h3" stroke={accentColor} strokeWidth="1"/>
                  </svg>
                  <span style={{ fontSize: "11px", color: accentColor, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {file.name}
                  </span>
                </div>
              )}

              {s === "idle" && !file && (
                <div style={{ marginTop: "14px", fontSize: "11px", color: "#3E454F", display: "flex", alignItems: "center", gap: "5px" }}>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M6 9V3M3 6l3-3 3 3" stroke="#3E454F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Click to upload CSV
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "rgba(240,112,112,0.06)",
            border: "0.5px solid rgba(240,112,112,0.2)",
            borderRadius: "10px",
            padding: "10px 16px",
            marginBottom: "20px",
            fontSize: "12px",
            color: "#F07070",
            maxWidth: "840px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="7" cy="7" r="6" stroke="#F07070" strokeWidth="1.2"/>
            <path d="M7 4v4" stroke="#F07070" strokeWidth="1.3" strokeLinecap="round"/>
            <circle cx="7" cy="10" r="0.8" fill="#F07070"/>
          </svg>
          {error}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleProcess}
        disabled={!allUploaded || processing}
        style={{
          fontFamily: "inherit",
          fontSize: "13px",
          fontWeight: 500,
          background: allUploaded && !processing
            ? "linear-gradient(135deg, #00ADB5, #0096A0)"
            : "#1C2128",
          color: allUploaded && !processing ? "#0A1A1C" : "#3E454F",
          border: `0.5px solid ${allUploaded && !processing ? "transparent" : "#2C323C"}`,
          borderRadius: "10px",
          padding: "12px 36px",
          cursor: allUploaded && !processing ? "pointer" : "not-allowed",
          transition: "background 0.15s, color 0.15s, transform 0.12s",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          letterSpacing: "0.01em",
        }}
        onMouseEnter={e => { if (allUploaded && !processing) e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
      >
        {processing ? (
          <>
            <div style={{ width: "13px", height: "13px", border: "1.5px solid rgba(0,0,0,0.2)", borderTop: "1.5px solid #0A1A1C", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>
            Processing…
          </>
        ) : (
          <>
            Run triage scoring
            {allUploaded && (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </>
        )}
      </button>

      <p style={{ fontSize: "11px", color: "#2C323C", marginTop: "14px" }}>
        {allUploaded ? "All files ready — run scoring to proceed" : `${doneCount} of 3 files uploaded`}
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}