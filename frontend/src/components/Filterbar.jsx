const tiers = ["All", "RED", "YELLOW", "GREEN"];
const sorts = [
  { value: "score", label: "Priority score" },
  { value: "complaints", label: "Open complaints" },
  { value: "last_maintained", label: "Last maintained" },
  { value: "name", label: "Road name" },
];

const TIER_ACCENT = {
  RED: "#F07070",
  YELLOW: "#F0C060",
  GREEN: "#00ADB5",
};

const inputBase = {
  fontFamily: "inherit",
  fontSize: "12px",
  background: "#2C323C",
  border: "0.5px solid #3E454F",
  color: "#EEEEEE",
  borderRadius: "8px",
  outline: "none",
  transition: "border-color 0.12s ease",
};

export default function FilterBar({
  tier, setTier,
  sort, setSort,
  search, setSearch,
  subdivision, setSubdivision,
  roadClass, setRoadClass,
  options = {},
  highRiskOnly, setHighRiskOnly,
  resultCount,
  onClear,
}) {
  const hasActiveFilters =
    tier !== "All" ||
    search ||
    (subdivision && subdivision !== "All") ||
    (roadClass && roadClass !== "All") ||
    highRiskOnly;

  return (
    <div style={{ marginBottom: "16px" }}>
      {/* Primary row */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ flex: "1 1 220px", position: "relative", minWidth: "180px" }}>
          <svg
            width="13" height="13" viewBox="0 0 14 14" fill="none"
            style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.35 }}
          >
            <circle cx="6" cy="6" r="4.5" stroke="#EEEEEE" strokeWidth="1.2"/>
            <path d="M9.5 9.5L12 12" stroke="#EEEEEE" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <input
            style={{ ...inputBase, width: "100%", padding: "8px 12px 8px 32px", boxSizing: "border-box" }}
            placeholder="Search road name or segment ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={e => (e.target.style.borderColor = "#00ADB5")}
            onBlur={e => (e.target.style.borderColor = "#3E454F")}
          />
        </div>

        {/* Tier pills */}
        <div style={{ display: "flex", gap: "3px", background: "#252B33", padding: "3px", borderRadius: "9px", border: "0.5px solid #3E454F" }}>
          {tiers.map(t => {
            const active = tier === t;
            const accent = TIER_ACCENT[t];
            return (
              <button
                key={t}
                onClick={() => setTier(t)}
                style={{
                  fontFamily: "inherit",
                  fontSize: "11px",
                  fontWeight: active ? 500 : 400,
                  background: active
                    ? t === "All" ? "rgba(255,255,255,0.07)" : `${accent}18`
                    : "transparent",
                  color: active ? (t === "All" ? "#EEEEEE" : accent) : "#555",
                  border: active && t !== "All" ? `0.5px solid ${accent}40` : "0.5px solid transparent",
                  borderRadius: "6px",
                  padding: "5px 11px",
                  cursor: "pointer",
                  transition: "all 0.12s",
                  letterSpacing: t === "All" ? "normal" : "0.02em",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                {t !== "All" && (
                  <span style={{
                    width: "5px", height: "5px", borderRadius: "50%",
                    background: active ? accent : "#444",
                    display: "inline-block",
                    transition: "background 0.12s",
                  }}/>
                )}
                {t}
              </button>
            );
          })}
        </div>

        {/* Sort select */}
        <div style={{ position: "relative" }}>
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.35 }}
          >
            <path d="M2 4l4-3 4 3M2 8l4 3 4-3" stroke="#EEEEEE" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <select
            style={{ ...inputBase, padding: "8px 10px 8px 28px", paddingRight: "28px", cursor: "pointer", appearance: "none", WebkitAppearance: "none" }}
            value={sort}
            onChange={e => setSort(e.target.value)}
            onFocus={e => (e.target.style.borderColor = "#00ADB5")}
            onBlur={e => (e.target.style.borderColor = "#3E454F")}
          >
            {sorts.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <svg
            width="10" height="10" viewBox="0 0 10 10" fill="none"
            style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.35 }}
          >
            <path d="M2 4l3 3 3-3" stroke="#EEEEEE" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Secondary filters (subdivision + road class) if options provided */}
        {options.subdivisions && options.subdivisions.length > 2 && (
          <div style={{ position: "relative" }}>
            <select
              style={{ ...inputBase, padding: "8px 28px 8px 10px", cursor: "pointer", appearance: "none", WebkitAppearance: "none" }}
              value={subdivision || "All"}
              onChange={e => setSubdivision(e.target.value)}
              onFocus={e => (e.target.style.borderColor = "#00ADB5")}
              onBlur={e => (e.target.style.borderColor = "#3E454F")}
            >
              {options.subdivisions.map(s => (
                <option key={s} value={s}>{s === "All" ? "All zones" : s}</option>
              ))}
            </select>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.35 }}>
              <path d="M2 4l3 3 3-3" stroke="#EEEEEE" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}

        {options.roadClasses && options.roadClasses.length > 2 && (
          <div style={{ position: "relative" }}>
            <select
              style={{ ...inputBase, padding: "8px 28px 8px 10px", cursor: "pointer", appearance: "none", WebkitAppearance: "none" }}
              value={roadClass || "All"}
              onChange={e => setRoadClass(e.target.value)}
              onFocus={e => (e.target.style.borderColor = "#00ADB5")}
              onBlur={e => (e.target.style.borderColor = "#3E454F")}
            >
              {options.roadClasses.map(c => (
                <option key={c} value={c}>{c === "All" ? "All classes" : c}</option>
              ))}
            </select>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.35 }}>
              <path d="M2 4l3 3 3-3" stroke="#EEEEEE" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}

        {/* High risk toggle */}
        {setHighRiskOnly && (
          <button
            onClick={() => setHighRiskOnly(!highRiskOnly)}
            style={{
              fontFamily: "inherit",
              fontSize: "11px",
              fontWeight: highRiskOnly ? 500 : 400,
              background: highRiskOnly ? "rgba(240,112,112,0.12)" : "#2C323C",
              color: highRiskOnly ? "#F07070" : "#555",
              border: `0.5px solid ${highRiskOnly ? "rgba(240,112,112,0.3)" : "#3E454F"}`,
              borderRadius: "8px",
              padding: "8px 12px",
              cursor: "pointer",
              transition: "all 0.12s",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              whiteSpace: "nowrap",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1L6.5 4H9.5L7 6L8 9L5 7L2 9L3 6L0.5 4H3.5L5 1Z"
                fill={highRiskOnly ? "#F07070" : "none"}
                stroke={highRiskOnly ? "#F07070" : "#555"}
                strokeWidth="1" strokeLinejoin="round"
              />
            </svg>
            High risk only
          </button>
        )}

        {/* Clear filters */}
        {hasActiveFilters && onClear && (
          <button
            onClick={onClear}
            style={{
              fontFamily: "inherit",
              fontSize: "11px",
              background: "transparent",
              color: "#444",
              border: "none",
              padding: "8px 6px",
              cursor: "pointer",
              transition: "color 0.12s",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#888")}
            onMouseLeave={e => (e.currentTarget.style.color = "#444")}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      {resultCount !== undefined && (
        <div style={{ marginTop: "10px", fontSize: "11px", color: "#3E454F", letterSpacing: "0.02em" }}>
          {resultCount === 0 ? "No segments match" : `${resultCount} segment${resultCount !== 1 ? "s" : ""}`}
          {hasActiveFilters && <span style={{ color: "#2E3440" }}> · filtered</span>}
        </div>
      )}
    </div>
  );
}