export default function KPIBar({ kpi }) {
  const total = (kpi.RED || 0) + (kpi.YELLOW || 0) + (kpi.GREEN || 0);

  const tiles = [
    {
      label: "Critical",
      value: kpi.RED,
      color: "#F07070",
      borderColor: "rgba(240,112,112,0.25)",
      glowColor: "rgba(240,112,112,0.08)",
      sub: "Fix within 7 days",
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="#F07070" strokeWidth="1.2"/>
          <path d="M7 4v3.5" stroke="#F07070" strokeWidth="1.3" strokeLinecap="round"/>
          <circle cx="7" cy="10" r="0.8" fill="#F07070"/>
        </svg>
      ),
    },
    {
      label: "Needs attention",
      value: kpi.YELLOW,
      color: "#F0C060",
      borderColor: "rgba(240,192,96,0.25)",
      glowColor: "rgba(240,192,96,0.08)",
      sub: "Plan within 30 days",
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2L13 12H1L7 2Z" stroke="#F0C060" strokeWidth="1.2" strokeLinejoin="round"/>
          <path d="M7 5.5v3" stroke="#F0C060" strokeWidth="1.3" strokeLinecap="round"/>
          <circle cx="7" cy="10" r="0.8" fill="#F0C060"/>
        </svg>
      ),
    },
    {
      label: "Stable",
      value: kpi.GREEN,
      color: "#00ADB5",
      borderColor: "rgba(0,173,181,0.25)",
      glowColor: "rgba(0,173,181,0.08)",
      sub: "Monitor only",
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="#00ADB5" strokeWidth="1.2"/>
          <path d="M4.5 7L6.5 9L9.5 5" stroke="#00ADB5" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: "Total segments",
      value: total,
      color: "#EEEEEE",
      borderColor: "rgba(255,255,255,0.08)",
      glowColor: "transparent",
      sub: kpi.last_updated
        ? `Updated ${new Date(kpi.last_updated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
        : "All segments",
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="1" width="12" height="12" rx="2.5" stroke="#888" strokeWidth="1.2"/>
          <path d="M3.5 5h7M3.5 7.5h5M3.5 10h7" stroke="#888" strokeWidth="1" strokeLinecap="round"/>
        </svg>
      ),
      barColor: null,
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "24px" }}>
      {tiles.map(({ label, value, color, borderColor, glowColor, sub, icon }) => {
        const pct = total > 0 && label !== "Total segments" ? Math.round((value / total) * 100) : null;

        return (
          <div
            key={label}
            style={{
              background: "#2C323C",
              border: `0.5px solid ${borderColor}`,
              borderRadius: "12px",
              padding: "18px 20px",
              position: "relative",
              overflow: "hidden",
              transition: "transform 0.15s ease, border-color 0.15s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
          >
            {/* Background glow */}
            <div style={{ position: "absolute", inset: 0, background: glowColor, pointerEvents: "none", borderRadius: "12px" }} />

            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ fontSize: "11px", color: "#555", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
              {icon}
            </div>

            {/* Value */}
            <div style={{ fontSize: "32px", fontWeight: 500, color, lineHeight: 1, marginBottom: "10px", letterSpacing: "-0.02em" }}>
              {value ?? "—"}
            </div>

            {/* Progress bar (for non-total tiles) */}
            {pct !== null && (
              <div style={{ marginBottom: "10px" }}>
                <div style={{ height: "2px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "2px",
                      background: color,
                      borderRadius: "2px",
                      opacity: 0.6,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Sub text */}
            <div style={{ fontSize: "11px", color: "#484F5A" }}>{sub}</div>
          </div>
        );
      })}
    </div>
  );
}