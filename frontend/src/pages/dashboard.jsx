import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import KPIBar from "../components/KPIBar";
import FilterBar from "../components/FilterBar";
import TriageTable from "../components/TriageTable";
import SegmentDetail from "../components/SegmentDetail";

// ─── Mock data for frontend-only dev ───────────────────────────────────────
const MOCK_KPI = { RED: 12, YELLOW: 19, GREEN: 19, last_updated: new Date().toISOString() };

const MOCK_SEGMENTS = [
  { segment_id: "RD-001", road_name: "MG Road", road_class: "State Highway", subdivision: "North Zone", priority_tier: "RED", priority_score: 78, open_complaints: 6, last_maintained: "2024-02-10" },
  { segment_id: "RD-007", road_name: "Station Road", road_class: "District Road", subdivision: "Central Zone", priority_tier: "RED", priority_score: 72, open_complaints: 5, last_maintained: "2024-03-05" },
  { segment_id: "RD-012", road_name: "Ring Road South", road_class: "National Highway", subdivision: "South Zone", priority_tier: "RED", priority_score: 85, open_complaints: 9, last_maintained: "2024-01-20" },
  { segment_id: "RD-003", road_name: "Gandhi Nagar Link", road_class: "District Road", subdivision: "East Zone", priority_tier: "RED", priority_score: 70, open_complaints: 4, last_maintained: "2024-02-28" },
  { segment_id: "RD-019", road_name: "Nehru Nagar Road", road_class: "District Road", subdivision: "North Zone", priority_tier: "YELLOW", priority_score: 58, open_complaints: 3, last_maintained: "2024-08-14" },
  { segment_id: "RD-023", road_name: "Market Street", road_class: "District Road", subdivision: "Central Zone", priority_tier: "YELLOW", priority_score: 51, open_complaints: 2, last_maintained: "2024-07-01" },
  { segment_id: "RD-028", road_name: "Hospital Road", road_class: "State Highway", subdivision: "South Zone", priority_tier: "YELLOW", priority_score: 63, open_complaints: 4, last_maintained: "2024-09-10" },
  { segment_id: "RD-031", road_name: "Village Link 4", road_class: "Panchayat Road", subdivision: "West Zone", priority_tier: "GREEN", priority_score: 22, open_complaints: 0, last_maintained: "2024-11-03" },
  { segment_id: "RD-044", road_name: "Forest Bypass", road_class: "State Highway", subdivision: "East Zone", priority_tier: "GREEN", priority_score: 34, open_complaints: 1, last_maintained: "2024-10-15" },
  { segment_id: "RD-050", road_name: "Industrial Area Rd", road_class: "District Road", subdivision: "South Zone", priority_tier: "GREEN", priority_score: 18, open_complaints: 0, last_maintained: "2025-01-07" },
];

// Set USE_MOCK = false once backend is live
const USE_MOCK = true;
// ────────────────────────────────────────────────────────────────────────────

export default function Dashboard({ onUploadMore }) {
  const [kpi, setKpi] = useState(null);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState("All");
  const [sort, setSort] = useState("score");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (USE_MOCK) {
      setKpi(MOCK_KPI);
      setSegments(MOCK_SEGMENTS);
      setLoading(false);
      return;
    }
    Promise.all([axios.get("/api/kpi"), axios.get("/api/segments")])
      .then(([k, s]) => { setKpi(k.data); setSegments(s.data); })
      .finally(() => setLoading(false));
  }, []);

  // Re-fetch segments when filters change (real API mode)
  useEffect(() => {
    if (USE_MOCK || loading) return;
    const params = {};
    if (tier !== "All") params.tier = tier;
    if (search) params.search = search;
    if (sort) params.sort = sort;
    axios.get("/api/segments", { params }).then(r => setSegments(r.data));
  }, [tier, sort, search]);

  // In mock mode: filter + sort client-side
  const displaySegments = useMemo(() => {
    if (!USE_MOCK) return segments;
    let s = [...segments];
    if (tier !== "All") s = s.filter(x => x.priority_tier === tier);
    if (search) {
      const q = search.toLowerCase();
      s = s.filter(x => x.road_name.toLowerCase().includes(q) || x.segment_id.toLowerCase().includes(q));
    }
    if (sort === "score") s.sort((a, b) => b.priority_score - a.priority_score);
    else if (sort === "complaints") s.sort((a, b) => b.open_complaints - a.open_complaints);
    else if (sort === "last_maintained") s.sort((a, b) => new Date(a.last_maintained) - new Date(b.last_maintained));
    return s;
  }, [segments, tier, sort, search]);

  const handleExport = () => {
    if (USE_MOCK) { alert("Export available once backend is connected."); return; }
    const params = new URLSearchParams();
    if (tier !== "All") params.append("tier", tier);
    if (search) params.append("search", search);
    window.open(`/api/export/csv?${params}`);
  };

  return (
    <div style={{ minHeight: "100vh", padding: "28px 32px" }}>
      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="1" y="1" width="20" height="20" rx="5" stroke="#00ADB5" strokeWidth="1.2" fill="none"/>
            <path d="M5 14h12M5 11h8M5 8h12" stroke="#00ADB5" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 500, color: "#EEEEEE" }}>Road Maintenance Triage</div>
            <div style={{ fontSize: "11px", color: "#555", marginTop: "1px" }}>
              {USE_MOCK ? "Mock data — connect backend to go live" : `${segments.length} segments loaded`}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleExport}
            style={{ fontFamily: "'Geist', sans-serif", fontSize: "12px", fontWeight: 500, background: "transparent", border: "0.5px solid #393E46", color: "#888", padding: "7px 14px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#50565F"; e.currentTarget.style.color = "#EEEEEE"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#393E46"; e.currentTarget.style.color = "#888"; }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 5l3 3 3-3M2 9h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Export CSV
          </button>
          <button
            onClick={onUploadMore}
            style={{ fontFamily: "'Geist', sans-serif", fontSize: "12px", fontWeight: 500, background: "transparent", border: "0.5px solid #393E46", color: "#888", padding: "7px 14px", borderRadius: "8px", cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#50565F"; e.currentTarget.style.color = "#EEEEEE"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#393E46"; e.currentTarget.style.color = "#888"; }}
          >
            Re-upload
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "96px 0" }}>
          <div style={{ width: "20px", height: "20px", border: "1.5px solid #393E46", borderTop: "1.5px solid #00ADB5", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>
        </div>
      ) : (
        <>
          {kpi && <KPIBar kpi={kpi} />}
          <FilterBar tier={tier} setTier={setTier} sort={sort} setSort={setSort} search={search} setSearch={setSearch} />
          <TriageTable segments={displaySegments} onSelect={setSelectedId} selectedId={selectedId} />
        </>
      )}

      <SegmentDetail segmentId={selectedId} onClose={() => setSelectedId(null)} />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}