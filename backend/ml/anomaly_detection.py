"""
Anomaly Detection Module using Isolation Forest.
Detects abnormal elevator operating conditions without retraining on each call.
Handles missing models gracefully.
"""

from pathlib import Path
from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd
import joblib

MODEL_PATH = Path(__file__).resolve().parent / "saved_models" / "isolation_forest.joblib"
FEATURES = ["temperature", "current", "vibration", "speed", "door_closed"]

_isolation_model = None


def get_anomaly_model():
    """Load model once into memory."""
    global _isolation_model
    if _isolation_model is None:
        if MODEL_PATH.exists():
            try:
                _isolation_model = joblib.load(MODEL_PATH)
            except Exception as e:
                print(f"[AnomalyDetection] Warning: failed loading {MODEL_PATH}: {e}")
                _isolation_model = None
    return _isolation_model


def detect_anomaly(
    temperature: float,
    current: float,
    vibration: float,
    speed: float,
    door_closed: bool
) -> Tuple[bool, float]:
    """
    Evaluates telemetry features.
    Returns (is_anomaly: bool, anomaly_score: float [0.0 - 1.0]).
    """
    model = get_anomaly_model()
    df_features = pd.DataFrame([[
        temperature,
        current,
        vibration,
        speed,
        1 if door_closed else 0
    ]], columns=FEATURES)

    if model is not None:
        try:
            # IsolationForest: 1 for inlier (normal), -1 for outlier (anomaly)
            pred = model.predict(df_features)[0]
            # decision_function: positive for inliers, negative for outliers
            df_score = float(model.decision_function(df_features)[0])
            # Sigmoidal mapping to normalized anomaly score 0.0 (normal) to 1.0 (anomalous)
            normalized_score = float(1.0 / (1.0 + np.exp(df_score * 12.0)))
            is_anomaly = (pred == -1)
            return is_anomaly, round(normalized_score, 4)
        except Exception as e:
            print(f"[AnomalyDetection] Inference error: {e}")

    # Fallback heuristic if model is missing or fails
    is_anomaly = False
    score = 0.05
    if temperature >= 60.0 or current >= 5.0 or vibration >= 4.0 or speed >= 1.75:
        is_anomaly = True
        score = 0.75
    if not door_closed and speed > 0.10:
        is_anomaly = True
        score = 0.95

    return is_anomaly, round(score, 4)
