import pandas as pd
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import joblib
import numpy as np

# ---------- Paths ----------
BASE_DIR = Path(__file__).parent
DATA_PATH = BASE_DIR / "data" / "crop_yield_india.csv"
MODEL_PATH = BASE_DIR / "models" / "yield_model_india.joblib"


def load_and_clean():
    print(f"📥 Loading data from: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)

    expected_cols = [
        "Crop",
        "Crop_Year",
        "Season",
        "State",
        "Area",
        "Production",
        "Annual_Rainfall",
        "Fertilizer",
        "Pesticide",
        "Yield",
    ]

    missing_cols = [c for c in expected_cols if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing expected columns in CSV: {missing_cols}")

    df = df[expected_cols]

    df = df.dropna(subset=["Crop", "Season", "State", "Area", "Production", "Yield"])
    df = df[df["Area"] > 0]
    df = df[df["Yield"] > 0]

    print("✅ Cleaned shape:", df.shape)
    return df


def train_model(df: pd.DataFrame):
    numeric_features = ["Area", "Annual_Rainfall", "Fertilizer", "Pesticide"]
    categorical_features = ["Crop", "Season", "State"]
    target_col = "Yield"

    X = df[numeric_features + categorical_features]
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
        ]
    )

    model = RandomForestRegressor(
        n_estimators=150,  # a bit smaller so model file not insanely huge
        random_state=42,
        n_jobs=-1,
    )

    pipeline = Pipeline(
        steps=[
            ("preprocess", preprocessor),
            ("model", model),
        ]
    )

    print("🎯 Training model...")
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))

    print(f"📊 R2 score : {r2:.4f}")
    print(f"📊 MAE      : {mae:.4f}")
    print(f"📊 RMSE     : {rmse:.4f}")

    return pipeline


def save_model(pipeline):
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH, compress=3)
    print(f"💾 Model saved to: {MODEL_PATH}")


def main():
    df = load_and_clean()
    pipeline = train_model(df)
    save_model(pipeline)


if __name__ == "__main__":
    main()
