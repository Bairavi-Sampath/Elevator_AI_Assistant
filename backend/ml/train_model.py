"""
Model training pipeline for Autonomous Elevator FDIR Assistant.
Generates synthetic sensor data, trains Isolation Forest and Random Forest Classifier,
evaluates metrics, and saves models via Joblib.
"""

import json
import os
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)
import joblib

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_PATH = BASE_DIR / "dataset" / "elevator_sensor_data.csv"
SAVED_MODELS_DIR = Path(__file__).resolve().parent / "saved_models"

FEATURES = ["temperature", "current", "vibration", "speed", "door_closed"]
FAULT_CLASSES = [
    "Normal",
    "Motor Overheating",
    "Motor Overcurrent",
    "Bearing Vibration",
    "Overspeed",
    "Door Interlock Fault"
]


def generate_elevator_dataset(n_samples: int = 4800, seed: int = 42) -> pd.DataFrame:
    """
    Generate synthetic elevator sensor telemetry with labeled operational & fault states.
    Ensures realistic cross-correlations, physical ranges, and noise.
    """
    np.random.seed(seed)
    records = []

    # Distribution of scenarios
    # Normal: ~40%, 5 fault classes: ~12% each
    n_normal = int(n_samples * 0.40)
    n_each_fault = int((n_samples - n_normal) / 5)

    # 1. Normal Baseline
    for _ in range(n_normal):
        speed = float(np.random.choice([0.0, 0.6, 1.0, 1.25, 1.5], p=[0.25, 0.15, 0.2, 0.3, 0.1]))
        if speed > 0:
            speed += float(np.random.normal(0, 0.05))
            speed = max(0.1, min(1.65, speed))
            door_closed = 1
            direction = np.random.choice(["up", "down"])
        else:
            door_closed = int(np.random.choice([0, 1], p=[0.4, 0.6]))
            direction = "idle"

        temp = float(np.random.normal(42.0, 3.8))
        current = float(np.random.normal(3.2, 0.35)) if speed > 0 else float(np.random.normal(0.6, 0.1))
        vibration = float(np.random.normal(1.8, 0.35)) if speed > 0 else float(np.random.normal(0.2, 0.05))
        floor = int(np.random.randint(1, 13))

        records.append({
            "temperature": round(max(20.0, min(56.0, temp)), 2),
            "current": round(max(0.2, min(4.8, current)), 2),
            "vibration": round(max(0.1, min(3.2, vibration)), 2),
            "speed": round(max(0.0, speed), 2),
            "door_closed": door_closed,
            "floor": floor,
            "direction": direction,
            "fault_label": "Normal"
        })

    # 2. Motor Overheating (Stator thermal overload: temp > 60°C warning, > 75°C critical)
    for _ in range(n_each_fault):
        speed = float(np.random.uniform(0.4, 1.5))
        temp = float(np.random.uniform(62.0, 96.0))
        current = float(np.random.uniform(4.5, 7.8))
        vibration = float(np.random.uniform(1.8, 4.2))
        floor = int(np.random.randint(1, 13))
        records.append({
            "temperature": round(temp, 2),
            "current": round(current, 2),
            "vibration": round(vibration, 2),
            "speed": round(speed, 2),
            "door_closed": 1,
            "floor": floor,
            "direction": np.random.choice(["up", "down"]),
            "fault_label": "Motor Overheating"
        })

    # 3. Motor Overcurrent (Electrical spike / mechanical binding: current > 5.0A warning, > 7.0A critical)
    for _ in range(n_each_fault):
        speed = float(np.random.uniform(0.2, 1.4))
        temp = float(np.random.uniform(46.0, 78.0))
        current = float(np.random.uniform(5.4, 11.2))
        vibration = float(np.random.uniform(2.2, 5.2))
        floor = int(np.random.randint(1, 13))
        records.append({
            "temperature": round(temp, 2),
            "current": round(current, 2),
            "vibration": round(vibration, 2),
            "speed": round(speed, 2),
            "door_closed": 1,
            "floor": floor,
            "direction": np.random.choice(["up", "down"]),
            "fault_label": "Motor Overcurrent"
        })

    # 4. Bearing Vibration (Raceway wear / deflector bearing failure: vibration > 4.0 mm/s, > 7.0 critical)
    for _ in range(n_each_fault):
        speed = float(np.random.uniform(0.5, 1.5))
        temp = float(np.random.uniform(52.0, 84.0))
        current = float(np.random.uniform(3.5, 6.5))
        vibration = float(np.random.uniform(4.4, 12.5))
        floor = int(np.random.randint(1, 13))
        records.append({
            "temperature": round(temp, 2),
            "current": round(current, 2),
            "vibration": round(vibration, 2),
            "speed": round(speed, 2),
            "door_closed": 1,
            "floor": floor,
            "direction": np.random.choice(["up", "down"]),
            "fault_label": "Bearing Vibration"
        })

    # 5. Overspeed (Governor trip / VFD loop drift: speed > 1.75 m/s, > 2.20 critical)
    for _ in range(n_each_fault):
        speed = float(np.random.uniform(1.82, 2.85))
        temp = float(np.random.uniform(42.0, 68.0))
        current = float(np.random.uniform(4.2, 7.5))
        vibration = float(np.random.uniform(2.5, 5.6))
        floor = int(np.random.randint(1, 13))
        records.append({
            "temperature": round(temp, 2),
            "current": round(current, 2),
            "vibration": round(vibration, 2),
            "speed": round(speed, 2),
            "door_closed": 1,
            "floor": floor,
            "direction": np.random.choice(["up", "down"]),
            "fault_label": "Overspeed"
        })

    # 6. Door Interlock Fault (Door contact OPEN while car travels: speed > 0.10 m/s)
    for _ in range(n_each_fault):
        speed = float(np.random.uniform(0.3, 1.6))
        temp = float(np.random.uniform(36.0, 52.0))
        current = float(np.random.uniform(2.8, 4.4))
        vibration = float(np.random.uniform(1.2, 2.6))
        floor = int(np.random.randint(1, 13))
        records.append({
            "temperature": round(temp, 2),
            "current": round(current, 2),
            "vibration": round(vibration, 2),
            "speed": round(speed, 2),
            "door_closed": 0,  # Unsafe door open!
            "floor": floor,
            "direction": np.random.choice(["up", "down"]),
            "fault_label": "Door Interlock Fault"
        })

    df = pd.DataFrame(records)
    # Shuffle
    df = df.sample(frac=1.0, random_state=seed).reset_index(drop=True)
    return df


def train_and_save_models():
    """Execute complete dataset generation, model training, evaluation, and serialization."""
    DATASET_PATH.parent.mkdir(parents=True, exist_ok=True)
    SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Generating synthetic elevator dataset ({DATASET_PATH})...")
    df = generate_elevator_dataset()
    df.to_csv(DATASET_PATH, index=False)
    print(f"Dataset generated with {len(df)} samples across {df['fault_label'].nunique()} classes.")

    X = df[FEATURES]
    y = df["fault_label"]

    # 1. Train Model 1: Isolation Forest for Anomaly Detection
    print("\nTraining Model 1: Isolation Forest...")
    # Train primarily on normal data with realistic contamination
    X_normal = df[df["fault_label"] == "Normal"][FEATURES]
    iso_forest = IsolationForest(
        n_estimators=150,
        contamination=0.20,
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X_normal)

    iso_path = SAVED_MODELS_DIR / "isolation_forest.joblib"
    joblib.dump(iso_forest, iso_path)
    print(f"Isolation Forest saved to: {iso_path}")

    # 2. Train Model 2: Random Forest Classifier for Fault Isolation
    print("\nTraining Model 2: Random Forest Classifier...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    clf = RandomForestClassifier(
        n_estimators=150,
        max_depth=12,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1
    )
    clf.fit(X_train, y_train)

    # Evaluation
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    prec_macro = precision_score(y_test, y_pred, average="macro", zero_division=0)
    rec_macro = recall_score(y_test, y_pred, average="macro", zero_division=0)
    f1_macro = f1_score(y_test, y_pred, average="macro", zero_division=0)
    cm = confusion_matrix(y_test, y_pred, labels=clf.classes_)

    print("=" * 60)
    print("RANDOM FOREST CLASSIFIER EVALUATION REPORT")
    print("=" * 60)
    print(f"Overall Accuracy : {acc * 100:.2f}%")
    print(f"Macro Precision  : {prec_macro * 100:.2f}%")
    print(f"Macro Recall     : {rec_macro * 100:.2f}%")
    print(f"Macro F1-Score   : {f1_macro * 100:.2f}%")
    print("\nConfusion Matrix (Classes: %s):" % list(clf.classes_))
    print(cm)
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))
    print("=" * 60)

    clf_path = SAVED_MODELS_DIR / "fault_classifier.joblib"
    joblib.dump(clf, clf_path)
    print(f"Fault Classifier saved to: {clf_path}")

    # Save model metadata and feature mappings
    metadata = {
        "features": FEATURES,
        "classes": list(clf.classes_),
        "metrics": {
            "accuracy": float(acc),
            "macro_precision": float(prec_macro),
            "macro_recall": float(rec_macro),
            "macro_f1": float(f1_macro)
        },
        "model_version": "v1.0.0",
        "dataset_rows": len(df)
    }
    meta_path = SAVED_MODELS_DIR / "model_metadata.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata saved to: {meta_path}")

    return {
        "accuracy": acc,
        "f1_score": f1_macro,
        "classes": list(clf.classes_)
    }


if __name__ == "__main__":
    train_and_save_models()

