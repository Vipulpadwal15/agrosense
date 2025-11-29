from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
from datetime import date

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class YieldInput(BaseModel):
    cropType: str
    soilType: str
    areaAcres: float
    sowingDate: str
    irrigation: str


@app.post("/ml/disease")
async def detect_disease(file: UploadFile = File(...), crop_type: str = Form(...)):
    # NOTE: Stub logic – replace with real CNN model later
    # For now, return fake but structured response
    sample_diseases = {
      "Tomato": ["Early Blight", "Late Blight", "Septoria Leaf Spot"],
      "Potato": ["Late Blight", "Black Scurf"],
      "Wheat": ["Leaf Rust", "Yellow Rust"],
      "Rice": ["Blast", "Brown Spot"],
      "Cotton": ["Leaf Curl", "Bacterial Blight"],
      "Soybean": ["Rust", "Downy Mildew"],
    }

    diseases = sample_diseases.get(crop_type, ["Unknown Disease"])
    primary = random.choice(diseases)
    secondary = random.choice(diseases)

    confidence = round(random.uniform(0.75, 0.95), 2)
    severity = random.choice(["low", "moderate", "high"])

    advice_steps = [
        "Remove heavily infected leaves and destroy them away from the field.",
        "Avoid overhead irrigation to reduce leaf wetness.",
        "Use recommended fungicide as per local agricultural office advice.",
    ]

    if severity == "high":
        advice_steps.append("Consider consulting local agronomist immediately.")

    return {
        "crop": crop_type,
        "primary_prediction": {
            "disease": primary,
            "confidence": confidence,
            "severity": severity,
        },
        "secondary_prediction": {
            "disease": secondary,
            "confidence": round(confidence - 0.1, 2),
        },
        "advice": {
            "steps": advice_steps,
            "yield_impact": "If untreated, this may reduce yield by 15–40%. Early action can significantly reduce losses.",
        },
    }


@app.post("/ml/yield")
async def predict_yield(data: YieldInput):
    # Stub logic – replace with real ML model later
    base_yield = {
        "Wheat": 20,
        "Rice": 25,
        "Cotton": 10,
        "Soybean": 12,
        "Tomato": 30,
    }.get(data.cropType, 15)

    soil_factor = {
        "Black": 1.1,
        "Red": 1.0,
        "Sandy": 0.9,
        "Loamy": 1.15,
    }.get(data.soilType, 1.0)

    irrigation_factor = {
        "Rainfed": 0.9,
        "Canal": 1.05,
        "Borewell": 1.0,
        "Drip": 1.1,
    }.get(data.irrigation, 1.0)

    expected = base_yield * soil_factor * irrigation_factor
    min_yield = round(expected * 0.85, 1)
    max_yield = round(expected * 1.15, 1)
    expected_per_acre = round(expected, 1)

    notes = [
        "Timely weeding and pest control will help you reach the higher end of this range.",
        "Monitor local rainfall; one extra irrigation at flowering can improve yield.",
    ]

    return {
        "expected_yield_per_acre": expected_per_acre,
        "min_yield": min_yield,
        "max_yield": max_yield,
        "confidence": "medium",
        "notes": notes,
    }
