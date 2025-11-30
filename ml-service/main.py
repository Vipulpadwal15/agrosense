# ml-service/main.py

import io
import numpy as np
from typing import List
from fastapi import FastAPI, File, UploadFile, HTTPException, Form

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import tensorflow as tf
import json

# ✅ NEW: imports for yield model
from pathlib import Path
import pandas as pd
import joblib

# -----------------------------
# CONFIG
# -----------------------------
IMG_SIZE = 224

# Load plant disease model once at startup
MODEL_PATH = "plant_multicrop_model.h5"
print(f"🔄 Loading model from {MODEL_PATH} ...")
model = tf.keras.models.load_model(MODEL_PATH)
print("✅ Model loaded")

# Load class names from json file exported during training
CLASS_NAMES_PATH = "class_names.json"
with open(CLASS_NAMES_PATH, "r") as f:
    CLASS_NAMES = json.load(f)

NUM_CLASSES = len(CLASS_NAMES)
print(f"✅ Loaded {NUM_CLASSES} class names from {CLASS_NAMES_PATH}")

# ✅ Load yield model once at startup
BASE_DIR = Path(__file__).resolve().parent
YIELD_MODEL_PATH = BASE_DIR / "models" / "yield_model_india.joblib"

try:
    yield_model = joblib.load(YIELD_MODEL_PATH)
    print(f"🌾 Yield model loaded from {YIELD_MODEL_PATH}")
except Exception as e:
    print(f"⚠️ Yield model NOT LOADED: {e}")
    yield_model = None

# Disease knowledge base
# -----------------------------

def split_label(label: str):
    """
    'Tomato___Early_blight' -> ('Tomato', 'Early blight')
    """
    if "___" in label:
        crop, disease = label.split("___", 1)
    else:
        crop, disease = "Unknown", label
    disease = disease.replace("_", " ")
    return crop, disease

# Minimal advisory DB. You can extend this any time.
DISEASE_INFO = {
    ("Tomato", "Early blight"): {
        "severity": "medium",
        "summary": "Fungal disease that causes brown spots with concentric rings on older leaves.",
        "steps": [
            "Remove and destroy heavily infected leaves away from the field.",
            "Avoid overhead irrigation; water at the base of plants in morning.",
            "Spray a recommended fungicide (e.g., mancozeb or chlorothalonil) as per local agri officer’s advice.",
            "Maintain good crop spacing and avoid continuous tomato cropping in same field."
        ],
        "yield_impact": "If untreated, can reduce tomato yield by 20–40% depending on stage of infection."
    },
    ("Tomato", "Late blight"): {
        "severity": "high",
        "summary": "Severe disease that spreads fast in cool, wet conditions, affecting leaves and fruits.",
        "steps": [
            "Immediately remove severely infected plants to slow spread.",
            "Do not leave infected plant debris in the field; bury or burn as per local guidelines.",
            "Use a systemic-contact fungicide combination recommended by local extension service.",
            "Avoid irrigating late in the day; keep foliage as dry as possible."
        ],
        "yield_impact": "Can cause near total crop loss if conditions remain favourable and no control is taken."
    },
    ("Potato", "Late blight"): {
        "severity": "high",
        "summary": "Serious foliar and tuber disease of potato; thrives in cool, humid conditions.",
        "steps": [
            "Destroy infected foliage; do not use infected tubers for seed.",
            "Use recommended protectant and systemic fungicides in rotation.",
            "Ensure proper field drainage to reduce humidity around plants."
        ],
        "yield_impact": "Severe epidemics may cause 50–100% yield loss if unmanaged."
    },
    ("Wheat", "rust"): {
        "severity": "medium",
        "summary": "Rust disease causes orange or brown pustules on leaves and stems.",
        "steps": [
            "Use resistant varieties in future seasons.",
            "Consult local agri officer for recommended fungicide spray at early infection.",
            "Avoid very late sowing which favours rust development."
        ],
        "yield_impact": "Can significantly reduce grain weight and yield if not controlled early."
    },
}

DEFAULT_ADVICE = {
    "severity": "unknown",
    "summary": "Detailed advisory for this specific disease is not configured yet.",
    "steps": [
        "Take clear photos of affected plants and consult a local agriculture officer.",
        "Remove heavily infected plant parts and dispose them away from the field.",
        "Avoid excessive overhead irrigation and maintain proper spacing.",
        "Use disease-free seed/seedlings and follow crop rotation."
    ],
    "yield_impact": "Yield impact depends on crop stage and disease severity. Early detection and management can greatly reduce losses."
}

# -----------------------------
# API models
# -----------------------------

class TopPrediction(BaseModel):
    label: str
    crop: str
    disease: str
    confidence: float
    severity: str

class Advice(BaseModel):
    summary: str
    steps: list[str]
    yield_impact: str

class PredictionResponse(BaseModel):
    primary_prediction: TopPrediction
    top3: list[TopPrediction]
    advice: Advice

# ✅ Yield prediction request/response models
class YieldRequest(BaseModel):
    Area: float
    Annual_Rainfall: float
    Fertilizer: float
    Pesticide: float
    Crop: str
    Season: str
    State: str

class YieldResponse(BaseModel):
    predicted_yield: float
    unit: str = "Yield (same unit as dataset)"  # e.g. Qu/Ha, etc.

# -----------------------------
# FastAPI app
# -----------------------------

app = FastAPI(title="AgroSense Plant Disease & Yield API")

# Allow React localhost etc.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # you can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Helper: preprocess image
# -----------------------------

def preprocess_image(file_bytes: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    img = img.resize((IMG_SIZE, IMG_SIZE))
    arr = np.array(img).astype("float32") / 255.0
    arr = np.expand_dims(arr, axis=0)  # shape (1, 224, 224, 3)
    return arr

def filter_probs_by_crop(probs: np.ndarray, crop_hint: str | None):
    """
    If user selects a crop, zero-out probabilities for other crops.
    """
    if not crop_hint or crop_hint.lower() == "auto":
        return probs  # no filtering

    crop_hint_lower = crop_hint.lower()
    mask = np.zeros_like(probs)

    for idx, label in enumerate(CLASS_NAMES):
        crop, _ = split_label(label)
        if crop.lower().startswith(crop_hint_lower):
            mask[idx] = 1.0

    if mask.sum() == 0:
        # no matching classes found -> return original
        return probs

    filtered = probs * mask
    total = filtered.sum()
    if total <= 0:
        return probs

    return filtered / total


def build_top_predictions(probs: np.ndarray, top_k: int = 3):
    idxs = np.argsort(probs)[::-1]
    top_preds: list[TopPrediction] = []

    for idx in idxs:
        if idx >= len(CLASS_NAMES):
            continue

        label = CLASS_NAMES[idx]
        crop, disease = split_label(label)
        info = DISEASE_INFO.get((crop, disease), DEFAULT_ADVICE)

        top_preds.append(
            TopPrediction(
                label=label,
                crop=crop,
                disease=disease,
                confidence=float(probs[idx]),
                severity=info["severity"],
            )
        )

        if len(top_preds) == top_k:
            break

    return top_preds


# -----------------------------
# PLANT DISEASE ENDPOINT
# -----------------------------

@app.post("/predict", response_model=PredictionResponse)
async def predict(
    image: UploadFile = File(...),
    crop_hint: str | None = Form(None)
):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload a valid image file")

    bytes_data = await image.read()

    try:
        input_tensor = preprocess_image(bytes_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not process image: {e}")

    raw_preds = model.predict(input_tensor)
    probs = raw_preds[0]

    # 🔹 1) use crop hint to filter
    probs = filter_probs_by_crop(probs, crop_hint)

    # 🔹 2) build top-3 predictions
    top3 = build_top_predictions(probs, top_k=3)
    if not top3:
        raise HTTPException(status_code=500, detail="Model could not produce any predictions")

    primary = top3[0]

    # 🔹 3) low-confidence handling
    max_conf = primary.confidence
    LOW_CONF_THRESHOLD = 0.45  # tweak as you like

    if max_conf < LOW_CONF_THRESHOLD:
        # treat as uncertain – still return top3, but advisory says "not sure"
        info = DEFAULT_ADVICE.copy()
        info["summary"] = (
            "The model is not very confident about this result. "
            "Please try taking a clearer photo and also consult a local agriculture expert."
        )
        severity = "unknown"
        primary.severity = severity
    else:
        info = DISEASE_INFO.get((primary.crop, primary.disease), DEFAULT_ADVICE)

    advice_obj = Advice(
        summary=info["summary"],
        steps=info["steps"],
        yield_impact=info["yield_impact"],
    )

    return PredictionResponse(
        primary_prediction=primary,
        top3=top3,
        advice=advice_obj,
    )

# -----------------------------
# 🌾 CROP YIELD PREDICTION ENDPOINT
# -----------------------------

@app.post("/predict-yield", response_model=YieldResponse)
def predict_yield(payload: YieldRequest):
    if yield_model is None:
        raise HTTPException(status_code=500, detail="Yield model not loaded")

    # Build a DataFrame with the exact columns used during training
    df = pd.DataFrame([{
        "Area": payload.Area,
        "Annual_Rainfall": payload.Annual_Rainfall,
        "Fertilizer": payload.Fertilizer,
        "Pesticide": payload.Pesticide,
        "Crop": payload.Crop,
        "Season": payload.Season,
        "State": payload.State,
    }])

    try:
        pred = yield_model.predict(df)[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction Failed → {e}")

    return YieldResponse(
        predicted_yield=round(float(pred), 2),
        unit="Yield (same unit as dataset)"
    )

# -----------------------------
# ROOT
# -----------------------------

@app.get("/")
def root():
    return {"message": "AgroSense Plant Disease & Yield API is running"}
