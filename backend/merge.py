import pandas as pd
from models import get_connection


def load_all_data():
    """Load all three tables from SQLite into DataFrames."""
    conn = get_connection()
    inventory = pd.read_sql("SELECT * FROM road_inventory", conn)
    complaints = pd.read_sql("SELECT * FROM complaints", conn)
    maintenance = pd.read_sql("SELECT * FROM maintenance_logs", conn)
    conn.close()
    return inventory, complaints, maintenance


def merge_datasets():
    """
    Merge all three datasets on segment_id.
    Returns:
        merged_df       — inventory with aggregated complaint + maintenance columns
        unmatched_count — complaints with no matching road segment
    """
    inventory, complaints, maintenance = load_all_data()

    # Normalize dates
    complaints["complaint_date"] = pd.to_datetime(complaints["complaint_date"], errors="coerce")
    maintenance["repair_date"] = pd.to_datetime(maintenance["repair_date"], errors="coerce")

    # Track unmatched complaints
    if len(complaints) > 0:
        unmatched = complaints[~complaints["segment_id"].isin(inventory["segment_id"])]
        unmatched_count = len(unmatched)
    else:
        unmatched_count = 0

    # Keep complaints and maintenance as raw frames for scoring
    return inventory, complaints, maintenance, unmatched_count
