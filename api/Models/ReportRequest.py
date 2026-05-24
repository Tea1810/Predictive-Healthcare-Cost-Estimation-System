from pydantic import BaseModel
from typing import Dict, Any

class ReportRequest(BaseModel):
    estimated_annual_cost: float
    contributions: Dict[str, float]
    report: str
    patient: Dict[str, Any]