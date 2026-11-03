"""
ESP32 Hardware Bridge using PySerial.
Asynchronously reads JSON telemetry packets from connected USB/UART serial microcontrollers.
Handles disconnections gracefully and validates CRC / schema.
"""

import json
import threading
import time
from typing import Optional, Dict, Any, List
from models import RawESP32Packet

try:
    import serial
    import serial.tools.list_ports
    SERIAL_AVAILABLE = True
except ImportError:
    SERIAL_AVAILABLE = False


class ESP32SerialBridge:
    def __init__(self, port: Optional[str] = None, baud_rate: int = 115200, timeout: float = 1.0):
        self.configured_port = port
        self.baud_rate = baud_rate
        self.timeout = timeout
        self.serial_handle: Optional[Any] = None
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None
        self._lock = threading.Lock()

        # State
        self.connected = False
        self.last_packet: Optional[RawESP32Packet] = None
        self.last_packet_raw: Optional[Dict[str, Any]] = None
        self.last_packet_time: Optional[float] = None
        self.last_error: Optional[str] = "Hardware bridge awaiting device connection"
        self.packet_count = 0
        self._cached_ports: List[str] = []

    def list_available_ports(self) -> List[str]:
        if not SERIAL_AVAILABLE:
            return []
        try:
            ports = [p.device for p in serial.tools.list_ports.comports()]
            self._cached_ports = ports
            return ports
        except Exception:
            return []

    def start(self):
        """Starts background reader thread."""
        if self._thread and self._thread.is_alive():
            return
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._worker_loop, daemon=True, name="ESP32-Serial-Worker")
        self._thread.start()

    def stop(self):
        """Stops background reader thread."""
        self._stop_event.set()
        if self.serial_handle and hasattr(self.serial_handle, "is_open") and self.serial_handle.is_open:
            try:
                self.serial_handle.close()
            except Exception:
                pass
        self.connected = False
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=1.0)

    def _find_target_port(self) -> Optional[str]:
        if self.configured_port:
            return self.configured_port
        ports = self.list_available_ports()
        for p in ports:
            if "USB" in p.upper() or "UART" in p.upper() or "COM" in p.upper():
                return p
        return ports[0] if ports else None

    def _worker_loop(self):
        while not self._stop_event.is_set():
            if not SERIAL_AVAILABLE:
                with self._lock:
                    self.connected = False
                    self.last_error = "PySerial library is not available in environment."
                self._stop_event.wait(5.0)
                continue

            target_port = self._find_target_port()
            if not target_port:
                with self._lock:
                    self.connected = False
                    self.last_error = "No serial COM ports detected on host machine."
                self._stop_event.wait(3.0)
                continue

            try:
                self.serial_handle = serial.Serial(
                    port=target_port,
                    baudrate=self.baud_rate,
                    timeout=self.timeout
                )
                with self._lock:
                    self.connected = True
                    self.last_error = None
                print(f"[ESP32Serial] Connected to {target_port} at {self.baud_rate} baud.")

                while not self._stop_event.is_set() and self.serial_handle.is_open:
                    line = self.serial_handle.readline().decode("utf-8", errors="ignore").strip()
                    if not line:
                        continue

                    if line.startswith("{") and line.endswith("}"):
                        try:
                            payload = json.loads(line)
                            validated = RawESP32Packet(**payload)
                            with self._lock:
                                self.last_packet = validated
                                self.last_packet_raw = payload
                                self.last_packet_time = time.time()
                                self.packet_count += 1
                        except Exception as e:
                            with self._lock:
                                self.last_error = f"Malformed packet: {e}"

            except Exception as e:
                with self._lock:
                    self.connected = False
                    self.last_error = f"Serial port {target_port} error: {e}"
                if self.serial_handle:
                    try:
                        self.serial_handle.close()
                    except Exception:
                        pass
                self._stop_event.wait(3.0)

    def get_status(self) -> Dict[str, Any]:
        with self._lock:
            return {
                "connected": self.connected,
                "port": self.configured_port or "auto-detect",
                "baud_rate": self.baud_rate,
                "packet_count": self.packet_count,
                "last_packet_time": self.last_packet_time,
                "last_error": self.last_error,
                "available_ports": self._cached_ports
            }

    def get_latest_packet(self) -> Optional[RawESP32Packet]:
        with self._lock:
            if self.connected and self.last_packet_time and (time.time() - self.last_packet_time < 5.0):
                return self.last_packet
            return None


# Global singleton instance
serial_bridge = ESP32SerialBridge()
