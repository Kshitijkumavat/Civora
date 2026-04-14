const TIER_COLOR = { RED: "#F07070", YELLOW: "#F0C060", GREEN: "#00ADB5" };
const TIER_BG = {
  RED: "rgba(240,112,112,0.09)",
  YELLOW: "rgba(240,192,96,0.09)",
  GREEN: "rgba(0,173,181,0.09)",
};
const TIER_BORDER = {
  RED: "rgba(240,112,112,0.2)",
  YELLOW: "rgba(240,192,96,0.2)",
  GREEN: "rgba(0,173,181,0.2)",
};

function TierBadge({ tier }) {
  return (
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
        padding: "3px 9px",
        borderRadius: "20px",
      }}
    >
      <span
        style={{
          width: "4px",
          height: "4px",
          borderRadius: "50%",
          background: TIER_COLOR[tier],
          display: "inline-block",
          boxShadow: `0 0 4px ${TIER_COLOR[tier]}80`,
        }}
      />
      {tier}
    </span>
  );
}

function ScoreBar({ score, tier }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
      <span
        style={{
          fontSize: "13px",
          fontWeight: 500,
          minWidth: "26px",
          color: TIER_COLOR[tier],
          letterSpacing: "-0.01em",
        }}
      >
        {score}
      </span>
      <div
        style={{
          width: "56px",
          height: "3px",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: "3px",
            background: `linear-gradient(90deg, ${TIER_COLOR[tier]}80, ${TIER_COLOR[tier]})`,
            borderRadius: "2px",
          }}
        />
      </div>
    </div>
  );
}

const HEADERS = [
  { key: "segment", label: "Segment", width: "80px" },
  { key: "road", label: "Road", width: "auto" },
  { key: "subdivision", label: "Zone", width: "100px" },
  { key: "tier", label: "Tier", width: "90px" },
  { key: "score", label: "Score", width: "110px" },
  { key: "complaints", label: "Open", width: "56px" },
  { key: "maintained", label: "Last maintained", width: "130px" },
  { key: "arrow", label: "", width: "32px" },
];

export default function TriageTable({ segments, onSelect, selectedId }) {
  if (!segments.length) {
    return (
      <div
        style={{
          background: "#2C323C",
          borderRadius: "12px",
          padding: "56px 24px",
          textAlign: "center",
          border: "0.5px solid #3E454F",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ marginBottom: "12px", opacity: 0.25 }}>
          <circle cx="16" cy="16" r="14" stroke="#888" strokeWidth="1.2"/>
          <path d="M10 16h12M16 10v12" stroke="#888" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
        </svg>
        <div style={{ fontSize: "13px", color: "#444", marginBottom: "4px" }}>No segments match your filters</div>
        <div style={{ fontSize: "11px", color: "#333" }}>Try adjusting the search or tier filter</div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#2C323C",
        borderRadius: "12px",
        overflow: "hidden",
        border: "0.5px solid #3E454F",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <colgroup>
          {HEADERS.map(h => <col key={h.key} style={{ width: h.width }} />)}
        </colgroup>
        <thead>
          <tr style={{ borderBottom: "0.5px solid #3E454F", background: "#252B33" }}>
            {HEADERS.map(h => (
              <th
                key={h.key}
                style={{
                  fontSize: "10px",
                  color: "#3E454F",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  fontWeight: 500,
                  padding: "10px 16px",
                  textAlign: "left",
                  whiteSpace: "nowrap",
                }}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {segments.map((seg, idx) => {
            const active = seg.segment_id === selectedId;
            const isLast = idx === segments.length - 1;
            return (
              <tr
                key={seg.segment_id}
                onClick={() => onSelect(seg.segment_id)}
                style={{
                  borderBottom: isLast ? "none" : "0.5px solid rgba(62,69,79,0.5)",
                  background: active
                    ? `${TIER_BG[seg.priority_tier]}`
                    : "transparent",
                  cursor: "pointer",
                  transition: "background 0.1s",
                  borderLeft: active ? `2px solid ${TIER_COLOR[seg.priority_tier]}` : "2px solid transparent",
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Segment ID */}
                <td style={{ padding: "13px 16px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#484F5A",
                      fontFamily: "monospace",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {seg.segment_id}
                  </span>
                </td>

                {/* Road name + class */}
                <td style={{ padding: "13px 16px" }}>
                  <div style={{ fontSize: "13px", color: "#EEEEEE", fontWeight: 450, marginBottom: "2px" }}>
                    {seg.road_name}
                  </div>
                  <div style={{ fontSize: "10px", color: "#3E454F", letterSpacing: "0.02em" }}>
                    {seg.road_class}
                  </div>
                </td>

                {/* Subdivision */}
                <td style={{ padding: "13px 16px", fontSize: "12px", color: "#555" }}>
                  {seg.subdivision}
                </td>

                {/* Tier */}
                <td style={{ padding: "13px 16px" }}>
                  <TierBadge tier={seg.priority_tier} />
                </td>

                {/* Score */}
                <td style={{ padding: "13px 16px" }}>
                  <ScoreBar score={seg.priority_score} tier={seg.priority_tier} />
                </td>

                {/* Open complaints */}
                <td style={{ padding: "13px 16px" }}>
                  {seg.open_complaints > 0 ? (
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: TIER_COLOR[seg.priority_tier],
                      }}
                    >
                      {seg.open_complaints}
                    </span>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#333" }}>—</span>
                  )}
                </td>

                {/* Last maintained */}
                <td style={{ padding: "13px 16px" }}>
                  {seg.last_maintained ? (
                    <span style={{ fontSize: "11px", color: "#484F5A" }}>
                      {new Date(seg.last_maintained).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#333" }}>—</span>
                  )}
                </td>

                {/* Arrow */}
                <td style={{ padding: "13px 12px 13px 4px", textAlign: "right" }}>
                  <svg
                    width="13" height="13" viewBox="0 0 14 14" fill="none"
                    style={{
                      color: active ? TIER_COLOR[seg.priority_tier] : "#333",
                      transition: "color 0.1s, transform 0.1s",
                      transform: active ? "translateX(1px)" : "none",
                      display: "block",
                    }}
                  >
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