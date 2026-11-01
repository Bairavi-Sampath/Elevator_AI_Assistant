/**
 * API Service Layer
 * Prepared architecture for future Python FastAPI backend and ESP32 IoT microcontroller integration.
 * In current prototype stage, operates seamlessly with simulated or simulated hardware streams.
 */

export interface ESP32TelemetryPacket {
  device_id: string;
  firmware_version: string;
  uptime_seconds: number;
  wifi_rssi_dbm: number;
  raw_adc_temperature: number; // PT100 signal via MAX31865 SPI
  raw_adc_current: number;     // LEM Current Transducer 0-5V ADC
  raw_accel_vibration: number; // MPU6050/ADXL345 I2C vibration magnitude
  raw_pulse_counter_speed: number; // Optical quadrature encoder pulses / sec
  gpio_door_contact: number;   // 0 = Closed/Circuit Intact, 1 = Open
  crc32: string;
}

export interface BackendConnectionStatus {
  endpoint: string;
  connected: boolean;
  lastPingMs: number | null;
  hardwareBridge: 'ESP32_RS485_MODBUS' | 'ESP32_MQTT_WIFI' | 'NONE';
  brokerStatus: 'standby' | 'connected' | 'disconnected';
  message: string;
}

export const API_SERVICE = {
  /**
   * Health check simulation for FastAPI backend
   */
  async checkBackendHealth(): Promise<BackendConnectionStatus> {
    // In prototype environment, returns ready schema and pending connection info
    return {
      endpoint: 'http://127.0.0.1:8000/api/v1/telemetry',
      connected: false,
      lastPingMs: null,
      hardwareBridge: 'ESP32_MQTT_WIFI',
      brokerStatus: 'standby',
      message: 'FastAPI Gateway configured. ESP32 UART/WiFi listener awaiting firmware hand-shake.'
    };
  },

  /**
   * Schema mapping for ESP32 payload conversion
   */
  parseESP32Packet(packet: ESP32TelemetryPacket) {
    // Translates raw microcontroller ADC & GPIO counts into calibrated physical units
    const calibratedTemp = (packet.raw_adc_temperature * 0.05) + 18.0;
    const calibratedCurrent = packet.raw_adc_current * 0.008;
    const calibratedVibration = packet.raw_accel_vibration * 0.02;
    const calibratedSpeed = (packet.raw_pulse_counter_speed / 1000) * 1.5;
    const doorClosed = packet.gpio_door_contact === 0;

    return {
      temperature: calibratedTemp,
      current: calibratedCurrent,
      vibration: calibratedVibration,
      speed: calibratedSpeed,
      doorClosed
    };
  }
};
