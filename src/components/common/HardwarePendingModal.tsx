import React from 'react';
import {
  X,
  Cpu,
  Server,
  Radio,
  CheckCircle2,
  Clock,
  Layers,
  Code2,
  Sliders,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useElevator } from '../../context/ElevatorContext';

interface HardwarePendingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HardwarePendingModal: React.FC<HardwarePendingModalProps> = ({ isOpen, onClose }) => {
  const {
    setOperatingMode,
    connectionState,
    mockHardwareStatus,
    setMockHardwareStatus
  } = useElevator();

  if (!isOpen) return null;

  const isConnected = connectionState === 'hardware_connected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              isConnected
                ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-400'
                : 'bg-blue-500/20 border-blue-400/30 text-blue-400'
            }`}>
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Real Sensor Hardware Mode — Diagnostic Status</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                  isConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {isConnected ? 'Hardware Connected' : 'Disconnected'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Target Platform: ESP32 IoT Microcontroller + Python FastAPI Telemetry Daemon
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600">
          {/* Status Alert Banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed">
              <span className={`font-bold uppercase tracking-wide block ${
                isConnected ? 'text-emerald-950' : 'text-amber-950'
              }`}>
                {isConnected
                  ? 'Physical ESP32 Link Online & Streaming Valid Readings'
                  : 'Physical Hardware Interface Disconnected / Standby'}
              </span>
              {isConnected
                ? 'Valid telemetry packets are arriving from the ESP32 hardware bridge. Calibrated sensor values (PT100 RTD, LEM Current, Accelerometer, Encoder) are actively updating dashboard analytics.'
                : 'The frontend polls http://127.0.0.1:8000/api/v1/telemetry. When offline, simulated data is excluded to prevent false hardware readings, and the footer correctly indicates Disconnected.'}
            </div>
          </div>

          {/* Scenario Testing Controls (A, B, C, D) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-indigo-600" />
                <span>Telemetry Hardware Connection Test Controls</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                Mode: <strong className="text-slate-700">{mockHardwareStatus}</strong>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Verify the dynamic footer connection state under real or simulated hardware conditions:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setMockHardwareStatus('connected')}
                className={`px-3 py-2 rounded-lg text-[11px] font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                  mockHardwareStatus === 'connected'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulate ESP32 Connected (Scenario C)</span>
              </button>

              <button
                type="button"
                onClick={() => setMockHardwareStatus('disconnected')}
                className={`px-3 py-2 rounded-lg text-[11px] font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                  mockHardwareStatus === 'disconnected'
                    ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span>Simulate Disconnected / Lost (Scenario B/D)</span>
              </button>

              <button
                type="button"
                onClick={() => setMockHardwareStatus('auto')}
                className={`px-3 py-2 rounded-lg text-[11px] font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                  mockHardwareStatus === 'auto'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                <span>Auto Probe Backend (Default)</span>
              </button>
            </div>
          </div>

          {/* System Integration Pipeline Architecture */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Prepared 3-Tier Integration Architecture</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {/* Box 1: Edge Hardware */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-800 font-bold mb-1">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span>1. ESP32 Sensor Node</span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-500 list-disc list-inside">
                  <li>PT100 RTD (MAX31865 SPI)</li>
                  <li>LEM Current Sensor (ADC)</li>
                  <li>MPU6050 Vibration (I2C)</li>
                  <li>Rotary Encoder (Pulse Ctr)</li>
                  <li>Door Gate Microswitch (GPIO)</li>
                </ul>
              </div>

              {/* Box 2: Gateway */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-800 font-bold mb-1">
                  <Server className="w-4 h-4 text-indigo-600" />
                  <span>2. Python FastAPI Gateway</span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-500 list-disc list-inside">
                  <li>Serial UART / MQTT listener</li>
                  <li>Data validation &amp; calibration</li>
                  <li>WebSocket broadcast server</li>
                  <li>REST API: <code>/api/v1/telemetry</code></li>
                  <li>PostgreSQL audit logging</li>
                </ul>
              </div>

              {/* Box 3: Dashboard */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-800 font-bold mb-1">
                  <Code2 className="w-4 h-4 text-emerald-600" />
                  <span>3. React FDIR Assistant</span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-500 list-disc list-inside">
                  <li>Current web application</li>
                  <li>Rule-based fault isolation</li>
                  <li>Root cause diagnostic engine</li>
                  <li>Live Recharts time-series</li>
                  <li>Subsystem isolation protocols</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ESP32 Packet Contract Sample */}
          <div className="p-3.5 rounded-xl bg-slate-900 text-slate-300 font-mono text-[11px]">
            <div className="text-slate-400 mb-1 flex items-center justify-between">
              <span>ESP32 JSON TELEMETRY CONTRACT (src/services/apiService.ts):</span>
              <span className="text-emerald-400">STATUS: SCHEMA READY</span>
            </div>
            <pre className="text-slate-200 overflow-x-auto p-2 bg-slate-950 rounded">
{`{
  "device_id": "ESP32_ELEVATOR_RIG_01",
  "raw_adc_temperature": 520,      // PT100 Stator probe
  "raw_adc_current": 395,          // Motor current
  "raw_accel_vibration": 94,       // Piezo accelerometer
  "raw_pulse_counter_speed": 820,  // Rotary shaft encoder
  "gpio_door_contact": 0           // 0: Closed, 1: Open
}`}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              setOperatingMode('simulation');
              onClose();
            }}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Switch to Simulation Mode (Recommended)</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors"
          >
            Remain in Real Sensor Standby
          </button>
        </div>
      </div>
    </div>
  );
};
