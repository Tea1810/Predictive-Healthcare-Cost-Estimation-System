import os
import uvicorn
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from api.predict import predict
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

_cred_path = os.path.join(os.path.dirname(__file__), 'serviceAccountKey.json')
firebase_admin.initialize_app(credentials.Certificate(_cred_path))

app = FastAPI(title="Healthcare Cost Estimator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


async def verify_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization.split(" ", 1)[1]
    try:
        firebase_auth.verify_id_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


class PatientData(BaseModel):
    age: int
    gender: int                          # 0 = M, 1 = F
    num_diseases: int
    bmi: Optional[float] = None
    systolic_bp: Optional[float] = None
    diastolic_bp: Optional[float] = None
    heart_rate: Optional[float] = None
    hba1c: Optional[float] = None
    glucose: Optional[float] = None
    hdl_cholesterol: Optional[float] = None
    triglycerides: Optional[float] = None
    pain_score: Optional[float] = None
    creatinine: Optional[float] = None
    egfr: Optional[float] = None
    hemoglobin: Optional[float] = None
    qaly_score: Optional[float] = None
    gad7_score: Optional[float] = None
    is_smoker: int = 0


class PredictionResponse(BaseModel):
    estimated_annual_cost: float


@app.post("/predict", response_model=PredictionResponse, dependencies=[Depends(verify_token)])
def predict_cost(patient: PatientData):
    cost = predict(patient.model_dump())
    return PredictionResponse(estimated_annual_cost=round(cost, 2))
