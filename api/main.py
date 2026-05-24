import os
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from api.Models.PatientData import PatientData
from api.Models.PredictionResponse import PredictionResponse
from api.Models.ReportRequest import ReportRequest
from api.predict import predict
from api.report import generate_report
from api.pdf import build_pdf
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

@app.post("/predict", response_model=PredictionResponse, dependencies=[Depends(verify_token)])
def predict_cost(patient: PatientData):
    patient_dict = patient.model_dump()
    cost, contributions = predict(patient_dict)
    report = generate_report(cost, contributions, patient_dict)
    return PredictionResponse(
        estimated_annual_cost=round(cost, 2),
        contributions=contributions,
        report=report,
    )


@app.post("/report/pdf", dependencies=[Depends(verify_token)])
def download_report(body: ReportRequest):
    pdf = build_pdf(
        cost=body.estimated_annual_cost,
        contributions=body.contributions,
        report=body.report,
        patient=body.patient,
    )
    return Response(
        content=pdf.read(),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=healthcare-cost-report.pdf"},
    )
