const tiers = ["All", "RED", "YELLOW", "GREEN"];
const sorts = [
  { value: "score", label: "Score" },
  { value: "complaints", label: "Complaints" },
  { value: "last_maintained", label: "Last maintained" },
];

const inputStyle = {
  fontFamily: "'Geist', sans-serif",
  fontSize: "13px",
  background: "#393E46",
  border: "0.5px solid #50565F",
  color: "#EEEEEE",
  padding: "8px 12px",
  borderRadius: "8px",
  outline: "none",
};

export default function FilterBar({ tier, setTier, sort, setSort, search, setSearch }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
      {/* Search */}
      <div style={{ flex: 1, position: "relative" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "#555", pointerEvents: "none" }}>
          <circle cx="6" cy="6" r="4.5" stroke="#555" strokeWidth="1.2"/>
          <path d="M9.5 9.5L12 12" stroke="#555" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <input
          style={{ ...inputStyle, width: "100%", paddingLeft: "32px", boxSizing: "border-box" }}
          placeholder="Search by road name or segment ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Tier filter pills */}
      <div style={{ display: "flex", gap: "4px", background: "#393E46", padding: "4px", borderRadius: "8px" }}>
        {tiers.map(t => {
          const active = tier === t;
          const accent = t === "RED" ? "#F07070" : t === "YELLOW" ? "#F0C060" : t === "GREEN" ? "#00ADB5" : "#EEEEEE";
          return (
            <button
              key={t}
              onClick={() => setTier(t)}
              style={{
                fontFamily: "'Geist', sans-serif",
                fontSize: "12px",
                fontWeight: active ? 500 : 400,
                background: active ? (t === "All" ? "#50565F" : `${accent}18`) : "transparent",
                color: active ? (t === "All" ? "#EEEEEE" : accent) : "#666",
                border: "none",
                borderRadius: "6px",
                padding: "5px 12px",
                cursor: "pointer",
                transition: "all 0.12s",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Sort */}
      <select
        style={inputStyle}
        value={sort}
        onChange={e => setSort(e.target.value)}
      >
        {sorts.map(s => (
          <option key={s.value} value={s.value}>Sort: {s.label}</option>
        ))}
      </select>
    </div>
  );
}