#!/usr/bin/env python3
"""
Reads csv/patient_features.csv, runs the trained model on every row in a
single batch, and writes the 100 rows whose model prediction is closest to
the recorded target_avg_annual_cost to csv/closest_100.csv.

Run from the project root:
    python find_closest_100.py
"""
import sys
import os

import numpy as np
import pandas as pd

# Ensure the project root is on the path so 'api' is importable.
ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)

# Import model artifacts and the column mapping from the existing module.
# This reuses the already-loaded model instead of loading it a second time.
from api.predict import model, scaler, medians, feature_columns, FIELD_MAP

CSV_IN  = os.path.join(ROOT, 'csv', 'patient_features.csv')
CSV_OUT = os.path.join(ROOT, 'csv', 'closest_100.csv')
TARGET_COL = 'target_avg_annual_cost'

# Base feature columns (training names, no _missing flags)
BASE_COLS = list(FIELD_MAP.values())


def build_feature_matrix(df: pd.DataFrame) -> pd.DataFrame:
    """
    Replicate the exact preprocessing from api/predict.py, but over the
    entire dataframe at once instead of one row at a time.
    """
    feat = pd.DataFrame(index=df.index)

    # Pull each base feature column from the raw CSV (NaN if absent).
    for col in BASE_COLS:
        feat[col] = df[col] if col in df.columns else np.nan

    # Add missingness flags for any column that has nulls.
    for col in BASE_COLS:
        if feat[col].isnull().any():
            feat[col + '_missing'] = feat[col].isnull().astype(int)

    # Align to the exact column order the model was trained on;
    # fill any column the CSV didn't provide with 0.
    for col in feature_columns:
        if col not in feat.columns:
            feat[col] = 0
    feat = feat[feature_columns]

    # Fill remaining NaNs with training medians, then scale.
    feat = feat.fillna(medians)
    scaled = pd.DataFrame(scaler.transform(feat), columns=feature_columns, index=feat.index)
    return scaled


def main() -> None:
    print(f'Reading {CSV_IN} …')
    df = pd.read_csv(CSV_IN, sep=';')
    print(f'  {len(df):,} total rows')

    # Keep only rows with a usable target value.
    df = df.dropna(subset=[TARGET_COL]).reset_index(drop=True)
    print(f'  {len(df):,} rows with a valid target')

    targets = df[TARGET_COL].astype(float).to_numpy()

    print('Building feature matrix …')
    scaled = build_feature_matrix(df)

    print('Running batch prediction …')
    log_preds = model.predict(scaled)
    predicted = np.expm1(log_preds)

    diffs = np.abs(predicted - targets)

    # Indices of the 100 smallest absolute differences.
    top_idx = np.argsort(diffs)[:100]

    out = df.iloc[top_idx].copy()
    out['model_predicted_cost'] = np.round(predicted[top_idx], 2)
    out['absolute_difference']  = np.round(diffs[top_idx], 2)
    out = out.sort_values('absolute_difference').reset_index(drop=True)

    out.to_csv(CSV_OUT, sep=';', index=False)

    print(f'\nDone — {len(out)} rows written to {CSV_OUT}')
    print(f'  Best  match  diff: ${out["absolute_difference"].iloc[0]:.2f}')
    print(f'  Worst match  diff: ${out["absolute_difference"].iloc[-1]:.2f}')


if __name__ == '__main__':
    main()
