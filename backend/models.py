import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    c = conn.cursor()

    c.executescript("""
        CREATE TABLE IF NOT EXISTS road_inventory (
            segment_id      TEXT PRIMARY KEY,
            road_name       TEXT,
            road_class      TEXT,
            length_km       REAL,
            subdivision     TEXT,
            importance_weight TEXT
        );

        CREATE TABLE IF NOT EXISTS complaints (
            complaint_id    TEXT PRIMARY KEY,
            segment_id      TEXT,
            road_name       TEXT,
            complaint_type  TEXT,
            complaint_date  TEXT,
            status          TEXT,
            description     TEXT
        );

        CREATE TABLE IF NOT EXISTS maintenance_logs (
            maintenance_id  TEXT PRIMARY KEY,
            segment_id      TEXT,
            road_name       TEXT,
            repair_type     TEXT,
            repair_date     TEXT,
            contractor      TEXT,
            status          TEXT,
            cost_inr        REAL
        );

        CREATE TABLE IF NOT EXISTS scored_segments (
            segment_id                  TEXT PRIMARY KEY,
            road_name                   TEXT,
            road_class                  TEXT,
            subdivision                 TEXT,
            priority_tier               TEXT,
            priority_score              INTEGER,
            top_reason                  TEXT,
            reason_narrative            TEXT,
            last_maintained             TEXT,
            open_complaints             INTEGER,
            score_complaint_volume      INTEGER,
            score_complaint_recency     INTEGER,
            score_maintenance_gap       INTEGER,
            score_maintenance_effectiveness INTEGER,
            score_road_importance       INTEGER,
            last_updated                TEXT
        );
    """)

    conn.commit()
    conn.close()


def clear_table(table_name):
    allowed = {"road_inventory", "complaints", "maintenance_logs", "scored_segments"}
    if table_name not in allowed:
        raise ValueError(f"Invalid table name: {table_name}")
    conn = get_connection()
    conn.execute(f"DELETE FROM {table_name}")
    conn.commit()
    conn.close()
