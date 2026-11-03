"""
Unit tests for sensor models, raw packet conversion, and validation.
"""

import pytest
from pydantic import ValidationError
import sys
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from models import SensorReading, RawESP32Packet
from sensor_processor import processor


def test_sensor_reading_valid():
    reading = SensorReading(
        temperature=42.5,
        current=3.2,
        vibration=1.8,
        speed=1.25,
        doorClosed=True,
        floor=4,
        direction="up"
    )
    assert reading.temperature == 42.5
    assert reading.current == 3.2
    assert reading.doorClosed is True


def test_sensor_reading_invalid_temperature():
    with pytest.raises(ValidationError):
        SensorReading(
            temperature=300.0,  # Exceeds max 160.0
            current=3.2,
            vibration=1.8,
            speed=1.25
        )


def test_sensor_reading_invalid_speed():
    with pytest.raises(ValidationError):
        SensorReading(
            temperature=40.0,
            current=3.2,
            vibration=1.8,
            speed=-5.0  # Cannot be negative
        )


def test_raw_esp32_packet_calibration():
    raw_packet = RawESP32Packet(
        device_id="ESP32_ELEVATOR_RIG_01",
        raw_adc_temperature=520,      # (520 * 0.05) + 18.0 = 44.0 °C
        raw_adc_current=395,          # 395 * 0.008 = 3.16 A
        raw_accel_vibration=94,       # 94 * 0.02 = 1.88 mm/s
        raw_pulse_counter_speed=820,  # (820 / 1000) * 1.5 = 1.23 m/s
        gpio_door_contact=0           # 0 -> door closed (True)
    )

    calibrated, packet = processor.calibrate_esp32_packet(raw_packet)
    assert calibrated.temperature == 44.0
    assert calibrated.current == 3.16
    assert calibrated.vibration == 1.88
    assert calibrated.speed == 1.23
    assert calibrated.doorClosed is True


def test_raw_esp32_packet_door_open():
    raw_packet = RawESP32Packet(
        device_id="ESP32_ELEVATOR_RIG_01",
        raw_adc_temperature=480,
        raw_adc_current=300,
        raw_accel_vibration=50,
        raw_pulse_counter_speed=0,
        gpio_door_contact=1           # 1 -> door open (False)
    )
    calibrated, _ = processor.calibrate_esp32_packet(raw_packet)
    assert calibrated.doorClosed is False


def test_invalid_esp32_packet_raises():
    with pytest.raises(ValidationError):
        RawESP32Packet(
            device_id="",  # Empty string rejected
            raw_adc_temperature=5000,  # Out of range 0-4095
            raw_adc_current=100,
            raw_accel_vibration=50,
            raw_pulse_counter_speed=0,
            gpio_door_contact=5  # Must be 0 or 1
        )

