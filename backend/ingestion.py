import pandas as pd
import io
from models import get_connection, clear_table

REQUIRED_COLUMNS = {
    "inventory": ["segment_id", "road_name", "road_class", "length_km", "subdivision", "importance_weight"],
    "complaints": ["complaint_id", "segment_id", "road_name", "complaint_type", "complaint_date", "status", "description"],
    "maintenance": ["maintenance_id", "segment_id", "road_name", "repair_type", "repair_date", "contractor", "status", "cost_inr"],
}

TABLE_MAP = {
    "inventory": "road_inventory",
    "complaints": "complaints",
    "maintenance": "maintenance_logs",
}


def _normalize_columns(df):
    """Strip whitespace from column names."""
    df.columns = [c.strip().lower() for c in df.columns]
    return df


def validate_csv(df, file_type):
    required = REQUIRED_COLUMNS[file_type]
    missing = [col for col in required if col not in df.columns]
    if missing:
        raise ValueError(f"Missing columns: {', '.join(missing)}")


def ingest_csv(file_bytes, file_type):
    """Parse, validate, and insert CSV data. Returns row count."""
    if file_type not in REQUIRED_COLUMNS:
        raise ValueError(f"Unknown file type '{file_type}'. Must be one of: inventory, complaints, maintenance")

    df = pd.read_csv(io.BytesIO(file_bytes))
    df = _normalize_columns(df)
    validate_csv(df, file_type)

    # Coerce types
    if file_type == "inventory":
        df["length_km"] = pd.to_numeric(df["length_km"], errors="coerce")
    elif file_type == "maintenance":
        df["cost_inr"] = pd.to_numeric(df["cost_inr"], errors="coerce").fillna(0)

    table = TABLE_MAP[file_type]
    clear_table(table)

    conn = get_connection()
    df.to_sql(table, conn, if_exists="append", index=False)
    conn.close()

    return len(df)
