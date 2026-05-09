import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from api.predict import predict

app = FastAPI(title="Healthcare Cost Estimator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # lock this down to your React domain in production
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


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


@app.post("/predict", response_model=PredictionResponse)
def predict_cost(patient: PatientData):
    cost = predict(patient.model_dump())
    return PredictionResponse(estimated_annual_cost=round(cost, 2))
