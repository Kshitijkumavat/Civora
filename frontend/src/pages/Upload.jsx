import { useState, useRef } from "react";
import axios from "axios";

const FILES = [
  {
    key: "inventory",
    label: "Road Inventory",
    desc: "segment_id, road_name, road_class, length_km, subdivision, importance_weight",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="2" width="14" height="16" rx="2" stroke="#00ADB5" strokeWidth="1.2" fill="none"/>
        <line x1="6" y1="7" x2="14" y2="7" stroke="#00ADB5" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="6" y1="10" x2="14" y2="10" stroke="#00ADB5" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="6" y1="13" x2="11" y2="13" stroke="#00ADB5" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: "complaints",
    label: "Citizen Complaints",
    desc: "complaint_id, segment_id, road_name, complaint_type, complaint_date, status, description",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke="#00ADB5" strokeWidth="1.2" fill="none"/>
        <line x1="10" y1="6" x2="10" y2="10.5" stroke="#00ADB5" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="10" cy="13" r="0.9" fill="#00ADB5"/>
      </svg>
    ),
  },
  {
    key: "maintenance",
    label: "Maintenance Logs",
    desc: "maintenance_id, segment_id, road_name, repair_type, repair_date, contractor, status, cost_inr",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 16L8.5 11.5M13 4l2.5 2.5-1.5 1.5-1-1L10.5 9.5l-1-1 2.5-2.5-1-1z" stroke="#00ADB5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="6.5" cy="13.5" r="2.5" stroke="#00ADB5" strokeWidth="1.2" fill="none"/>
      </svg>
    ),
  },
];

export default function Upload({ onProcessed }) {
  const [uploads, setUploads] = useState({ inventory: null, complaints: null, maintenance: null });
  const [status, setStatus] = useState({ inventory: "idle", complaints: "idle", maintenance: "idle" });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const refs = { inventory: useRef(), complaints: useRef(), maintenance: useRef() };

  const allUploaded = Object.values(status).every((s) => s === "done");

  const handleFile = async (key, file) => {
    if (!file) return;
    setUploads((p) => ({ ...p, [key]: file }));
    setStatus((p) => ({ ...p, [key]: "uploading" }));
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", key);
      await axios.post("/api/upload", form);
      setStatus((p) => ({ ...p, [key]: "done" }));
    } catch {
      setStatus((p) => ({ ...p, [key]: "error" }));
      setError(`Failed to upload ${key}`);
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="1" y="1" width="26" height="26" rx="6" stroke="#00ADB5" strokeWidth="1.5" fill="none"/>
            <path d="M7 18h14M7 14h10M7 10h14" stroke="#00ADB5" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: "13px", color: "#00ADB5", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}>RMTD</span>
        </div>
        <h1 style={{ fontSize: "26px", fontWeight: 500, color: "#EEEEEE", margin: "0 0 8px" }}>Upload your data files</h1>
        <p style={{ fontSize: "14px", color: "#666", maxWidth: "400px", lineHeight: 1.6 }}>
          Upload all three CSV files to generate the triage dashboard. Files are processed locally.
        </p>
      </div>

      {/* Upload cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", width: "100%", maxWidth: "820px", marginBottom: "32px" }}>
        {FILES.map(({ key, label, desc, icon }) => {
          const s = status[key];
          const file = uploads[key];
          return (
            <div
              key={key}
              onClick={() => s === "idle" || s === "error" ? refs[key].current.click() : null}
              style={{
                background: "#393E46",
                border: s === "done" ? "0.5px solid #00ADB5" : s === "error" ? "0.5px solid #F07070" : "0.5px solid #50565F",
                borderRadius: "12px",
                padding: "24px 20px",
                cursor: s === "done" ? "default" : "pointer",
                transition: "border-color 0.15s, background 0.15s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={e => { if (s === "idle") e.currentTarget.style.borderColor = "#00ADB5"; }}
              onMouseLeave={e => { if (s === "idle") e.currentTarget.style.borderColor = "#50565F"; }}
            >
              <input
                ref={refs[key]}
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={(e) => handleFile(key, e.target.files[0])}
              />

              {/* Status indicator top-right */}
              <div style={{ position: "absolute", top: "16px", right: "16px" }}>
                {s === "done" && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" fill="rgba(0,173,181,0.15)"/>
                    <path d="M5 8l2 2 4-4" stroke="#00ADB5" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {s === "uploading" && (
                  <div style={{ width: "16px", height: "16px", border: "1.5px solid #393E46", borderTop: "1.5px solid #00ADB5", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>
                )}
                {s === "error" && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" fill="rgba(240,112,112,0.15)"/>
                    <path d="M6 6l4 4M10 6l-4 4" stroke="#F07070" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                )}
              </div>

              <div style={{ marginBottom: "14px" }}>{icon}</div>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "#EEEEEE", marginBottom: "6px" }}>{label}</div>
              <div style={{ fontSize: "11px", color: "#666", lineHeight: 1.6, fontFamily: "monospace", wordBreak: "break-all" }}>{desc}</div>

              {file && (
                <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "0.5px solid #50565F" }}>
                  <div style={{ fontSize: "12px", color: s === "done" ? "#00ADB5" : s === "error" ? "#F07070" : "#888", display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2h5l3 3v5H2z" stroke="currentColor" strokeWidth="1" fill="none"/><path d="M7 2v3h3" stroke="currentColor" strokeWidth="1"/></svg>
                    {file.name}
                  </div>
                </div>
              )}

              {s === "idle" && !file && (
                <div style={{ marginTop: "14px", fontSize: "12px", color: "#666", display: "flex", alignItems: "center", gap: "5px" }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 9V3M3 6l3-3 3 3" stroke="#666" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Click to upload CSV
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "rgba(240,112,112,0.08)", border: "0.5px solid rgba(240,112,112,0.3)", borderRadius: "8px", padding: "10px 16px", marginBottom: "20px", fontSize: "13px", color: "#F07070", maxWidth: "820px", width: "100%" }}>
          {error}
        </div>
      )}

      {/* Process button */}
      <button
        onClick={handleProcess}
        disabled={!allUploaded || processing}
        style={{
          fontFamily: "'Geist', sans-serif",
          fontSize: "14px",
          fontWeight: 500,
          background: allUploaded && !processing ? "#00ADB5" : "#2C323C",
          color: allUploaded && !processing ? "#222831" : "#555",
          border: "none",
          borderRadius: "10px",
          padding: "12px 36px",
          cursor: allUploaded && !processing ? "pointer" : "not-allowed",
          transition: "background 0.15s, color 0.15s",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {processing ? (
          <>
            <div style={{ width: "14px", height: "14px", border: "1.5px solid #555", borderTop: "1.5px solid #888", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>
            Processing…
          </>
        ) : (
          <>
            Run triage scoring
            {allUploaded && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 4l3 3-3 3" stroke="#222831" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </>
        )}
      </button>

      <p style={{ fontSize: "12px", color: "#444", marginTop: "16px" }}>
        {allUploaded ? "All files ready — run scoring to continue" : `${Object.values(status).filter(s => s === "done").length} of 3 files uploaded`}
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}