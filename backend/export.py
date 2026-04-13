import csv
import io
from models import get_connection


def export_segments_csv(tier=None, search=None):
    """Return CSV bytes for filtered segments."""
    conn = get_connection()
    query = "SELECT * FROM scored_segments WHERE 1=1"
    params = []

    if tier:
        query += " AND priority_tier = ?"
        params.append(tier.upper())
    if search:
        query += " AND (road_name LIKE ? OR segment_id LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])

    query += " ORDER BY priority_score DESC"
    rows = conn.execute(query, params).fetchall()
    conn.close()

    output = io.StringIO()
    if rows:
        writer = csv.DictWriter(output, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows([dict(r) for r in rows])

    return output.getvalue().encode("utf-8")
