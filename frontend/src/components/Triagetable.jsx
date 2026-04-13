const TIER_COLOR = { RED: "#F07070", YELLOW: "#F0C060", GREEN: "#00ADB5" };
const TIER_BG = { RED: "rgba(240,112,112,0.10)", YELLOW: "rgba(240,192,96,0.10)", GREEN: "rgba(0,173,181,0.10)" };

function TierBadge({ tier }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      fontSize: "11px", fontWeight: 500,
      background: TIER_BG[tier], color: TIER_COLOR[tier],
      padding: "3px 9px", borderRadius: "20px",
    }}>
      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: TIER_COLOR[tier], display: "inline-block" }}/>
      {tier}
    </span>
  );
}

function ScoreBar({ score, tier }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: "13px", fontWeight: 500, minWidth: "24px", color: TIER_COLOR[tier] }}>{score}</span>
      <div style={{ width: "64px", height: "3px", background: "#50565F", borderRadius: "2px" }}>
        <div style={{ width: `${score}%`, height: "3px", background: TIER_COLOR[tier], borderRadius: "2px" }}/>
      </div>
    </div>
  );
}

export default function TriageTable({ segments, onSelect, selectedId }) {
  if (!segments.length) {
    return (
      <div style={{ background: "#393E46", borderRadius: "10px", padding: "48px 24px", textAlign: "center", color: "#555", fontSize: "13px" }}>
        No segments match your filters.
      </div>
    );
  }

  return (
    <div style={{ background: "#393E46", borderRadius: "10px", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "0.5px solid #50565F" }}>
            {["Segment", "Road", "Subdivision", "Tier", "Score", "Complaints", "Last maintained", ""].map(h => (
              <th key={h} style={{ fontSize: "11px", color: "#555", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500, padding: "11px 16px", textAlign: "left" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {segments.map((seg) => {
            const active = seg.segment_id === selectedId;
            return (
              <tr
                key={seg.segment_id}
                onClick={() => onSelect(seg.segment_id)}
                style={{
                  borderBottom: "0.5px solid rgba(80,86,95,0.35)",
                  background: active ? "rgba(0,173,181,0.05)" : "transparent",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <td style={{ padding: "13px 16px", fontSize: "12px", color: "#666", fontFamily: "monospace" }}>{seg.segment_id}</td>
                <td style={{ padding: "13px 16px" }}>
                  <div style={{ fontSize: "13px", color: "#EEEEEE" }}>{seg.road_name}</div>
                  <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>{seg.road_class}</div>
                </td>
                <td style={{ padding: "13px 16px", fontSize: "12px", color: "#666" }}>{seg.subdivision}</td>
                <td style={{ padding: "13px 16px" }}><TierBadge tier={seg.priority_tier}/></td>
                <td style={{ padding: "13px 16px" }}><ScoreBar score={seg.priority_score} tier={seg.priority_tier}/></td>
                <td style={{ padding: "13px 16px", fontSize: "13px", color: seg.open_complaints > 0 ? TIER_COLOR[seg.priority_tier] : "#555" }}>
                  {seg.open_complaints > 0 ? seg.open_complaints : "—"}
                </td>
                <td style={{ padding: "13px 16px", fontSize: "12px", color: "#555" }}>
                  {seg.last_maintained ? new Date(seg.last_maintained).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </td>
                <td style={{ padding: "13px 16px" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: active ? "#00ADB5" : "#444" }}>
                    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}