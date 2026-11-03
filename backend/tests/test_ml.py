"""
Unit tests for Machine Learning Anomaly Detection and Fault Classification.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ml.anomaly_detection import detect_anomaly, get_anomaly_model
from ml.fault_classifier import classify_fault, get_fault_classifier


def test_models_loaded():
    iso_model = get_anomaly_model()
    assert iso_model is not None, "Isolation Forest model must be loaded from disk"

    clf_model = get_fault_classifier()
    assert clf_model is not None, "Fault Classifier model must be loaded from disk"
    assert len(clf_model.classes_) == 6


def test_anomaly_detection_nominal():
    # Nominal parameters: 42°C, 3.2A, 1.8mm/s, 1.25m/s, door closed
    is_anomaly, score = detect_anomaly(42.0, 3.2, 1.8, 1.25, True)
    assert not is_anomaly
    assert score < 0.60


def test_anomaly_detection_extreme_fault():
    # Extreme temperature & vibration: 88°C, 8.5A, 9.2mm/s
    is_anomaly, score = detect_anomaly(88.0, 8.5, 9.2, 1.25, True)
    assert is_anomaly
    assert score > 0.60


def test_fault_classifier_normal():
    fault, conf, probs = classify_fault(42.0, 3.2, 1.8, 1.25, True)
    assert fault == "Normal"
    assert conf >= 70.0
    assert "Normal" in probs


def test_fault_classifier_overheating():
    # 85°C, 6.5A
    fault, conf, probs = classify_fault(85.0, 6.5, 2.5, 1.0, True)
    assert fault == "Motor Overheating"
    assert conf >= 70.0


def test_fault_classifier_overcurrent():
    # 8.8A current spike
    fault, conf, probs = classify_fault(52.0, 8.8, 2.8, 1.0, True)
    assert fault == "Motor Overcurrent"
    assert conf >= 65.0


def test_fault_classifier_vibration():
    # 8.5 mm/s bearing vibration
    fault, conf, probs = classify_fault(58.0, 4.2, 8.5, 1.2, True)
    assert fault == "Bearing Vibration"
    assert conf >= 70.0


def test_fault_classifier_overspeed():
    # 2.45 m/s speed
    fault, conf, probs = classify_fault(45.0, 4.8, 3.2, 2.45, True)
    assert fault == "Overspeed"
    assert conf >= 70.0


def test_fault_classifier_door_hazard():
    # Door open while traveling at 1.2 m/s
    fault, conf, probs = classify_fault(42.0, 3.2, 1.8, 1.2, False)
    assert fault == "Door Interlock Fault"
    assert conf >= 80.0

