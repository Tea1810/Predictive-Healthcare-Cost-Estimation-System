import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.2"

FALLBACK = (
    "Your estimated annual healthcare cost has been calculated based on your personal "
    "health profile and clinical data. The key factors influencing this estimate include "
    "your age, number of diagnosed conditions, and lifestyle choices such as smoking status. "
    "For a detailed breakdown and personalised advice, please consult with your healthcare provider."
)


def generate_report(cost: float, contributions: dict, patient: dict) -> str:
    top = sorted(contributions.items(), key=lambda x: abs(x[1]), reverse=True)[:5]
    factors_text = "\n".join(
        f"  - {name}: {pct:+.1f}% impact" for name, pct in top
    )

    gender = "male" if patient.get("gender") == 0 else "female"
    smoker = "a smoker" if patient.get("is_smoker") == 1 else "a non-smoker"
    address = "Sara Harris" if gender == "female" else "John Doe"

    prompt = (
        f"You are a compassionate healthcare financial advisor writing a personalised report for a patient.\n\n"
        f"Patient name: {address}\n"
        f"Patient profile: {patient.get('age')} year old {gender}, {smoker}, "
        f"with {patient.get('num_diseases')} diagnosed medical conditions.\n\n"
        f"Estimated annual healthcare cost: ${cost:,.2f}\n\n"
        f"Top factors driving this estimate (positive = increases cost, negative = reduces it):\n"
        f"{factors_text}\n\n"
        f"Write a friendly, clear 3-paragraph report for the patient:\n"
        f"1. What their estimated annual cost means in practical terms\n"
        f"2. Which personal factors are having the biggest impact on their cost and why\n"
        f"3. Practical lifestyle suggestions that could help reduce their costs\n\n"
        f"Keep it under 200 words. Use plain language. Do not mention SHAP, machine learning, or AI. "
        f"Address the patient directly by name as '{address}' and use 'you' and 'your' throughout."
    )

    try:
        resp = requests.post(
            OLLAMA_URL,
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
            timeout=60,
        )
        resp.raise_for_status()
        return resp.json()["response"].strip()
    except Exception:
        return FALLBACK
