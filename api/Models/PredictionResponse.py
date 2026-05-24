from pydantic import BaseModel
from typing import Dict

class PredictionResponse(BaseModel):
    estimated_annual_cost: float
    contributions: Dict[str, float]
    report: str