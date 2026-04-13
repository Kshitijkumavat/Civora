export default function KPIBar({ kpi }) {
  const tiles = [
    { label: "Critical", value: kpi.RED, color: "#F07070", bg: "rgba(240,112,112,0.08)", sub: "Fix within 7 days" },
    { label: "Needs attention", value: kpi.YELLOW, color: "#F0C060", bg: "rgba(240,192,96,0.08)", sub: "Plan within 30 days" },
    { label: "Stable", value: kpi.GREEN, color: "#00ADB5", bg: "rgba(0,173,181,0.08)", sub: "Monitor only" },
    { label: "Total segments", value: (kpi.RED || 0) + (kpi.YELLOW || 0) + (kpi.GREEN || 0), color: "#EEEEEE", bg: "transparent", sub: kpi.last_updated ? `Updated ${new Date(kpi.last_updated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" }}>
      {tiles.map(({ label, value, color, bg, sub }) => (
        <div key={label} style={{ background: "#393E46", borderRadius: "10px", padding: "18px 20px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: bg, pointerEvents: "none" }}/>
          <div style={{ fontSize: "11px", color: "#666", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px" }}>{label}</div>
          <div style={{ fontSize: "30px", fontWeight: 500, color, lineHeight: 1, marginBottom: "8px" }}>{value ?? "—"}</div>
          <div style={{ fontSize: "11px", color: "#555" }}>{sub}</div>
        </div>
      ))}
    </div>
  );
}