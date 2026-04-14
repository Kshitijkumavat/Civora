import { useEffect, useState } from "react";
import axios from "axios";

const TIER_COLOR = { RED: "#F07070", YELLOW: "#F0C060", GREEN: "#00ADB5" };
const TIER_BG = {
  RED: "rgba(240,112,112,0.10)",
  YELLOW: "rgba(240,192,96,0.10)",
  GREEN: "rgba(0,173,181,0.10)",
};
const TIER_BORDER = {
  RED: "rgba(240,112,112,0.22)",
  YELLOW: "rgba(240,192,96,0.22)",
  GREEN: "rgba(0,173,181,0.22)",
};

const SCORE_FACTORS = [
  { key: "complaint_volume", label: "Complaint volume", max: 30 },
  { key: "complaint_recency", label: "Complaint recency", max: 20 },
  { key: "maintenance_gap", label: "Maintenance gap", max: 25 },
  { key: "maintenance_effectiveness", label: "Effectiveness", max: 15 },
  { key: "road_importance", label: "Road importance", max: 10 },
];

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: "10px",
        color: "#3E454F",
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        fontWeight: 500,
        margin: "24px 0 10px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <div style={{ flex: 1, height: "0.5px", background: "#2C323C" }} />
      {children}
      <div style={{ flex: 1, height: "0.5px", background: "#2C323C" }} />
    </div>
  );
}

function InfoBlock({ children }) {
  return (
    <div
      style={{
        background: "#222831",
        border: "0.5px solid #2C323C",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

export default function SegmentDetail({ segmentId, segment: segmentProp, onClose, useMock }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!segmentId) return;

    if (useMock && segmentProp) {
      setData(segmentProp);
      return;
    }

    setLoading(true);
    setData(null);
    axios
      .get(`/api/segments/${segmentId}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [segmentId, segmentProp, useMock]);

  const visible = !!segmentId;
  const tier = data?.priority_tier;

  return (
    <>
      {/* Backdrop */}
      {visible && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(22,28,36,0.7)",
            zIndex: 10,
            backdropFilter: "blur(3px)",
            WebkitBackdropFilter: "blur(3px)",
            transition: "opacity 0.2s",
          }}
        />
      )}

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "380px",
          background: "#1C2128",
          borderLeft: `0.5px solid ${visible && tier ? TIER_BORDER[tier] : "#2C323C"}`,
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.24s cubic-bezier(0.4,0,0.2,1), border-color 0.24s ease",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Top accent line */}
        {tier && (
          <div
            style={{
              height: "2px",
              background: `linear-gradient(90deg, ${TIER_COLOR[tier]}00, ${TIER_COLOR[tier]}, ${TIER_COLOR[tier]}00)`,
              position: "sticky",
              top: 0,
              zIndex: 2,
              transition: "background 0.3s",
            }}
          />
        )}

        {/* Panel header */}
        <div
          style={{
            padding: "18px 20px 16px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            position: "sticky",
            top: tier ? "2px" : 0,
            background: "#1C2128",
            zIndex: 1,
            borderBottom: "0.5px solid #2C323C",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "9px", color: "#3E454F", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>
              Segment detail
            </div>
            {data ? (
              <>
                <div style={{ fontSize: "15px", fontWeight: 500, color: "#EEEEEE", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {data.road_name}
                </div>
                <div style={{ fontSize: "11px", color: "#484F5A", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>{data.road_class}</span>
                  <span style={{ color: "#2C323C" }}>·</span>
                  <span style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.03em" }}>{data.segment_id}</span>
                </div>
              </>
            ) : (
              <div style={{ fontSize: "14px", fontWeight: 500, color: "#3E454F", fontFamily: "monospace" }}>{segmentId}</div>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              background: "#2C323C",
              border: "0.5px solid #3E454F",
              color: "#555",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "7px",
              lineHeight: 1,
              flexShrink: 0,
              marginLeft: "12px",
              transition: "background 0.12s, color 0.12s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#393E46";
              e.currentTarget.style.color = "#EEEEEE";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#2C323C";
              e.currentTarget.style.color = "#555";
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "0 20px 40px", flex: 1 }}>
          {/* Loading */}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  border: "1.5px solid #2C323C",
                  borderTop: `1.5px solid ${tier ? TIER_COLOR[tier] : "#00ADB5"}`,
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }}
              />
            </div>
          )}

          {data && (
            <>
              {/* Hero: tier + score */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  marginTop: "20px",
                  padding: "16px",
                  background: TIER_BG[tier],
                  border: `0.5px solid ${TIER_BORDER[tier]}`,
                  borderRadius: "10px",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "10px",
                    fontWeight: 500,
                    letterSpacing: "0.05em",
                    background: TIER_BG[tier],
                    color: TIER_COLOR[tier],
                    border: `0.5px solid ${TIER_BORDER[tier]}`,
                    padding: "4px 10px",
                    borderRadius: "20px",
                  }}
                >
                  <span
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: TIER_COLOR[tier],
                      boxShadow: `0 0 5px ${TIER_COLOR[tier]}`,
                      display: "inline-block",
                    }}
                  />
                  {tier}
                </span>

                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <span style={{ fontSize: "30px", fontWeight: 500, color: TIER_COLOR[tier], lineHeight: 1, letterSpacing: "-0.02em" }}>
                    {data.priority_score}
                  </span>
                  <span style={{ fontSize: "13px", color: "#3E454F" }}>/100</span>
                </div>

                {data.backlog_days > 0 && (
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{ fontSize: "16px", fontWeight: 500, color: "#EEEEEE", lineHeight: 1 }}>{data.backlog_days}d</div>
                    <div style={{ fontSize: "10px", color: "#3E454F", marginTop: "2px" }}>backlog</div>
                  </div>
                )}
              </div>

              {/* Score breakdown */}
              <SectionLabel>Score breakdown</SectionLabel>
              <InfoBlock>
                {SCORE_FACTORS.map(({ key, label, max }, i) => {
                  const val = data.score_breakdown?.[key] ?? 0;
                  const pct = Math.round((val / max) * 100);
                  return (
                    <div
                      key={key}
                      style={{
                        padding: "11px 14px",
                        borderBottom: i < SCORE_FACTORS.length - 1 ? "0.5px solid rgba(44,50,60,0.8)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
                        <span style={{ fontSize: "12px", color: "#888" }}>{label}</span>
                        <span style={{ fontSize: "12px", color: "#EEEEEE", fontWeight: 500 }}>
                          {val}
                          <span style={{ color: "#3E454F", fontWeight: 400 }}> / {max}</span>
                        </span>
                      </div>
                      <div style={{ height: "2px", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "2px",
                            background: `linear-gradient(90deg, ${TIER_COLOR[tier]}60, ${TIER_COLOR[tier]})`,
                            borderRadius: "2px",
                            transition: "width 0.5s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </InfoBlock>

              {/* Analysis narrative */}
              {data.reason_narrative && (
                <>
                  <SectionLabel>Analysis</SectionLabel>
                  <div
                    style={{
                      background: "#222831",
                      border: "0.5px solid #2C323C",
                      borderRadius: "10px",
                      padding: "14px 16px",
                      fontSize: "12px",
                      color: "#666",
                      lineHeight: 1.75,
                    }}
                  >
                    {data.reason_narrative}
                  </div>
                </>
              )}

              {/* Recommendation */}
              {data.recommendation && (
                <>
                  <SectionLabel>Recommendation</SectionLabel>
                  <div
                    style={{
                      background: `${TIER_BG[tier]}`,
                      border: `0.5px solid ${TIER_BORDER[tier]}`,
                      borderRadius: "10px",
                      padding: "12px 14px",
                      fontSize: "12px",
                      color: TIER_COLOR[tier],
                      lineHeight: 1.7,
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
                      <path d="M7 1l1.5 4H13L9.5 7.5l1.5 4L7 9l-4 2.5 1.5-4L1 5h4.5L7 1z" stroke={TIER_COLOR[tier]} strokeWidth="1" strokeLinejoin="round" fill="none"/>
                    </svg>
                    {data.recommendation}
                  </div>
                </>
              )}

              {/* Inspector note */}
              {data.inspector_note && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.02)",
                    border: "0.5px solid #2C323C",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "#484F5A",
                    lineHeight: 1.6,
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-start",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
                    <circle cx="6" cy="6" r="5" stroke="#484F5A" strokeWidth="1"/>
                    <path d="M6 5v3" stroke="#484F5A" strokeWidth="1.2" strokeLinecap="round"/>
                    <circle cx="6" cy="3.5" r="0.6" fill="#484F5A"/>
                  </svg>
                  <span>Inspector note: {data.inspector_note}</span>
                </div>
              )}

              {/* Complaints */}
              {data.complaints?.length > 0 && (
                <>
                  <SectionLabel>Complaints ({data.complaints.length})</SectionLabel>
                  <InfoBlock>
                    {data.complaints.map((c, i) => (
                      <div
                        key={c.complaint_id}
                        style={{
                          padding: "11px 14px",
                          borderBottom: i < data.complaints.length - 1 ? "0.5px solid rgba(44,50,60,0.8)" : "none",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "12px", color: "#EEEEEE", marginBottom: "3px" }}>{c.type}</div>
                          <div style={{ fontSize: "10px", color: "#3E454F", fontFamily: "monospace", letterSpacing: "0.02em" }}>
                            {c.complaint_id} · {c.date}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 500,
                            padding: "3px 8px",
                            borderRadius: "10px",
                            background: c.status === "Open" ? "rgba(240,112,112,0.1)" : "rgba(0,173,181,0.1)",
                            color: c.status === "Open" ? "#F07070" : "#00ADB5",
                            border: `0.5px solid ${c.status === "Open" ? "rgba(240,112,112,0.2)" : "rgba(0,173,181,0.2)"}`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </InfoBlock>
                </>
              )}

              {/* Maintenance history */}
              {data.maintenance_history?.length > 0 && (
                <>
                  <SectionLabel>Maintenance history</SectionLabel>
                  <InfoBlock>
                    {data.maintenance_history.map((m, i) => (
                      <div
                        key={m.maintenance_id}
                        style={{
                          padding: "11px 14px",
                          borderBottom: i < data.maintenance_history.length - 1 ? "0.5px solid rgba(44,50,60,0.8)" : "none",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "4px" }}>
                          <div style={{ fontSize: "12px", color: "#EEEEEE" }}>{m.repair_type}</div>
                          <div style={{ fontSize: "10px", color: "#3E454F", whiteSpace: "nowrap" }}>{m.date}</div>
                        </div>
                        <div style={{ fontSize: "11px", color: "#484F5A", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <span>{m.contractor}</span>
                          {m.cost_inr && (
                            <span style={{ color: "#3E454F" }}>
                              ₹{Number(m.cost_inr).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </InfoBlock>
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