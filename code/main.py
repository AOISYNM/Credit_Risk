import os
from contextlib import asynccontextmanager
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent
ml_model = {}


def find_file(name: str) -> Path:
    """Look for a model file next to main.py, then in the repo root."""
    for folder in (BASE_DIR, BASE_DIR.parent):
        path = folder / name
        if path.exists():
            return path
    raise FileNotFoundError(f"{name} not found in {BASE_DIR} or {BASE_DIR.parent}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    ml_model["model"] = joblib.load(find_file("credit_risk_model.pkl"))
    ml_model["threshold"] = float(joblib.load(find_file("best_threshold.pkl")))
    yield
    ml_model.clear()


app = FastAPI(lifespan=lifespan)

# Local dev origins + any deployed frontend URLs from CORS_ORIGINS
# (comma-separated, e.g. "https://credit-risk-web.onrender.com")
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
origins += [
    o.strip().rstrip("/")
    for o in os.getenv("CORS_ORIGINS", "").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoanApplication(BaseModel):
    person_age: int
    person_income: float
    person_home_ownership: str
    person_emp_length: float
    loan_intent: str
    loan_grade: str
    loan_amnt: float
    loan_int_rate: float
    loan_percent_income: float
    cb_person_default_on_file: str
    cb_person_cred_hist_length: int


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.post("/predict")
async def predict(data: LoanApplication):
    input_df = pd.DataFrame([data.model_dump()])

    probability = float(ml_model["model"].predict_proba(input_df)[:, 1][0])
    threshold = ml_model["threshold"]
    prediction = int(probability >= threshold)

    return {
        "default_probability": probability,
        "default_prediction": prediction,
        "threshold": threshold,
        "Result": "High Risk" if prediction == 1 else "Low Risk",
    }