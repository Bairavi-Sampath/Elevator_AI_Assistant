"""
Unit tests for SQLite database persistence.
"""

import sys
import time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import database.db as db


def test_db_init_and_save_reading():
    db.init_db()
    row_id = db.save_sensor_reading(
        temperature=45.2,
        current=3.4,
        vibration=1.9,
        speed=1.2,
        door_closed=True,
        floor=5,
        direction="up",
        source="test_unit"
    )
    assert row_id > 0

    latest = db.get_latest_reading()
    assert latest is not None
    assert latest["temperature"] == 45.2
    assert latest["floor"] == 5


def test_db_history():
    history = db.get_telemetry_history(limit=10)
    assert isinstance(history, list)
    assert len(history) > 0


def test_db_alerts_lifecycle():
    alert_id = f"TEST-ALT-{int(time.time()*1000)}"
    db.save_alert({
        "id": alert_id,
        "timestamp": time.time(),
        "faultCode": "E-MOT-01",
        "faultName": "Test Overheating Alert",
        "severity": "warning",
        "sensorName": "PT100 Stator RTD",
        "sensorValue": "65.0 °C",
        "description": "Test warning excursion",
        "acknowledged": False
    })

    alerts = db.get_alerts(limit=10)
    found = next((a for a in alerts if a["id"] == alert_id), None)
    assert found is not None
    assert found["acknowledged"] is False

    # Acknowledge
    ok = db.acknowledge_alert(alert_id)
    assert ok is True

    alerts_after = db.get_alerts(limit=10)
    found_after = next((a for a in alerts_after if a["id"] == alert_id), None)
    assert found_after["acknowledged"] is True

