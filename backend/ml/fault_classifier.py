"""
Fault Classification Module using Random Forest Classifier.
Classifies elevator operating state into:
- Normal
- Motor Overheating
- Motor Overcurrent
- Bearing Vibration
- Overspeed
- Door Interlock Fault
"""

from pathlib import Path
from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd
import joblib

MODEL_PATH = Path(__file__).resolve().parent / "saved_models" / "fault_classifier.joblib"
FEATURES = ["temperature", "current", "vibration", "speed", "door_closed"]

_fault_classifier = None


def get_fault_classifier():
    """Cached loader for Random Forest Classifier."""
    global _fault_classifier
    if _fault_classifier is None:
        if MODEL_PATH.exists():
            try:
                _fault_classifier = joblib.load(MODEL_PATH)
            except Exception as e:
                print(f"[FaultClassifier] Warning: failed loading {MODEL_PATH}: {e}")
                _fault_classifier = None
    return _fault_classifier


def classify_fault(
    temperature: float,
    current: float,
    vibration: float,
    speed: float,
    door_closed: bool
) -> Tuple[str, float, Dict[str, float]]:
    """
    Evaluates telemetry features.
    Returns (predicted_fault: str, confidence: float [0-100], probabilities: Dict[str, float]).
    """
    model = get_fault_classifier()
    df_features = pd.DataFrame([[
        temperature,
        current,
        vibration,
        speed,
        1 if door_closed else 0
    ]], columns=FEATURES)

    if model is not None:
        try:
            pred = model.predict(df_features)[0]
            proba = model.predict_proba(df_features)[0]
            classes = list(model.classes_)
            prob_dict = {cls_name: round(float(p), 4) for cls_name, p in zip(classes, proba)}
            confidence = round(float(np.max(proba)) * 100.0, 2)
            return str(pred), confidence, prob_dict
        except Exception as e:
            print(f"[FaultClassifier] Inference error: {e}")

    # Fallback rule-based classifier if model is not loaded
    if not door_closed and speed > 0.10:
        return "Door Interlock Fault", 98.0, {"Door Interlock Fault": 0.98, "Normal": 0.02}
    if speed >= 1.75:
        return "Overspeed", 95.0, {"Overspeed": 0.95, "Normal": 0.05}
    if vibration >= 4.0:
        return "Bearing Vibration", 92.0, {"Bearing Vibration": 0.92, "Normal": 0.08}
    if temperature >= 60.0:
        return "Motor Overheating", 90.0, {"Motor Overheating": 0.90, "Normal": 0.10}
    if current >= 5.0:
        return "Motor Overcurrent", 88.0, {"Motor Overcurrent": 0.88, "Normal": 0.12}

    return "Normal", 99.0, {"Normal": 0.99}
