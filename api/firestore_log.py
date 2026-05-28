import csv
import os
from firebase_admin import firestore
from datetime import datetime, timezone

_db = None
_csv_stats_cache = None

_CSV_PATH = os.path.join(os.path.dirname(__file__), '..', 'csv', 'patient_features.csv')


def _get_db():
    global _db
    if _db is None:
        _db = firestore.client(database_id="statistics")
    return _db


def _get_csv_stats():
    global _csv_stats_cache
    if _csv_stats_cache is not None:
        return _csv_stats_cache

    with open(_CSV_PATH, newline='') as f:
        rows = list(csv.DictReader(f, delimiter=';'))

    costs = []
    smoker_count = 0
    age_groups: dict[str, int] = {"<30": 0, "30-44": 0, "45-59": 0, "60+": 0}
    for row in rows:
        cost_str = row.get('target_avg_annual_cost', '')
        if cost_str:
            costs.append(float(cost_str))
        is_smoker = row.get('is_smoker', '')
        if is_smoker:
            smoker_count += int(float(is_smoker))
        age_str = row.get('age', '')
        if age_str:
            age = int(float(age_str))
            if age < 30:
                age_groups["<30"] += 1
            elif age < 45:
                age_groups["30-44"] += 1
            elif age < 60:
                age_groups["45-59"] += 1
            else:
                age_groups["60+"] += 1

    n = len(costs)
    costs_sorted = sorted(costs)
    p75_idx = max(int(n * 0.75) - 1, 0)
    threshold = costs_sorted[p75_idx] if costs_sorted else 0.0
    high_risk = [c for c in costs if c >= threshold]

    _csv_stats_cache = {
        "average_cost": round(sum(costs) / max(n, 1), 2),
        "smoker_percentage": round(smoker_count / max(len(rows), 1) * 100, 1),
        "high_risk_threshold": round(threshold, 2),
        "high_risk_count": len(high_risk),
        "high_risk_percentage": round(len(high_risk) / max(n, 1) * 100, 1),
        "age_groups": age_groups,
    }
    return _csv_stats_cache


def log_prediction(cost: float, patient: dict):
    try:
        db = _get_db()
        now = datetime.now(timezone.utc)
        db.collection("predictions").add({
            "cost": cost,
            "age": patient.get("age"),
            "gender": patient.get("gender"),
            "is_smoker": patient.get("is_smoker"),
            "num_diseases": patient.get("num_diseases"),
            "timestamp": now,
            "month_year": now.strftime("%Y-%m"),
        })
    except Exception:
        pass


def get_dashboard_stats() -> dict:
    csv_stats = _get_csv_stats()

    db = _get_db()
    docs = list(db.collection("predictions").stream())

    current_month = datetime.now(timezone.utc).strftime("%Y-%m")
    all_data = [d.to_dict() for d in docs]
    this_month = [d for d in all_data if d.get("month_year") == current_month]
    this_month_costs = [d["cost"] for d in this_month if "cost" in d]

    n = len(all_data)
    nm = len(this_month)

    return {
        "total_reports": n,
        "reports_this_month": nm,
        "average_cost_this_month": round(sum(this_month_costs) / max(nm, 1), 2),
        "average_cost": csv_stats["average_cost"],
        "smoker_percentage": csv_stats["smoker_percentage"],
        "high_risk_threshold": csv_stats["high_risk_threshold"],
        "high_risk_count": csv_stats["high_risk_count"],
        "high_risk_percentage": csv_stats["high_risk_percentage"],
        "age_groups": csv_stats["age_groups"],
    }
