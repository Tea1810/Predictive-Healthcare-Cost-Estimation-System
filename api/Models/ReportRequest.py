from pydantic import BaseModel
from typing import Dict, Any, Optional

class ReportRequest(BaseModel):
    estimated_annual_cost: float
    contributions: Dict[str, float]
    report: str
    patient_name: Optional[str] = ""
    patient: Dict[str, Any]