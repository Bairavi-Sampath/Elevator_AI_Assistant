"""
Unit tests for Root Cause Analysis (RCA) Engine.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from rca.root_cause_engine import perform_rca, calculate_motor_health
from models import SensorThresholds


def test_rca_nominal():
    thresholds = SensorThresholds()
    faults = perform_rca(42.0, 3.2, 1.8, 1.25, True, thresholds)
    assert len(faults) == 0

    health = calculate_motor_health(42.0, 3.2, 1.8, thresholds, "normal")
    assert health.overallHealthScore >= 60
    assert health.status == "normal"


def test_rca_door_hazard():
    thresholds = SensorThresholds()
    # Door open while moving at 1.2 m/s
    faults = perform_rca(42.0, 3.2, 1.8, 1.2, False, thresholds)
    assert len(faults) >= 1
    primary = faults[0]
    assert primary.code == "E-SEC-01"
    assert primary.severity == "critical"
    assert primary.affectedComponent == "Car Door Interlock Switch & Safety Circuit"
    assert len(primary.possibleRootCauses) >= 3
    assert len(primary.recommendedActions) >= 3


def test_rca_overspeed_trip():
    thresholds = SensorThresholds()
    # Speed 2.45 m/s (critical > 2.20)
    faults = perform_rca(45.0, 3.5, 2.0, 2.45, True, thresholds)
    assert any(f.code == "E-DRV-03" and f.severity == "critical" for f in faults)


def test_rca_compound_bearing_overheating():
    thresholds = SensorThresholds()
    # High vibration (8.2 mm/s) + High temperature (77°C)
    faults = perform_rca(77.0, 4.5, 8.2, 1.0, True, thresholds)
    codes = [f.code for f in faults]
    assert "E-SYS-02" in codes  # Compound Bearing Frictional Overheating
    compound = next(f for f in faults if f.code == "E-SYS-02")
    assert compound.severity == "critical"
    assert compound.componentCategory == "bearing_gearbox"
    assert any("bearing seizure" in c.lower() for c in compound.possibleRootCauses)
