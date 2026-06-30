import csv
import os
from firebase_admin import firestore
from datetime import datetime, timezone, timedelta

_db = None
_csv_stats_cache = None

_CSV_PATH = os.path.join(os.path.dirname(__file__), '..', 'csv', 'patient_features.csv')

# --- Dashboard configuration (finance team tunes these; not hardcoded in the view) ---
# Cost basis for every dollar figure shown on the dashboard.
COST_BASIS = "predicted"  # one of: "predicted" | "billed" | "reimbursed"

# Fixed dollar thresholds that define COST tiers (not risk tiers).
#   low    = cost < low_max
#   medium = low_max <= cost < high_min
#   high   = cost >= high_min
COST_TIERS = {
    "low_max": 500.0,
    "high_min": 2000.0,
}

# Age bands for the cost-by-age panel: (label, inclusive_lo, exclusive_hi).
AGE_BANDS = [("<30", 0, 30), ("30-44", 30, 45), ("45-59", 45, 60), ("60+", 60, 999)]


def _get_db():
    global _db
    if _db is None:
        _db = firestore.client(database_id="statistics")
    return _db


def _tier_of(cost: float) -> str:
    if cost < COST_TIERS["low_max"]:
        return "low"
    if cost >= COST_TIERS["high_min"]:
        return "high"
    return "med"


def _get_csv_stats():
    """Population-level metrics from the assessed-patient CSV.

    The CSV is the assessed *patient* population (one row per patient), with
    ``target_avg_annual_cost`` as the model's *predicted* annual cost. All
    population denominators and cost figures here are per-patient, never per
    prediction-report. Cached because the file does not change at runtime.
    """
    global _csv_stats_cache
    if _csv_stats_cache is not None:
        return _csv_stats_cache

    with open(_CSV_PATH, newline='') as f:
        rows = list(csv.DictReader(f, delimiter=';'))

    costs = []
    tier_counts = {"low": 0, "med": 0, "high": 0}
    high_cost_sum = 0.0
    age_bands = {label: {"count": 0, "sum": 0.0} for label, _, _ in AGE_BANDS}

    for row in rows:
        cost_str = row.get('target_avg_annual_cost', '')
        if not cost_str:
            continue
        cost = float(cost_str)
        costs.append(cost)

        tier = _tier_of(cost)
        tier_counts[tier] += 1
        if tier == "high":
            high_cost_sum += cost

        age_str = row.get('age', '')
        if age_str:
            age = int(float(age_str))
            for label, lo, hi in AGE_BANDS:
                if lo <= age < hi:
                    age_bands[label]["count"] += 1
                    age_bands[label]["sum"] += cost
                    break

    n = len(costs)
    total_cost = sum(costs)

    # Top-decile cost concentration: share of total cost held by the most
    # expensive 10% of patients.
    costs_sorted = sorted(costs)
    decile_idx = int(n * 0.9)
    top_decile_cost = sum(costs_sorted[decile_idx:])

    cost_by_age = [
        {
            "band": label,
            "avg_cost": round(age_bands[label]["sum"] / age_bands[label]["count"], 2)
            if age_bands[label]["count"] else 0.0,
        }
        for label, _, _ in AGE_BANDS
    ]

    _csv_stats_cache = {
        "total_patients": n,
        "total_predicted_cost": round(total_cost, 2),
        "average_cost": round(total_cost / max(n, 1), 2),
        "tier_counts": tier_counts,
        "high_cost": {
            "count": tier_counts["high"],
            # Share of *patients* in the top cost tier (denominator = patients).
            "pct_patients": round(tier_counts["high"] / max(n, 1) * 100, 1),
            # Share of total cost those patients represent (the point of the card).
            "pct_cost": round(high_cost_sum / max(total_cost, 1e-9) * 100, 1),
        },
        "top_decile_cost_share": round(top_decile_cost / max(total_cost, 1e-9) * 100, 1),
        "cost_by_age": cost_by_age,
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


def _week_of_month(ts: datetime) -> int:
    # Clamped to 4 so the W1-W4 area chart absorbs late-month (day 29-31) points.
    return min((ts.day - 1) // 7 + 1, 4)


def _temporal_stats(all_data: list[dict]) -> dict:
    """Time series derived from the logged prediction stream (Firestore).

    These are the only metrics with a real time dimension. Months/weeks with no
    logged predictions are omitted rather than fabricated.
    """
    now = datetime.now(timezone.utc)
    this_key = now.strftime("%Y-%m")
    prev = now.replace(day=1) - timedelta(days=1)
    last_key = prev.strftime("%Y-%m")

    # Patients-by-cost-tier per month (counts), most recent 6 months with data.
    by_month: dict[str, dict] = {}
    for d in all_data:
        mk = d.get("month_year")
        cost = d.get("cost")
        if not mk or cost is None:
            continue
        bucket = by_month.setdefault(mk, {"low": 0, "med": 0, "high": 0})
        bucket[_tier_of(float(cost))] += 1

    tier_by_month = []
    for mk in sorted(by_month)[-6:]:
        label = datetime.strptime(mk, "%Y-%m").strftime("%b")
        tier_by_month.append({"month": mk, "label": label, **by_month[mk]})

    # Weekly cost totals for this month vs last month.
    def weekly(month_key: str) -> list[dict]:
        weeks: dict[int, float] = {}
        for d in all_data:
            if d.get("month_year") != month_key:
                continue
            ts = d.get("timestamp")
            cost = d.get("cost")
            if ts is None or cost is None:
                continue
            if not isinstance(ts, datetime):
                continue
            w = _week_of_month(ts)
            weeks[w] = weeks.get(w, 0.0) + float(cost)
        return [{"week": w, "cost": round(weeks.get(w, 0.0), 2)} for w in range(1, 5)]

    this_total = sum(float(d["cost"]) for d in all_data
                     if d.get("month_year") == this_key and d.get("cost") is not None)
    last_total = sum(float(d["cost"]) for d in all_data
                     if d.get("month_year") == last_key and d.get("cost") is not None)
    mom_pct = round((this_total - last_total) / last_total * 100, 1) if last_total > 0 else None

    return {
        "mom_pct": mom_pct,
        "tier_by_month": tier_by_month,
        "weekly_this_month": weekly(this_key),
        "weekly_last_month": weekly(last_key),
    }


def get_dashboard_stats() -> dict:
    csv_stats = _get_csv_stats()

    db = _get_db()
    docs = list(db.collection("predictions").stream())
    all_data = [d.to_dict() for d in docs]

    temporal = _temporal_stats(all_data)

    return {
        "cost_basis": COST_BASIS,
        "cost_tiers": COST_TIERS,
        # Population (per-patient) figures, predicted-cost basis.
        "total_patients": csv_stats["total_patients"],
        "total_predicted_cost": csv_stats["total_predicted_cost"],
        "average_cost": csv_stats["average_cost"],
        "tier_counts": csv_stats["tier_counts"],
        "high_cost": csv_stats["high_cost"],
        "top_decile_cost_share": csv_stats["top_decile_cost_share"],
        "cost_by_age": csv_stats["cost_by_age"],
        # Prediction-report stream figures (the only temporal source).
        "total_reports": len(all_data),
        **temporal,
    }
