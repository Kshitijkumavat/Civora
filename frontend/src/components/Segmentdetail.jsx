import { useEffect, useState } from "react";
import axios from "axios";

const TIER_COLOR = { RED: "#F07070", YELLOW: "#F0C060", GREEN: "#00ADB5" };
const TIER_BG = { RED: "rgba(240,112,112,0.10)", YELLOW: "rgba(240,192,96,0.10)", GREEN: "rgba(0,173,181,0.10)" };

const SCORE_FACTORS = [
  { key: "complaint_volume", label: "Complaint volume", max: 30 },
  { key: "complaint_recency", label: "Complaint recency", max: 20 },
  { key: "maintenance_gap", label: "Maintenance gap", max: 25 },
  { key: "maintenance_effectiveness", label: "Effectiveness", max: 15 },
  { key: "road_importance", label: "Road importance", max: 10 },
];

function SectionLabel({ children }) {
  return <div style={{ fontSize: "10px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", margin: "20px 0 10px" }}>{children}</div>;
}

export default function SegmentDetail({ segmentId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!segmentId) return;
    setLoading(true);
    setData(null);
    axios.get(`/api/segments/${segmentId}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [segmentId]);

  const visible = !!segmentId;

  return (
    <>
      {/* Backdrop */}
      {visible && (
        <div
          onClick={onClose}
          style={{ position: "fixed", inset: 0, background: "rgba(34,40,49,0.6)", zIndex: 10, backdropFilter: "blur(2px)" }}
        />
      )}

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, height: "100vh", width: "360px",
        background: "#2C323C", borderLeft: "0.5px solid #50565F",
        zIndex: 20, display: "flex", flexDirection: "column",
        transform: visible ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1)",
        overflowY: "auto",
      }}>
        {/* Panel header */}
        <div style={{ padding: "20px 20px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "sticky", top: 0, background: "#2C323C", zIndex: 1, paddingBottom: "16px", borderBottom: "0.5px solid #393E46" }}>
          <div>
            <div style={{ fontSize: "10px", color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>Segment detail</div>
            {data ? (
              <>
                <div style={{ fontSize: "16px", fontWeight: 500, color: "#EEEEEE" }}>{data.road_name}</div>
                <div style={{ fontSize: "12px", color: "#555", marginTop: "2px" }}>{data.road_class} · {data.segment_id}</div>
              </>
            ) : (
              <div style={{ fontSize: "16px", fontWeight: 500, color: "#555" }}>{segmentId}</div>
            )}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", padding: "2px", lineHeight: 1, marginTop: "2px" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div style={{ padding: "0 20px 32px", flex: 1 }}>
          {loading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0" }}>
              <div style={{ width: "18px", height: "18px", border: "1.5px solid #393E46", borderTop: "1.5px solid #00ADB5", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>
            </div>
          )}

          {data && (
            <>
              {/* Tier + score hero */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "20px", marginBottom: "4px" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  fontSize: "11px", fontWeight: 500,
                  background: TIER_BG[data.priority_tier], color: TIER_COLOR[data.priority_tier],
                  padding: "4px 10px", borderRadius: "20px",
                }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: TIER_COLOR[data.priority_tier], display: "inline-block" }}/>
                  {data.priority_tier}
                </span>
                <span style={{ fontSize: "26px", fontWeight: 500, color: TIER_COLOR[data.priority_tier], lineHeight: 1 }}>{data.priority_score}</span>
                <span style={{ fontSize: "13px", color: "#555" }}>/ 100</span>
              </div>

              {/* Score breakdown */}
              <SectionLabel>Score breakdown</SectionLabel>
              <div style={{ background: "#393E46", borderRadius: "8px", overflow: "hidden" }}>
                {SCORE_FACTORS.map(({ key, label, max }, i) => {
                  const val = data.score_breakdown?.[key] ?? 0;
                  const pct = (val / max) * 100;
                  return (
                    <div key={key} style={{ padding: "11px 14px", borderBottom: i < SCORE_FACTORS.length - 1 ? "0.5px solid rgba(80,86,95,0.4)" : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "12px", color: "#AAA" }}>{label}</span>
                        <span style={{ fontSize: "12px", color: "#EEEEEE", fontWeight: 500 }}>{val} <span style={{ color: "#555", fontWeight: 400 }}>/ {max}</span></span>
                      </div>
                      <div style={{ height: "3px", background: "#50565F", borderRadius: "2px" }}>
                        <div style={{ width: `${pct}%`, height: "3px", background: TIER_COLOR[data.priority_tier], borderRadius: "2px", transition: "width 0.4s ease" }}/>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reason narrative */}
              <SectionLabel>Analysis</SectionLabel>
              <div style={{ background: "#393E46", borderRadius: "8px", padding: "14px", fontSize: "12px", color: "#888", lineHeight: 1.7 }}>
                {data.reason_narrative}
              </div>

              {/* Complaints */}
              {data.complaints?.length > 0 && (
                <>
                  <SectionLabel>Complaints ({data.complaints.length})</SectionLabel>
                  <div style={{ background: "#393E46", borderRadius: "8px", overflow: "hidden" }}>
                    {data.complaints.map((c, i) => (
                      <div key={c.complaint_id} style={{ padding: "11px 14px", borderBottom: i < data.complaints.length - 1 ? "0.5px solid rgba(80,86,95,0.4)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: "12px", color: "#EEEEEE" }}>{c.type}</div>
                          <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>{c.complaint_id} · {c.date}</div>
                        </div>
                        <span style={{
                          fontSize: "10px", fontWeight: 500, padding: "2px 8px", borderRadius: "10px",
                          background: c.status === "Open" ? "rgba(240,112,112,0.12)" : "rgba(0,173,181,0.12)",
                          color: c.status === "Open" ? "#F07070" : "#00ADB5",
                        }}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Maintenance history */}
              {data.maintenance_history?.length > 0 && (
                <>
                  <SectionLabel>Maintenance history</SectionLabel>
                  <div style={{ background: "#393E46", borderRadius: "8px", overflow: "hidden" }}>
                    {data.maintenance_history.map((m, i) => (
                      <div key={m.maintenance_id} style={{ padding: "11px 14px", borderBottom: i < data.maintenance_history.length - 1 ? "0.5px solid rgba(80,86,95,0.4)" : "none" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div style={{ fontSize: "12px", color: "#EEEEEE" }}>{m.repair_type}</div>
                          <div style={{ fontSize: "11px", color: "#555" }}>{m.date}</div>
                        </div>
                        <div style={{ fontSize: "11px", color: "#555", marginTop: "3px", display: "flex", gap: "10px" }}>
                          <span>{m.contractor}</span>
                          {m.cost_inr && <span>₹{Number(m.cost_inr).toLocaleString("en-IN")}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}