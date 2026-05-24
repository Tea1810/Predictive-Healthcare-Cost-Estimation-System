import os
import numpy as np
import pandas as pd
import joblib
import shap

ARTIFACTS = os.path.join(os.path.dirname(__file__), 'artifacts')

model           = joblib.load(os.path.join(ARTIFACTS, 'model.pkl'))
scaler          = joblib.load(os.path.join(ARTIFACTS, 'scaler.pkl'))
medians         = joblib.load(os.path.join(ARTIFACTS, 'medians.pkl'))
feature_columns = joblib.load(os.path.join(ARTIFACTS, 'feature_columns.pkl'))

# Maps clean API field names to the column names the model was trained on
FIELD_MAP = {
    "age":             "age",
    "gender":          "gender (Sex 0=M, 1=F)",
    "num_diseases":    "num_diseases",
    "bmi":             "bmi (kg/m2)",
    "systolic_bp":     "systolic_bp (mm[Hg])",
    "diastolic_bp":    "diastolic_bp (mm[Hg])",
    "heart_rate":      "heart_rate (/min)",
    "hba1c":           "hba1c (%)",
    "glucose":         "glucose (mg/dL)",
    "hdl_cholesterol": "hdl_cholesterol (mg/dL)",
    "triglycerides":   "triglycerides (mg/dL)",
    "pain_score":      "pain_score ({score})",
    "creatinine":      "creatinine (mg/dL)",
    "egfr":            "egfr",
    "hemoglobin":      "hemoglobin (g/dL)",
    "qaly_score":      "qaly_score (a)",
    "gad7_score":      "gad7_score ({score})",
    "is_smoker":       "is_smoker",
}

# Human-readable display names for SHAP contributions
CLEAN_NAMES = {
    "age":                    "Age",
    "gender (Sex 0=M, 1=F)":  "Gender",
    "num_diseases":            "Number of Conditions",
    "bmi (kg/m2)":             "BMI",
    "systolic_bp (mm[Hg])":   "Systolic Blood Pressure",
    "diastolic_bp (mm[Hg])":  "Diastolic Blood Pressure",
    "heart_rate (/min)":       "Heart Rate",
    "hba1c (%)":               "HbA1c",
    "glucose (mg/dL)":         "Blood Glucose",
    "hdl_cholesterol (mg/dL)": "HDL Cholesterol",
    "triglycerides (mg/dL)":   "Triglycerides",
    "pain_score ({score})":    "Pain Score",
    "creatinine (mg/dL)":      "Creatinine",
    "egfr":                    "eGFR",
    "hemoglobin (g/dL)":       "Hemoglobin",
    "qaly_score (a)":          "Quality of Life Score",
    "gad7_score ({score})":    "Anxiety Score (GAD-7)",
    "is_smoker":               "Smoking Status",
}

_BASE_COLS = set(FIELD_MAP.values())

try:
    _explainer = shap.TreeExplainer(model)
except Exception:
    _explainer = None


def _compute_contributions(df_scaled: pd.DataFrame) -> dict:
    if _explainer is None:
        return {}

    sv = _explainer.shap_values(df_scaled)
    sv = sv[0] if sv.ndim == 2 else sv

    raw = {
        CLEAN_NAMES[col]: float(sv[i])
        for i, col in enumerate(feature_columns)
        if col in _BASE_COLS
    }

    total = sum(abs(v) for v in raw.values()) or 1
    return {k: round(v / total * 100, 1) for k, v in raw.items()}


def predict(data: dict) -> tuple[float, dict]:
    row = {col_name: data.get(api_name) for api_name, col_name in FIELD_MAP.items()}
    df = pd.DataFrame([row])

    # add missingness flags — same logic as training
    for col in list(df.columns):
        if df[col].isnull().any():
            df[col + '_missing'] = df[col].isnull().astype(int)

    # align to training columns (missingness flag columns may be missing if input had no nulls)
    for col in feature_columns:
        if col not in df.columns:
            df[col] = 0
    df = df[feature_columns]

    df = df.fillna(medians)
    df_scaled = pd.DataFrame(scaler.transform(df), columns=df.columns)

    cost = float(np.expm1(model.predict(df_scaled)[0]))
    contributions = _compute_contributions(df_scaled)
    return cost, contributions