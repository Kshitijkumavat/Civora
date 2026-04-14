import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import KPIBar from "../components/Kpibar";
import FilterBar from "../components/Filterbar";
import TriageTable from "../components/Triagetable";
import SegmentDetail from "../components/Segmentdetail";

const MOCK_KPI = { RED: 12, YELLOW: 19, GREEN: 19, last_updated: new Date().toISOString() };

const MOCK_SEGMENTS = [
  { segment_id: "RD-001", road_name: "MG Road", road_class: "State Highway", subdivision: "North Zone", priority_tier: "RED", priority_score: 78, open_complaints: 6, last_maintained: "2024-02-10", backlog_days: 17, inspector_note: "Recurring pothole cluster near bus bays.", score_breakdown: { complaint_volume: 24, complaint_recency: 16, maintenance_gap: 20, maintenance_effectiveness: 10, road_importance: 8 }, complaints: [{ complaint_id: "CP-1021", type: "Pothole", date: "2026-04-09", status: "Open" }, { complaint_id: "CP-1007", type: "Water logging", date: "2026-04-03", status: "Open" }], maintenance_history: [{ maintenance_id: "MX-402", repair_type: "Cold mix patching", date: "2025-11-18", contractor: "Metro Works", cost_inr: 168000 }], reason_narrative: "High complaint recurrence on a state highway stretch with long maintenance gaps keeps this corridor in the critical queue.", recommendation: "Schedule patch repair this week and inspect drainage on the curb lane." },
  { segment_id: "RD-007", road_name: "Station Road", road_class: "District Road", subdivision: "Central Zone", priority_tier: "RED", priority_score: 72, open_complaints: 5, last_maintained: "2024-03-05", backlog_days: 14, inspector_note: "Surface distress concentrated near market loading area.", score_breakdown: { complaint_volume: 21, complaint_recency: 14, maintenance_gap: 18, maintenance_effectiveness: 11, road_importance: 8 }, complaints: [{ complaint_id: "CP-1110", type: "Rut formation", date: "2026-04-11", status: "Open" }], maintenance_history: [{ maintenance_id: "MX-344", repair_type: "Overlay patch", date: "2025-09-08", contractor: "Civic Infra", cost_inr: 126000 }], reason_narrative: "Heavy mixed traffic and repeated complaint spikes suggest the last repair did not hold through the monsoon season.", recommendation: "Inspect failed patches and consider full-depth repair for the loading zone." },
  { segment_id: "RD-012", road_name: "Ring Road South", road_class: "National Highway", subdivision: "South Zone", priority_tier: "RED", priority_score: 85, open_complaints: 9, last_maintained: "2024-01-20", backlog_days: 23, inspector_note: "Highest complaint density in current batch.", score_breakdown: { complaint_volume: 28, complaint_recency: 18, maintenance_gap: 21, maintenance_effectiveness: 10, road_importance: 8 }, complaints: [{ complaint_id: "CP-1188", type: "Shoulder edge break", date: "2026-04-12", status: "Open" }], maintenance_history: [{ maintenance_id: "MX-301", repair_type: "Shoulder restoration", date: "2025-07-22", contractor: "Express Highway Care", cost_inr: 244000 }], reason_narrative: "This major corridor combines strategic importance with the most active complaints, making it the top deployment candidate.", recommendation: "Escalate to emergency crew and assign lane-safe repair window." },
  { segment_id: "RD-003", road_name: "Gandhi Nagar Link", road_class: "District Road", subdivision: "East Zone", priority_tier: "RED", priority_score: 70, open_complaints: 4, last_maintained: "2024-02-28", backlog_days: 12, inspector_note: "Connector route affecting school access.", score_breakdown: { complaint_volume: 18, complaint_recency: 15, maintenance_gap: 19, maintenance_effectiveness: 10, road_importance: 8 }, complaints: [], maintenance_history: [], reason_narrative: "Complaint recency is driving urgency on a connector that affects daily access patterns.", recommendation: "Prioritize morning site survey before school commute peak." },
  { segment_id: "RD-019", road_name: "Nehru Nagar Road", road_class: "District Road", subdivision: "North Zone", priority_tier: "YELLOW", priority_score: 58, open_complaints: 3, last_maintained: "2024-08-14", backlog_days: 9, inspector_note: "Condition stable but trending upward.", score_breakdown: { complaint_volume: 15, complaint_recency: 12, maintenance_gap: 16, maintenance_effectiveness: 8, road_importance: 7 }, complaints: [], maintenance_history: [], reason_narrative: "Not yet critical, but the complaint pattern suggests this segment could move into the red tier without preventive work.", recommendation: "Bundle with nearby patching crew route in the next cycle." },
  { segment_id: "RD-023", road_name: "Market Street", road_class: "District Road", subdivision: "Central Zone", priority_tier: "YELLOW", priority_score: 51, open_complaints: 2, last_maintained: "2024-07-01", backlog_days: 7, inspector_note: "Localized distress around shopfront parking.", score_breakdown: { complaint_volume: 13, complaint_recency: 10, maintenance_gap: 14, maintenance_effectiveness: 7, road_importance: 7 }, complaints: [], maintenance_history: [], reason_narrative: "Moderate issue concentration with lower severity than the critical queue.", recommendation: "Plan spot repairs with off-peak traffic control." },
  { segment_id: "RD-028", road_name: "Hospital Road", road_class: "State Highway", subdivision: "South Zone", priority_tier: "YELLOW", priority_score: 63, open_complaints: 4, last_maintained: "2024-09-10", backlog_days: 11, inspector_note: "Access route sensitivity raises priority.", score_breakdown: { complaint_volume: 16, complaint_recency: 14, maintenance_gap: 18, maintenance_effectiveness: 8, road_importance: 7 }, complaints: [], maintenance_history: [], reason_narrative: "Hospital access increases operational importance despite a mid-range score.", recommendation: "Move into the next 14-day preventive maintenance window." },
  { segment_id: "RD-031", road_name: "Village Link 4", road_class: "Panchayat Road", subdivision: "West Zone", priority_tier: "GREEN", priority_score: 22, open_complaints: 0, last_maintained: "2024-11-03", backlog_days: 0, inspector_note: "No active field escalations.", score_breakdown: { complaint_volume: 4, complaint_recency: 2, maintenance_gap: 8, maintenance_effectiveness: 4, road_importance: 4 }, complaints: [], maintenance_history: [], reason_narrative: "Low complaint activity and relatively recent maintenance keep this segment in the monitor-only pool.", recommendation: "No action required beyond routine inspection." },
  { segment_id: "RD-044", road_name: "Forest Bypass", road_class: "State Highway", subdivision: "East Zone", priority_tier: "GREEN", priority_score: 34, open_complaints: 1, last_maintained: "2024-10-15", backlog_days: 3, inspector_note: "Single complaint with low severity.", score_breakdown: { complaint_volume: 6, complaint_recency: 4, maintenance_gap: 10, maintenance_effectiveness: 7, road_importance: 7 }, complaints: [], maintenance_history: [], reason_narrative: "Minor issue activity but still comfortably outside the active intervention band.", recommendation: "Review during scheduled corridor patrol." },
  { segment_id: "RD-050", road_name: "Industrial Area Rd", road_class: "District Road", subdivision: "South Zone", priority_tier: "GREEN", priority_score: 18, open_complaints: 0, last_maintained: "2025-01-07", backlog_days: 0, inspector_note: "Recently maintained and stable.", score_breakdown: { complaint_volume: 2, complaint_recency: 1, maintenance_gap: 6, maintenance_effectiveness: 3, road_importance: 6 }, complaints: [], maintenance_history: [], reason_narrative: "Recent maintenance and no open complaints make this a low-touch segment for now.", recommendation: "Keep in quarterly monitoring list." },
];

const USE_MOCK = false;

const shellButtonStyle = {
  fontFamily: "'Geist', sans-serif",
  fontSize: "12px",
  fontWeight: 500,
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#C7D0D9",
  padding: "10px 14px",
  borderRadius: "12px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  transition: "transform 0.16s ease, border-color 0.16s ease, color 0.16s ease, background 0.16s ease",
};

function formatRelativeDate(value) {
  if (!value) return "No maintenance log";
  const diff = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 86400000));
  if (diff === 0) return "maintained today";
  if (diff === 1) return "maintained 1 day ago";
  return `maintained ${diff} days ago`;
}

function AnalyticsStrip({ segments, selectedSegment, onSelect }) {
  const criticalQueue = segments.filter((segment) => segment.priority_tier === "RED");
  const highestComplaints = [...segments].sort((a, b) => b.open_complaints - a.open_complaints)[0];
  const oldestMaintenance = [...segments]
    .filter((segment) => segment.last_maintained)
    .sort((a, b) => new Date(a.last_maintained) - new Date(b.last_maintained))[0];

  const cards = [
    {
      title: "Top risk corridor",
      value: criticalQueue[0]?.road_name ?? "No red tier segment",
      meta: criticalQueue[0] ? `${criticalQueue[0].priority_score}/100 priority score` : "No urgent intervention needed",
      action: criticalQueue[0]?.segment_id,
      accent: "#F07070",
    },
    {
      title: "Complaint hotspot",
      value: highestComplaints?.road_name ?? "No active complaints",
      meta: highestComplaints ? `${highestComplaints.open_complaints} open complaints` : "Steady network",
      action: highestComplaints?.segment_id,
      accent: "#F0C060",
    },
    {
      title: "Longest maintenance gap",
      value: oldestMaintenance?.road_name ?? "No history available",
      meta: oldestMaintenance ? formatRelativeDate(oldestMaintenance.last_maintained) : "Awaiting records",
      action: oldestMaintenance?.segment_id,
      accent: "#52C7C5",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "18px" }}>
      {cards.map((card) => {
        const active = selectedSegment?.segment_id === card.action;
        return (
          <button
            key={card.title}
            type="button"
            onClick={() => card.action && onSelect(card.action)}
            style={{
              textAlign: "left",
              padding: "18px",
              borderRadius: "18px",
              border: active ? `1px solid ${card.accent}` : "1px solid rgba(255,255,255,0.08)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))",
              color: "#EEF2F5",
              cursor: card.action ? "pointer" : "default",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.18)",
            }}
          >
            <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#7F8B96", marginBottom: "10px" }}>{card.title}</div>
            <div style={{ fontSize: "20px", fontWeight: 600, marginBottom: "6px" }}>{card.value}</div>
            <div style={{ fontSize: "12px", color: card.accent }}>{card.meta}</div>
          </button>
        );
      })}
    </div>
  );
}

export default function Dashboard({ onUploadMore }) {
  const [kpi, setKpi] = useState(null);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState("All");
  const [sort, setSort] = useState("score");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [subdivision, setSubdivision] = useState("All");
  const [roadClass, setRoadClass] = useState("All");
  const [highRiskOnly, setHighRiskOnly] = useState(false);

  useEffect(() => {
    if (USE_MOCK) {
      setKpi(MOCK_KPI);
      setSegments(MOCK_SEGMENTS);
      setSelectedId(MOCK_SEGMENTS[0]?.segment_id ?? null);
      setLoading(false);
      return;
    }

    Promise.all([axios.get("/api/kpi"), axios.get("/api/segments")])
      .then(([k, s]) => {
        setKpi(k.data);
        setSegments(s.data);
        setSelectedId(s.data[0]?.segment_id ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (USE_MOCK || loading) return;

    const params = {};
    if (tier !== "All") params.tier = tier;
    if (search) params.search = search;
    if (sort) params.sort = sort;
    if (subdivision !== "All") params.subdivision = subdivision;
    if (roadClass !== "All") params.road_class = roadClass;
    if (highRiskOnly) params.min_score = 70;

    axios.get("/api/segments", { params }).then((response) => setSegments(response.data));
  }, [tier, sort, search, subdivision, roadClass, highRiskOnly, loading]);

  const filterOptions = useMemo(() => ({
    subdivisions: ["All", ...new Set(segments.map((segment) => segment.subdivision).filter(Boolean))],
    roadClasses: ["All", ...new Set(segments.map((segment) => segment.road_class).filter(Boolean))],
  }), [segments]);

  const displaySegments = useMemo(() => {
    let nextSegments = [...segments];

    if (tier !== "All") nextSegments = nextSegments.filter((segment) => segment.priority_tier === tier);
    if (subdivision !== "All") nextSegments = nextSegments.filter((segment) => segment.subdivision === subdivision);
    if (roadClass !== "All") nextSegments = nextSegments.filter((segment) => segment.road_class === roadClass);
    if (highRiskOnly) nextSegments = nextSegments.filter((segment) => segment.priority_score >= 70 || segment.open_complaints >= 4);

    if (search) {
      const query = search.toLowerCase();
      nextSegments = nextSegments.filter((segment) =>
        [segment.road_name, segment.segment_id, segment.subdivision, segment.road_class]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(query)),
      );
    }

    if (sort === "score") nextSegments.sort((a, b) => b.priority_score - a.priority_score);
    if (sort === "complaints") nextSegments.sort((a, b) => b.open_complaints - a.open_complaints);
    if (sort === "last_maintained") nextSegments.sort((a, b) => new Date(a.last_maintained) - new Date(b.last_maintained));
    if (sort === "name") nextSegments.sort((a, b) => a.road_name.localeCompare(b.road_name));

    return nextSegments;
  }, [segments, tier, subdivision, roadClass, highRiskOnly, search, sort]);

  const selectedSegment = useMemo(
    () => displaySegments.find((segment) => segment.segment_id === selectedId) || segments.find((segment) => segment.segment_id === selectedId) || null,
    [displaySegments, segments, selectedId],
  );

  const actionSummary = useMemo(() => {
    const redCount = displaySegments.filter((segment) => segment.priority_tier === "RED").length;
    const complaintCount = displaySegments.reduce((total, segment) => total + (segment.open_complaints || 0), 0);
    const monitoredCount = displaySegments.filter((segment) => segment.priority_tier === "GREEN").length;
    return [
      { label: "Immediate dispatch", value: redCount, hint: "Critical segments in current view" },
      { label: "Open complaints", value: complaintCount, hint: "Total issues across filtered roads" },
      { label: "Monitor only", value: monitoredCount, hint: "Segments safe to defer" },
    ];
  }, [displaySegments]);

  const handleExport = () => {
    if (USE_MOCK) {
      alert("CSV export will be available after backend APIs are connected.");
      return;
    }

    const params = new URLSearchParams();
    if (tier !== "All") params.append("tier", tier);
    if (search) params.append("search", search);
    if (subdivision !== "All") params.append("subdivision", subdivision);
    if (roadClass !== "All") params.append("road_class", roadClass);
    if (highRiskOnly) params.append("min_score", "70");
    window.open(`/api/export/csv?${params.toString()}`);
  };

  const clearFilters = () => {
    setTier("All");
    setSort("score");
    setSearch("");
    setSubdivision("All");
    setRoadClass("All");
    setHighRiskOnly(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "28px",
        background: "radial-gradient(circle at top left, rgba(82, 199, 197, 0.12), transparent 28%), radial-gradient(circle at top right, rgba(240, 112, 112, 0.10), transparent 24%), #161C24",
      }}
    >
      <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.8fr) minmax(280px, 0.8fr)", gap: "18px", marginBottom: "18px" }}>
          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "24px", background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))", boxShadow: "0 22px 60px rgba(0, 0, 0, 0.26)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
              <div>
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "2px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(82,199,197,0.1)", border: "0.5px solid rgba(82,199,197,0.2)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                        <rect x="1" y="1" width="20" height="20" rx="5" stroke="#52C7C5" strokeWidth="1.2" fill="none" />
                        <path d="M5 14h12M5 11h8M5 8h12" stroke="#52C7C5" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <h1 style={{
                      margin: 0,
                      fontSize: "42px",
                      fontWeight: 700,
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                      background: "linear-gradient(135deg, #F6F8FA 30%, #52C7C5 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}>
                      Civora
                    </h1>
                  </div>
                  <div style={{ paddingLeft: "50px" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#52C7C540", marginBottom: "0px" }}>
                      Road Maintenance Triage Dashboard
                    </div>
                  </div>
                </div>
                <div style={{ maxWidth: "760px", fontSize: "14px", lineHeight: 1.7, color: "#A8B3BD" }}>
                  Rank damaged corridors, identify complaint hotspots, and move crews faster with a single operations view.
                  {USE_MOCK ? " Running in mock mode while backend APIs are still being wired in." : ` ${segments.length} segments are currently available from live data.`}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={handleExport}
                  style={shellButtonStyle}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.borderColor = "rgba(82, 199, 197, 0.5)";
                    event.currentTarget.style.color = "#F6F8FA";
                    event.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    event.currentTarget.style.color = "#C7D0D9";
                    event.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 5l3 3 3-3M2 9h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Export view
                </button>
                <button
                  onClick={onUploadMore}
                  style={{ ...shellButtonStyle, background: "linear-gradient(135deg, #52C7C5, #3EA9B5)", color: "#0E1A20", borderColor: "transparent" }}
                  onMouseEnter={(event) => { event.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(event) => { event.currentTarget.style.transform = "translateY(0)"; }}
                >
                  Re-upload data
                </button>
              </div>
            </div>
          </div>

          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "22px", background: "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))", boxShadow: "0 22px 60px rgba(0, 0, 0, 0.26)" }}>
            <div style={{ fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#7F8B96", marginBottom: "12px" }}>Action board</div>
            <div style={{ display: "grid", gap: "10px" }}>
              {actionSummary.map((item) => (
                <div key={item.label} style={{ padding: "14px 16px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px" }}>
                    <div style={{ fontSize: "13px", color: "#DDE5EA" }}>{item.label}</div>
                    <div style={{ fontSize: "28px", fontWeight: 700, color: "#F6F8FA" }}>{item.value}</div>
                  </div>
                  <div style={{ fontSize: "11px", color: "#7F8B96", marginTop: "4px" }}>{item.hint}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "96px 0" }}>
            <div style={{ width: "22px", height: "22px", border: "1.5px solid rgba(255,255,255,0.15)", borderTop: "1.5px solid #52C7C5", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          </div>
        ) : (
          <>
            {kpi && <KPIBar kpi={kpi} segments={displaySegments} />}
            <AnalyticsStrip segments={displaySegments} selectedSegment={selectedSegment} onSelect={setSelectedId} />
            <FilterBar
              tier={tier}
              setTier={setTier}
              sort={sort}
              setSort={setSort}
              search={search}
              setSearch={setSearch}
              subdivision={subdivision}
              setSubdivision={setSubdivision}
              roadClass={roadClass}
              setRoadClass={setRoadClass}
              options={filterOptions}
              highRiskOnly={highRiskOnly}
              setHighRiskOnly={setHighRiskOnly}
              resultCount={displaySegments.length}
              onClear={clearFilters}
            />
            <TriageTable segments={displaySegments} onSelect={setSelectedId} selectedId={selectedId} />
          </>
        )}

        <SegmentDetail segmentId={selectedId} segment={selectedSegment} onClose={() => setSelectedId(null)} useMock={USE_MOCK} />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}