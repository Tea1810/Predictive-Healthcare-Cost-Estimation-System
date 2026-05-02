import pandas as pd
import numpy as np

BASE = ""

# ── patients ──────────────────────────────────────────────────────────────────
patients = pd.read_csv(BASE + "patients.csv", usecols=["Id", "BIRTHDATE", "GENDER", "FIRST", "LAST"])
patients.rename(columns={"Id": "patient_id", "GENDER": "gender"}, inplace=True)
patients["name"] = patients["FIRST"] + " " + patients["LAST"]
patients["age"] = ((pd.Timestamp.now() - pd.to_datetime(patients["BIRTHDATE"])).dt.days / 365.25).astype(int)
patients.drop(columns=["BIRTHDATE", "FIRST", "LAST"], inplace=True)

# ── conditions: count distinct diseases per patient ───────────────────────────
conditions = pd.read_csv(BASE + "conditions.csv", usecols=["PATIENT", "DESCRIPTION"])
disease_count = (
    conditions.groupby("PATIENT")["DESCRIPTION"]
    .nunique()
    .reset_index()
    .rename(columns={"PATIENT": "patient_id", "DESCRIPTION": "num_diseases"})
)

# ── observations: last value per patient per metric ───────────────────────────
obs = pd.read_csv(
    BASE + "observations.csv",
    usecols=["DATE", "PATIENT", "DESCRIPTION", "VALUE", "UNITS"],
    low_memory=False,
)
obs["DATE"] = pd.to_datetime(obs["DATE"], utc=True)

METRIC_MAP = {
    "bmi":              ["Body mass index (BMI) [Ratio]"],
    "systolic_bp":      ["Systolic Blood Pressure"],
    "diastolic_bp":     ["Diastolic Blood Pressure"],
    "heart_rate":       ["Heart rate"],
    "hba1c":            ["Hemoglobin A1c/Hemoglobin.total in Blood"],
    "glucose":          ["Glucose [Mass/volume] in Blood"],
    "hdl_cholesterol":  ["Cholesterol in HDL [Mass/volume] in Serum or Plasma"],
    "triglycerides":    ["Triglyceride [Mass/volume] in Serum or Plasma"],
    "pain_score":       ["Pain severity - 0-10 verbal numeric rating [Score] - Reported"],
    "creatinine":       ["Creatinine [Mass/volume] in Blood"],
    "egfr":             ["Glomerular filtration rate [Volume Rate/Area] in Serum or Plasma"],
    "hemoglobin":       ["Hemoglobin [Mass/volume] in Blood"],
    "qaly_score":       ["QALY"],
    "gad7_score":       ["Generalized anxiety disorder 7 item (GAD-7) total score [Reported.PHQ]"],
    "is_smoker":        ["Tobacco smoking status"],
}

all_descriptions = [d for descs in METRIC_MAP.values() for d in descs]
obs_filtered = obs[obs["DESCRIPTION"].isin(all_descriptions)].copy()

# keep only the latest record per patient + description
obs_filtered = obs_filtered.sort_values("DATE")
obs_last = obs_filtered.groupby(["PATIENT", "DESCRIPTION"]).last().reset_index()

# pivot to wide: one row per patient, one column per description (values and units)
obs_wide_val = obs_last.pivot(index="PATIENT", columns="DESCRIPTION", values="VALUE").reset_index()
obs_wide_val.rename(columns={"PATIENT": "patient_id"}, inplace=True)

obs_wide_unit = obs_last.pivot(index="PATIENT", columns="DESCRIPTION", values="UNITS").reset_index()
obs_wide_unit.rename(columns={"PATIENT": "patient_id"}, inplace=True)

# build final metric columns from the pivot
metric_df = pd.DataFrame({"patient_id": obs_wide_val["patient_id"]})
for col, descs in METRIC_MAP.items():
    available = [d for d in descs if d in obs_wide_val.columns]
    if not available:
        metric_df[col] = np.nan
        metric_df[col + "_unit"] = np.nan
        continue
    if len(available) == 1:
        metric_df[col] = obs_wide_val[available[0]]
        metric_df[col + "_unit"] = obs_wide_unit[available[0]] if available[0] in obs_wide_unit.columns else np.nan
    else:
        # coalesce: take first non-null across the candidate columns
        metric_df[col] = obs_wide_val[available].bfill(axis=1).iloc[:, 0]
        metric_df[col + "_unit"] = obs_wide_unit[available].bfill(axis=1).iloc[:, 0]

# encode is_smoker as binary
metric_df["is_smoker"] = metric_df["is_smoker"].apply(
    lambda v: 1 if isinstance(v, str) and "daily" in v.lower() else 0
)

# ── encounters: total cost + avg annual cost ──────────────────────────────────
enc = pd.read_csv(
    BASE + "encounters.csv",
    usecols=["PATIENT", "START", "TOTAL_CLAIM_COST"],
    low_memory=False,
)
enc["START"] = pd.to_datetime(enc["START"], utc=True)
enc["TOTAL_CLAIM_COST"] = pd.to_numeric(enc["TOTAL_CLAIM_COST"], errors="coerce")

enc_agg = enc.groupby("PATIENT").agg(
    total_claim_cost=("TOTAL_CLAIM_COST", "sum"),
    _first_enc=("START", "min"),
    _last_enc=("START", "max"),
).reset_index().rename(columns={"PATIENT": "patient_id"})

enc_agg["_years_span"] = (
    (enc_agg["_last_enc"] - enc_agg["_first_enc"]).dt.days / 365.25
).clip(lower=1)

enc_agg["target_avg_annual_cost"] = (
    enc_agg["total_claim_cost"] / enc_agg["_years_span"]
).round(2)

enc_agg.drop(columns=["_first_enc", "_last_enc", "_years_span"], inplace=True)

# ── merge all ─────────────────────────────────────────────────────────────────
df = patients.merge(disease_count, on="patient_id", how="left")
df = df.merge(metric_df, on="patient_id", how="left")
df = df.merge(enc_agg, on="patient_id", how="left")

df["num_diseases"] = df["num_diseases"].fillna(0).astype(int)

# put name and age first, drop internal patient_id
front = ["name", "age", "gender"]
df = df[[*front, *[c for c in df.columns if c not in front + ["patient_id"]]]]

out_path = BASE + "patient_features.csv"
df.to_csv(out_path, index=False)
print(f"Saved {len(df):,} rows → {out_path}")
print(df.dtypes)
print(df.head(3).to_string())
