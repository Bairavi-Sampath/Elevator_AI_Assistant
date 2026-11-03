"""
Integration tests for FastAPI REST Endpoints and WebSocket.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "hardware_bridge" in data


def test_telemetry_compatibility_endpoint():
    res = client.get("/api/v1/telemetry")
    assert res.status_code == 200
    data = res.json()
    assert "packet" in data
    assert "telemetry" in data
    assert "connected" in data
    assert "status" in data


def test_telemetry_latest_endpoint():
    res = client.get("/api/v1/telemetry/latest")
    assert res.status_code == 200
    data = res.json()
    assert "telemetry" in data
    assert "anomaly" in data
    assert "fault_prediction" in data


def test_telemetry_history_endpoint():
    res = client.get("/api/v1/telemetry/history?limit=10")
    assert res.status_code == 200
    data = res.json()
    assert "history" in data
    assert "count" in data


def test_telemetry_post_calibrated():
    payload = {
        "temperature": 55.0,
        "current": 4.1,
        "vibration": 2.2,
        "speed": 1.25,
        "doorClosed": True,
        "floor": 6,
        "direction": "up"
    }
    res = client.post("/api/v1/telemetry", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["telemetry"]["temperature"] == 55.0
    assert data["source"] == "api_post"


def test_telemetry_post_raw_packet():
    payload = {
        "packet": {
            "device_id": "ESP32_ELEVATOR_RIG_01",
            "raw_adc_temperature": 520,
            "raw_adc_current": 395,
            "raw_accel_vibration": 94,
            "raw_pulse_counter_speed": 820,
            "gpio_door_contact": 0
        }
    }
    res = client.post("/api/v1/telemetry", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["source"] == "esp32_hardware"
    assert data["telemetry"]["temperature"] == 44.0


def test_telemetry_post_invalid_payload():
    payload = {
        "temperature": 500.0  # Invalid > 160°C
    }
    res = client.post("/api/v1/telemetry", json=payload)
    assert res.status_code == 400


def test_alerts_endpoint():
    res = client.get("/api/v1/alerts")
    assert res.status_code == 200
    data = res.json()
    assert "alerts" in data


def test_diagnosis_endpoint():
    res = client.get("/api/v1/diagnosis")
    assert res.status_code == 200
    data = res.json()
    assert "anomaly_detection" in data
    assert "fault_classification" in data
    assert "root_cause_analysis" in data


def test_thresholds_endpoints():
    get_res = client.get("/api/v1/thresholds")
    assert get_res.status_code == 200
    orig = get_res.json()
    assert "temperatureWarning" in orig

    # Update
    orig["temperatureWarning"] = 62.0
    post_res = client.post("/api/v1/thresholds", json=orig)
    assert post_res.status_code == 200
    assert post_res.json()["temperatureWarning"] == 62.0


def test_scenario_endpoint():
    res = client.post("/api/v1/simulation/scenario", json={"scenario": "critical_thermal"})
    assert res.status_code == 200
    data = res.json()
    assert data["scenario"] == "critical_thermal"
    assert data["system_status"] in ["warning", "critical"]


def test_hardware_status_endpoint():
    res = client.get("/api/v1/hardware/status")
    assert res.status_code == 200
    data = res.json()
    assert "connected" in data
    assert "available_ports" in data


def test_websocket_telemetry():
    with client.websocket_connect("/ws/telemetry") as websocket:
        initial = websocket.receive_json()
        assert initial["type"] == "initial_state"
        assert "data" in initial

        # Send ping
        websocket.send_text("ping")
        pong = websocket.receive_text()
        assert pong == "pong"

