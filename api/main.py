import os
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

from api.Models.PatientData import PatientData
from api.Models.PredictionResponse import PredictionResponse
from api.Models.ReportRequest import ReportRequest
from api.predict import predict
from api.report import generate_report
from api.pdf import build_pdf
from api.firestore_log import log_prediction, get_dashboard_stats
from api.user_reports import save_report, list_reports, rename_report, get_report_pdf
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


async def get_uid(authorization: str = Header(...)) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization.split(" ", 1)[1]
    try:
        decoded = firebase_auth.verify_id_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return decoded["uid"]


class RenameReportRequest(BaseModel):
    name: str


@app.post("/predict", response_model=PredictionResponse)
def predict_cost(patient: PatientData, uid: str = Depends(get_uid)):
    patient_dict = patient.model_dump()
    cost, contributions = predict(patient_dict)
    report = generate_report(cost, contributions, patient_dict)
    log_prediction(cost, patient_dict)
    # Persist the generated report — including its rendered PDF — to the user's
    # Reports page (best-effort: never fail the prediction if the write hiccups).
    try:
        pdf_bytes = build_pdf(round(cost, 2), contributions, report, patient_dict).getvalue()
        save_report(uid, cost=round(cost, 2), report=report, pdf=pdf_bytes,
                    contributions=contributions, patient=patient_dict)
    except Exception:
        pass
    return PredictionResponse(
        estimated_annual_cost=round(cost, 2),
        contributions=contributions,
        report=report,
    )


@app.get("/reports")
def get_reports(uid: str = Depends(get_uid)):
    try:
        return list_reports(uid)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/reports/{report_id}/pdf")
def report_pdf(report_id: str, uid: str = Depends(get_uid)):
    pdf = get_report_pdf(uid, report_id)
    if pdf is None:
        raise HTTPException(status_code=404, detail="Report PDF not found")
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": "inline; filename=healthcare-cost-report.pdf"},
    )


@app.patch("/reports/{report_id}")
def patch_report(report_id: str, body: RenameReportRequest, uid: str = Depends(get_uid)):
    name = body.name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Name cannot be empty")
    if not rename_report(uid, report_id, name):
        raise HTTPException(status_code=404, detail="Report not found")
    return {"ok": True}


@app.get("/dashboard")
def dashboard_stats():
    try:
        return get_dashboard_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/report/pdf", dependencies=[Depends(get_uid)])
def download_report(body: ReportRequest):
    pdf = build_pdf(
        cost=body.estimated_annual_cost,
        contributions=body.contributions,
        report=body.report,
        patient=body.patient,
        patient_name=body.patient_name or "",
    )
    return Response(
        content=pdf.read(),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=healthcare-cost-report.pdf"},
    )
