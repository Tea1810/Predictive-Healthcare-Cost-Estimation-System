import os
import numpy as np
import pandas as pd
import joblib

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


def predict(data: dict) -> float:
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

    return float(np.expm1(model.predict(df_scaled)[0]))