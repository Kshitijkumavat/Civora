import pandas as pd
from datetime import datetime, timedelta
from models import get_connection, clear_table
from merge import merge_datasets


NOW = datetime.now()


def score_complaint_volume(segment_id, complaints_df):
    cutoff = NOW - timedelta(days=90)
    recent_open = complaints_df[
        (complaints_df["segment_id"] == segment_id) &
        (complaints_df["complaint_date"] >= cutoff) &
        (complaints_df["status"].str.strip().str.lower() == "open")
    ]
    count = len(recent_open)
    if count == 0:
        return 0, count
    elif count <= 2:
        return 10, count
    elif count <= 5:
        return 20, count
    else:
        return 30, count


def score_complaint_recency(segment_id, complaints_df):
    seg_complaints = complaints_df[complaints_df["segment_id"] == segment_id]
    if seg_complaints.empty:
        return 0, None

    latest = seg_complaints["complaint_date"].max()
    if pd.isna(latest):
        return 0, None

    days_ago = (NOW - latest).days
    if days_ago <= 30:
        return 20, days_ago
    elif days_ago <= 180:
        return 12, days_ago
    else:
        return 5, days_ago


def score_maintenance_gap(segment_id, maintenance_df):
    seg_maint = maintenance_df[maintenance_df["segment_id"] == segment_id]
    if seg_maint.empty:
        return 25, None

    latest = seg_maint["repair_date"].max()
    if pd.isna(latest):
        return 25, None

    days_ago = (NOW - latest).days
    if days_ago <= 30:
        return 0, latest
    elif days_ago <= 90:
        return 8, latest
    elif days_ago <= 365:
        return 16, latest
    else:
        return 25, latest


def score_maintenance_effectiveness(segment_id, complaints_df, maintenance_df):
    seg_maint = maintenance_df[maintenance_df["segment_id"] == segment_id]
    if seg_maint.empty:
        return 0

    latest_repair = seg_maint["repair_date"].max()
    if pd.isna(latest_repair):
        return 0

    window_end = latest_repair + timedelta(days=30)
    post_repair = complaints_df[
        (complaints_df["segment_id"] == segment_id) &
        (complaints_df["complaint_date"] >= latest_repair) &
        (complaints_df["complaint_date"] <= window_end)
    ]
    count = len(post_repair)
    if count == 0:
        return 0
    elif count == 1:
        return 5
    elif count <= 3:
        return 10
    else:
        return 15


# ── FIXED: match against road_class values from the CSV ──
def score_road_importance(road_class):
    if pd.isna(road_class):
        return 5
    key = str(road_class).strip().lower()
    if "national highway" in key:
        return 10
    elif "state highway" in key:
        return 8
    elif "district road" in key:
        return 5
    elif "village" in key or "panchayat" in key:
        return 2
    else:
        return 5


def assign_tier(score):
    if score >= 70:
        return "RED"
    elif score >= 40:
        return "YELLOW"
    else:
        return "GREEN"


def build_narrative(tier, open_complaints, last_complaint_days, last_repair_date,
                    post_repair_complaints, road_class, score):
    parts = [f"{tier} (score {score}) —"]

    if open_complaints > 0:
        parts.append(f"{open_complaints} open complaint(s) in last 90 days.")
    else:
        parts.append("No recent open complaints.")

    if last_complaint_days is not None:
        parts.append(f"Most recent complaint was {last_complaint_days} day(s) ago.")

    if last_repair_date is not None:
        repair_str = last_repair_date.strftime("%Y-%m-%d")
        months_ago = round((NOW - last_repair_date).days / 30)
        parts.append(f"Last repaired {months_ago} month(s) ago ({repair_str}).")
    else:
        parts.append("No repair on record.")

    if post_repair_complaints > 0:
        parts.append(f"{post_repair_complaints} complaint(s) filed within 30 days of last repair.")

    if road_class:
        parts.append(f"{road_class} — importance factor applied.")

    return " ".join(parts)


def run_scoring():
    inventory, complaints, maintenance, unmatched_count = merge_datasets()

    if inventory.empty:
        raise ValueError("Road inventory is empty. Please upload data first.")

    results = []

    for _, road in inventory.iterrows():
        sid = road["segment_id"]
        road_class = road.get("road_class")

        vol_score, open_count = score_complaint_volume(sid, complaints)
        rec_score, last_complaint_days = score_complaint_recency(sid, complaints)
        gap_score, last_repair_date = score_maintenance_gap(sid, maintenance)
        eff_score = score_maintenance_effectiveness(sid, complaints, maintenance)
        imp_score = score_road_importance(road_class)  # FIXED: pass road_class

        total = vol_score + rec_score + gap_score + eff_score + imp_score
        tier = assign_tier(total)

        post_repair_count = eff_score // 5 if eff_score > 0 else 0

        narrative = build_narrative(
            tier, open_count, last_complaint_days,
            last_repair_date, post_repair_count,
            road_class, total
        )

        last_maintained = last_repair_date.strftime("%Y-%m-%d") if last_repair_date and not pd.isna(last_repair_date) else None

        results.append({
            "segment_id": sid,
            "road_name": road.get("road_name"),
            "road_class": road_class,
            "subdivision": road.get("subdivision"),
            "priority_tier": tier,
            "priority_score": total,
            "top_reason": narrative[:200],
            "reason_narrative": narrative,
            "last_maintained": last_maintained,
            "open_complaints": open_count,
            "score_complaint_volume": vol_score,
            "score_complaint_recency": rec_score,
            "score_maintenance_gap": gap_score,
            "score_maintenance_effectiveness": eff_score,
            "score_road_importance": imp_score,
            "last_updated": NOW.isoformat(),
        })

    clear_table("scored_segments")
    conn = get_connection()
    for row in results:
        conn.execute("""
            INSERT OR REPLACE INTO scored_segments VALUES (
                :segment_id, :road_name, :road_class, :subdivision,
                :priority_tier, :priority_score, :top_reason, :reason_narrative,
                :last_maintained, :open_complaints,
                :score_complaint_volume, :score_complaint_recency,
                :score_maintenance_gap, :score_maintenance_effectiveness,
                :score_road_importance, :last_updated
            )
        """, row)
    conn.commit()
    conn.close()

    return len(results), unmatched_count