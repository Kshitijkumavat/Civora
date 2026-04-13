from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import io

from models import init_db, get_connection
from ingestion import ingest_csv
from scoring import run_scoring
from export import export_segments_csv

app = Flask(__name__)
CORS(app)

# Initialize DB on startup
init_db()


# ──────────────────────────────────────────────
# POST /api/upload
# ──────────────────────────────────────────────
@app.route("/api/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file provided"}), 400

    file = request.files["file"]
    file_type = request.form.get("type", "").strip().lower()

    if not file_type:
        return jsonify({"success": False, "error": "Missing 'type' field (inventory/complaints/maintenance)"}), 400

    try:
        file_bytes = file.read()
        rows = ingest_csv(file_bytes, file_type)
        messages = {
            "inventory": "Road inventory uploaded successfully",
            "complaints": "Complaints uploaded successfully",
            "maintenance": "Maintenance logs uploaded successfully",
        }
        return jsonify({
            "success": True,
            "rows_loaded": rows,
            "message": messages.get(file_type, "File uploaded successfully")
        })
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Upload failed: {str(e)}"}), 500


# ──────────────────────────────────────────────
# POST /api/process
# ──────────────────────────────────────────────
@app.route("/api/process", methods=["POST"])
def process():
    try:
        segments_scored, unmatched = run_scoring()
        return jsonify({
            "success": True,
            "segments_scored": segments_scored,
            "unmatched_complaints": unmatched
        })
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Processing failed: {str(e)}"}), 500


# ──────────────────────────────────────────────
# GET /api/segments
# ──────────────────────────────────────────────
@app.route("/api/segments", methods=["GET"])
def get_segments():
    tier = request.args.get("tier", "").strip().upper() or None
    search = request.args.get("search", "").strip() or None
    sort = request.args.get("sort", "score").strip().lower()

    sort_map = {
        "score": "priority_score DESC",
        "complaints": "open_complaints DESC",
        "last_maintained": "last_maintained ASC",
    }
    order_by = sort_map.get(sort, "priority_score DESC")

    conn = get_connection()
    query = "SELECT * FROM scored_segments WHERE 1=1"
    params = []

    if tier:
        query += " AND priority_tier = ?"
        params.append(tier)
    if search:
        query += " AND (road_name LIKE ? OR segment_id LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])

    query += f" ORDER BY {order_by}"
    rows = conn.execute(query, params).fetchall()
    conn.close()

    result = []
    for r in rows:
        result.append({
            "segment_id": r["segment_id"],
            "road_name": r["road_name"],
            "road_class": r["road_class"],
            "subdivision": r["subdivision"],
            "priority_tier": r["priority_tier"],
            "priority_score": r["priority_score"],
            "top_reason": r["top_reason"],
            "last_maintained": r["last_maintained"],
            "open_complaints": r["open_complaints"],
        })

    return jsonify(result)


# ──────────────────────────────────────────────
# GET /api/segments/<segment_id>
# ──────────────────────────────────────────────
@app.route("/api/segments/<segment_id>", methods=["GET"])
def get_segment_detail(segment_id):
    conn = get_connection()

    seg = conn.execute(
        "SELECT * FROM scored_segments WHERE segment_id = ?", (segment_id,)
    ).fetchone()

    if not seg:
        conn.close()
        return jsonify({"error": "Segment not found"}), 404

    complaints = conn.execute(
        "SELECT complaint_id, complaint_type, complaint_date, status FROM complaints WHERE segment_id = ? ORDER BY complaint_date DESC",
        (segment_id,)
    ).fetchall()

    maintenance = conn.execute(
        "SELECT maintenance_id, repair_type, repair_date, contractor, cost_inr FROM maintenance_logs WHERE segment_id = ? ORDER BY repair_date DESC",
        (segment_id,)
    ).fetchall()

    conn.close()

    return jsonify({
        "segment_id": seg["segment_id"],
        "road_name": seg["road_name"],
        "road_class": seg["road_class"],
        "subdivision": seg["subdivision"],
        "priority_tier": seg["priority_tier"],
        "priority_score": seg["priority_score"],
        "score_breakdown": {
            "complaint_volume": seg["score_complaint_volume"],
            "complaint_recency": seg["score_complaint_recency"],
            "maintenance_gap": seg["score_maintenance_gap"],
            "maintenance_effectiveness": seg["score_maintenance_effectiveness"],
            "road_importance": seg["score_road_importance"],
        },
        "reason_narrative": seg["reason_narrative"],
        "last_maintained": seg["last_maintained"],
        "open_complaints": seg["open_complaints"],
        "complaints": [
            {
                "complaint_id": c["complaint_id"],
                "type": c["complaint_type"],
                "date": c["complaint_date"],
                "status": c["status"],
            }
            for c in complaints
        ],
        "maintenance_history": [
            {
                "maintenance_id": m["maintenance_id"],
                "repair_type": m["repair_type"],
                "date": m["repair_date"],
                "contractor": m["contractor"],
                "cost_inr": m["cost_inr"],
            }
            for m in maintenance
        ],
    })


# ──────────────────────────────────────────────
# GET /api/kpi
# ──────────────────────────────────────────────
@app.route("/api/kpi", methods=["GET"])
def get_kpi():
    conn = get_connection()
    rows = conn.execute(
        "SELECT priority_tier, COUNT(*) as cnt, MAX(last_updated) as last_updated FROM scored_segments GROUP BY priority_tier"
    ).fetchall()
    conn.close()

    counts = {"RED": 0, "YELLOW": 0, "GREEN": 0}
    last_updated = None

    for r in rows:
        counts[r["priority_tier"]] = r["cnt"]
        if r["last_updated"]:
            last_updated = r["last_updated"]

    return jsonify({
        "RED": counts["RED"],
        "YELLOW": counts["YELLOW"],
        "GREEN": counts["GREEN"],
        "last_updated": last_updated,
    })


# ──────────────────────────────────────────────
# GET /api/export/csv
# ──────────────────────────────────────────────
@app.route("/api/export/csv", methods=["GET"])
def export_csv():
    tier = request.args.get("tier", "").strip().upper() or None
    search = request.args.get("search", "").strip() or None

    csv_bytes = export_segments_csv(tier=tier, search=search)

    return send_file(
        io.BytesIO(csv_bytes),
        mimetype="text/csv",
        as_attachment=True,
        download_name="road_triage_export.csv"
    )


if __name__ == "__main__":
    app.run(debug=True, port=5000)
