from firebase_admin import firestore
from datetime import datetime, timezone, timedelta

_db = None

COST_BASIS = "predicted"
TIER_MARGIN = 500.0
AGE_BANDS = [("<30", 0, 30), ("30-44", 30, 45), ("45-59", 45, 60), ("60+", 60, 999)]


def _get_db():
    global _db
    if _db is None:
        _db = firestore.client(database_id="statistics")
    return _db


def _compute_tiers(costs: list[float]) -> dict:
    avg = sum(costs) / len(costs) if costs else 0.0
    return {
        "low_max": round(avg - TIER_MARGIN, 2),
        "high_min": round(avg + TIER_MARGIN, 2),
    }


def _tier_of(cost: float, tiers: dict) -> str:
    if cost <= tiers["low_max"]:
        return "low"
    if cost >= tiers["high_min"]:
        return "high"
    return "med"


def _population_stats(all_data: list[dict]) -> dict:
    records = []
    for row in all_data:
        cost_raw = row.get('cost')
        if cost_raw is None:
            continue
        try:
            cost = float(cost_raw)
        except (TypeError, ValueError):
            continue
        age = None
        age_raw = row.get('age')
        if age_raw is not None:
            try:
                age = int(float(age_raw))
            except (TypeError, ValueError):
                age = None
        records.append((cost, age))

    costs = [cost for cost, _ in records]
    tiers = _compute_tiers(costs)

    tier_counts = {"low": 0, "med": 0, "high": 0}
    age_bands = {label: {"count": 0, "sum": 0.0} for label, _, _ in AGE_BANDS}

    for cost, age in records:
        tier = _tier_of(cost, tiers)
        tier_counts[tier] += 1

        if age is not None:
            for label, lo, hi in AGE_BANDS:
                if lo <= age < hi:
                    age_bands[label]["count"] += 1
                    age_bands[label]["sum"] += cost
                    break

    n = len(costs)
    total_cost = sum(costs)
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

    return {
        "cost_tiers": tiers,
        "total_patients": n,
        "total_predicted_cost": round(total_cost, 2),
        "average_cost": round(total_cost / max(n, 1), 2),
        "tier_counts": tier_counts,
        "top_decile_cost_share": round(top_decile_cost / max(total_cost, 1e-9) * 100, 1),
        "cost_by_age": cost_by_age,
    }


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
    return min((ts.day - 1) // 7 + 1, 4)


def _temporal_stats(all_data: list[dict], tiers: dict) -> dict:
    now = datetime.now(timezone.utc)
    this_key = now.strftime("%Y-%m")
    prev = now.replace(day=1) - timedelta(days=1)
    last_key = prev.strftime("%Y-%m")

    by_month: dict[str, dict] = {}
    for d in all_data:
        mk = d.get("month_year")
        cost = d.get("cost")
        if not mk or cost is None:
            continue
        bucket = by_month.setdefault(mk, {"low": 0, "med": 0, "high": 0})
        bucket[_tier_of(float(cost), tiers)] += 1

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

    # Report throughput: how many predictions were logged in the current month.
    reports_this_month = sum(1 for d in all_data if d.get("month_year") == this_key)
    reports_last_month = sum(1 for d in all_data if d.get("month_year") == last_key)

    return {
        "mom_pct": mom_pct,
        "reports_this_month": reports_this_month,
        "reports_last_month": reports_last_month,
        "tier_by_month": tier_by_month,
        "weekly_this_month": weekly(this_key),
        "weekly_last_month": weekly(last_key),
    }


def get_dashboard_stats() -> dict:
    db = _get_db()
    docs = list(db.collection("predictions").stream())
    all_data = [d.to_dict() for d in docs]

    population = _population_stats(all_data)
    tiers = population["cost_tiers"]
    temporal = _temporal_stats(all_data, tiers)

    return {
        "cost_basis": COST_BASIS,
        "cost_tiers": tiers,
        # Population (per-patient) figures, predicted-cost basis.
        "total_patients": population["total_patients"],
        "total_predicted_cost": population["total_predicted_cost"],
        "average_cost": population["average_cost"],
        "tier_counts": population["tier_counts"],
        "top_decile_cost_share": population["top_decile_cost_share"],
        "cost_by_age": population["cost_by_age"],
        **temporal,
    }
