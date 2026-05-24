from pydantic import BaseModel
from typing import Optional

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
