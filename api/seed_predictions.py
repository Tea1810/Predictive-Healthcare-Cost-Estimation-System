"""Seed the Firestore `predictions` stream with a year of synthetic reports.

The dashboard's temporal panels (tier-by-month, weekly this/last month) are the
only metrics driven by the logged prediction stream. With a fresh database those
panels look empty, so this script back-fills ~12 months of realistic reports by
sampling real patient rows (cost + features) from the assessed-patient CSV and
scattering them across random timestamps in each month.

Every seeded document carries ``seed: True`` so it can be removed later:
    python -m api.seed_predictions --clear

Usage:
    python -m api.seed_predictions            # add a year of data
    python -m api.seed_predictions --clear     # delete only seeded docs
"""
import csv
import os
import random
import sys
from datetime import datetime, timezone, timedelta

import firebase_admin
from firebase_admin import credentials, firestore

_HERE = os.path.dirname(__file__)
_CSV_PATH = os.path.join(_HERE, '..', 'csv', 'patient_features.csv')
_CRED_PATH = os.path.join(_HERE, 'serviceAccountKey.json')

# Reports generated per month. Randomised within this range so the bars vary
# month-to-month instead of looking flat/fake. A mild upward drift is applied
# so "this month vs last month" shows a believable trend.
REPORTS_PER_MONTH = (18, 36)
MONTHS_BACK = 12

GENDER_COL = 'gender (Sex 0=M, 1=F)'


def _init_db():
    if not firebase_admin._apps:
        firebase_admin.initialize_app(credentials.Certificate(_CRED_PATH))
    return firestore.client(database_id="statistics")


def _load_patient_pool() -> list[dict]:
    """Real (cost, age, gender, num_diseases, is_smoker) tuples from the CSV."""
    pool = []
    with open(_CSV_PATH, newline='') as f:
        for row in csv.DictReader(f, delimiter=';'):
            cost_str = row.get('target_avg_annual_cost', '')
            if not cost_str:
                continue
            try:
                cost = float(cost_str)
            except ValueError:
                continue
            pool.append({
                "cost": round(cost, 2),
                "age": int(float(row['age'])) if row.get('age') else None,
                "gender": int(float(row[GENDER_COL])) if row.get(GENDER_COL) else None,
                "num_diseases": int(float(row['num_diseases'])) if row.get('num_diseases') else None,
                "is_smoker": int(float(row['is_smoker'])) if row.get('is_smoker') else None,
            })
    return pool


def _random_timestamp_in_month(year: int, month: int) -> datetime:
    """A uniformly random instant within the given calendar month (UTC)."""
    start = datetime(year, month, 1, tzinfo=timezone.utc)
    nxt = datetime(year + (month == 12), (month % 12) + 1, 1, tzinfo=timezone.utc)
    span = int((nxt - start).total_seconds())
    return start + timedelta(seconds=random.randint(0, span - 1))


def clear_seeded(db) -> int:
    docs = db.collection("predictions").where("seed", "==", True).stream()
    n = 0
    batch = db.batch()
    for i, d in enumerate(docs, 1):
        batch.delete(d.reference)
        n += 1
        if i % 400 == 0:
            batch.commit()
            batch = db.batch()
    if n % 400 != 0:
        batch.commit()
    return n


def seed(db, pool: list[dict]) -> int:
    now = datetime.now(timezone.utc)
    coll = db.collection("predictions")
    total = 0
    batch = db.batch()
    pending = 0

    for back in range(MONTHS_BACK):
        # Walk backwards from the current month.
        anchor = now.replace(day=1) - timedelta(days=back * 28)
        anchor = anchor.replace(day=1)
        year, month = anchor.year, anchor.month

        lo, hi = REPORTS_PER_MONTH
        # Gentle growth toward the present month so MoM trends look organic.
        growth = 1.0 + 0.04 * (MONTHS_BACK - back)
        count = int(random.randint(lo, hi) * growth)

        for _ in range(count):
            patient = random.choice(pool)
            ts = _random_timestamp_in_month(year, month)
            doc = coll.document()
            batch.set(doc, {
                "cost": patient["cost"],
                "age": patient["age"],
                "gender": patient["gender"],
                "is_smoker": patient["is_smoker"],
                "num_diseases": patient["num_diseases"],
                "timestamp": ts,
                "month_year": ts.strftime("%Y-%m"),
                "seed": True,
            })
            total += 1
            pending += 1
            if pending == 400:
                batch.commit()
                batch = db.batch()
                pending = 0

    if pending:
        batch.commit()
    return total


def main():
    db = _init_db()

    if "--clear" in sys.argv:
        n = clear_seeded(db)
        print(f"Deleted {n} seeded prediction(s).")
        return

    pool = _load_patient_pool()
    print(f"Loaded {len(pool):,} real patient rows from CSV.")

    # Re-seeding cleanly: drop any prior seed run first so counts don't pile up.
    removed = clear_seeded(db)
    if removed:
        print(f"Cleared {removed} previously seeded prediction(s).")

    total = seed(db, pool)
    print(f"Added {total} seeded predictions across the last {MONTHS_BACK} months.")
    print("Run with --clear to remove them.")


if __name__ == "__main__":
    main()
