import React from 'react';
import {
  Thermometer,
  Zap,
  Activity,
  Gauge,
  DoorClosed,
  DoorOpen,
  RotateCcw,
  Sliders,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useElevator, SIMULATION_PRESETS } from '../../context/ElevatorContext';
import { NavPage } from '../common/Sidebar';

interface SensorSimulationProps {
  onNavigate: (page: NavPage) => void;
}

export const SensorSimulation: React.FC<SensorSimulationProps> = ({ onNavigate }) => {
  const {
    sensors,
    thresholds,
    updateSensors,
    applyPreset,
    resetToNominal,
    activePresetId,
    systemStatus,
    activeFaults,
    motorHealth
  } = useElevator();

  return (
    <div className="space-y-6">
      {/* Simulation Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Interactive Sensor Telemetry Simulation Bench</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Perturb sensor values in real time to evaluate autonomous fault isolation &amp; root cause analysis algorithms.
          </p>
        </div>

        <button
          onClick={resetToNominal}
          className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors border border-slate-200"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset All to Nominal Baseline</span>
        </button>
      </div>

      {/* Preset Scenarios Strip */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Demonstration Scenarios &amp; Injections
            </span>
            <span className="text-xs text-slate-400">· Click any preset to load test parameters</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SIMULATION_PRESETS.map(preset => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? preset.targetSeverity === 'critical'
                      ? 'border-rose-400 bg-rose-50/70 ring-1 ring-rose-300'
                      : preset.targetSeverity === 'warning'
                      ? 'border-amber-400 bg-amber-50/70 ring-1 ring-amber-300'
                      : 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-300'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900">{preset.name}</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      preset.targetSeverity === 'critical'
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : preset.targetSeverity === 'warning'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {preset.targetSeverity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{preset.values.temperature}°C</span>
                  <span>{preset.values.current}A</span>
                  <span>{preset.values.vibration} mm/s</span>
                  <span>{preset.values.speed} m/s</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Sliders on Left (7 cols), Live Diagnostic Preview on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sliders Container */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Real-Time Sensor Inputs
            </h3>
            <span className="text-[11px] text-slate-400">Sliders update state instantaneously</span>
          </div>

          {/* 1. Temperature Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-rose-500" />
                <label className="text-xs font-semibold text-slate-800">
                  Traction Motor Temperature (°C)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
                  {sensors.temperature.toFixed(1)} °C
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    sensors.temperature >= thresholds.temperatureCritical
                      ? 'bg-rose-100 text-rose-700'
                      : sensors.temperature >= thresholds.temperatureWarning
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {sensors.temperature >= thresholds.temperatureCritical
                    ? 'Critical'
                    : sensors.temperature >= thresholds.temperatureWarning
                    ? 'Warning'
                    : 'Normal'}
                </span>
              </div>
            </div>

            <input
              type="range"
              min="20"
              max="110"
              step="0.5"
              value={sensors.temperature}
              onChange={e => updateSensors({ temperature: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>20°C (Cold)</span>
              <span className="text-amber-600">Warn: &ge; {thresholds.temperatureWarning}°C</span>
              <span className="text-rose-600">Crit: &ge; {thresholds.temperatureCritical}°C</span>
              <span>110°C (Max)</span>
            </div>
          </div>

          {/* 2. Motor Current Slider */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <label className="text-xs font-semibold text-slate-800">
                  Motor Armature Current (A)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
                  {sensors.current.toFixed(2)} A
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    sensors.current >= thresholds.currentCritical
                      ? 'bg-rose-100 text-rose-700'
                      : sensors.current >= thresholds.currentWarning
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {sensors.current >= thresholds.currentCritical
                    ? 'Critical'
                    : sensors.current >= thresholds.currentWarning
                    ? 'Warning'
                    : 'Normal'}
                </span>
              </div>
            </div>

            <input
              type="range"
              min="0.0"
              max="12.0"
              step="0.1"
              value={sensors.current}
              onChange={e => updateSensors({ current: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>0.0 A (Idle)</span>
              <span className="text-amber-600">Warn: &ge; {thresholds.currentWarning.toFixed(1)} A</span>
              <span className="text-rose-600">Crit: &ge; {thresholds.currentCritical.toFixed(1)} A</span>
              <span>12.0 A (Max)</span>
            </div>
          </div>

          {/* 3. Vibration Slider */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                <label className="text-xs font-semibold text-slate-800">
                  Mechanical Vibration Velocity (mm/s RMS)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
                  {sensors.vibration.toFixed(2)} mm/s
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    sensors.vibration >= thresholds.vibrationCritical
                      ? 'bg-rose-100 text-rose-700'
                      : sensors.vibration >= thresholds.vibrationWarning
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {sensors.vibration >= thresholds.vibrationCritical
                    ? 'Critical'
                    : sensors.vibration >= thresholds.vibrationWarning
                    ? 'Warning'
                    : 'Normal'}
                </span>
              </div>
            </div>

            <input
              type="range"
              min="0.0"
              max="12.0"
              step="0.1"
              value={sensors.vibration}
              onChange={e => updateSensors({ vibration: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>0.0 mm/s (Smooth)</span>
              <span className="text-amber-600">Warn: &ge; {thresholds.vibrationWarning.toFixed(1)} mm/s</span>
              <span className="text-rose-600">Crit: &ge; {thresholds.vibrationCritical.toFixed(1)} mm/s</span>
              <span>12.0 mm/s (Severe)</span>
            </div>
          </div>

          {/* 4. Elevator Speed Slider */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-500" />
                <label className="text-xs font-semibold text-slate-800">
                  Elevator Car Speed (m/s)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
                  {sensors.speed.toFixed(2)} m/s
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    sensors.speed >= thresholds.speedCritical
                      ? 'bg-rose-100 text-rose-700'
                      : sensors.speed > thresholds.speedMaxNormal
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {sensors.speed >= thresholds.speedCritical
                    ? 'Overspeed'
                    : sensors.speed > thresholds.speedMaxNormal
                    ? 'Warning'
                    : 'Normal'}
                </span>
              </div>
            </div>

            <input
              type="range"
              min="0.0"
              max="3.0"
              step="0.05"
              value={sensors.speed}
              onChange={e => updateSensors({ speed: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>0.0 m/s (Stationary)</span>
              <span className="text-blue-600">Max Normal: {thresholds.speedMaxNormal.toFixed(2)} m/s</span>
              <span className="text-rose-600">Overspeed Trip: &ge; {thresholds.speedCritical.toFixed(2)} m/s</span>
              <span>3.0 m/s (Max)</span>
            </div>
          </div>

          {/* 5. Door Open / Closed Toggle Switch */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                  sensors.doorClosed
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}
              >
                {sensors.doorClosed ? <DoorClosed className="w-5 h-5" /> : <DoorOpen className="w-5 h-5" />}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-800">
                  Hoistway Door Position &amp; Interlock Gate
                </label>
                <p className="text-[11px] text-slate-500">
                  Simulate door status: {sensors.doorClosed ? 'Closed & Locked' : 'Doors Open'}
                </p>
              </div>
            </div>

            <button
              onClick={() => updateSensors({ doorClosed: !sensors.doorClosed })}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-2 ${
                sensors.doorClosed
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-amber-500 text-white hover:bg-amber-600 ring-2 ring-amber-300'
              }`}
            >
              {sensors.doorClosed ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>DOORS CLOSED</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 animate-bounce" />
                  <span>DOORS OPEN</span>
                </>
              )}
            </button>
          </div>

          {/* Hint box */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Rule Testing Tip:</strong> Set Speed &gt; 0.5 m/s and toggle the Door to "OPEN" to trigger the safety interlock bypass fault (E-SEC-01). Increase temperature &gt; 75°C to observe motor thermal trip (E-MOT-02).
            </div>
          </div>
        </div>

        {/* Live Diagnostic Preview Box (Right Column) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Autonomous FDIR Engine Output
            </h3>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${
                systemStatus === 'critical'
                  ? 'bg-rose-100 text-rose-800'
                  : systemStatus === 'warning'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {systemStatus}
            </span>
          </div>

          {/* Motor Health Score Gauge */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-700">Calculated Motor Health Index</div>
              <div className="text-[11px] text-slate-500">Based on Thermal + Electrical + Vib stress</div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {motorHealth.overallHealthScore}%
              </span>
            </div>
          </div>

          {/* Live Faults Detected */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Active Fault Tripped:</span>
              <span className="font-mono text-xs">{activeFaults.length} Fault(s)</span>
            </div>

            {activeFaults.length === 0 ? (
              <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-semibold">Normal Baseline Condition:</span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    No active threshold breaches. All simulated sensor signals conform to safety baseline.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {activeFaults.map(fault => (
                  <div
                    key={fault.id}
                    className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                      fault.severity === 'critical'
                        ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                        : 'bg-amber-50/80 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {fault.severity === 'critical' ? (
                          <Flame className="w-4 h-4 text-rose-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        )}
                        <span className="font-bold">{fault.name}</span>
                      </div>
                      <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-white/80 border border-current">
                        {fault.code}
                      </span>
                    </div>

                    <div className="text-[11px] opacity-90">
                      <strong>Component:</strong> {fault.affectedComponent}
                    </div>

                    <div className="text-[11px] opacity-90">
                      <strong>Sensor Trigger:</strong> {fault.sensorResponsible} ({fault.triggerValue})
                    </div>

                    {/* Preview first possible cause */}
                    <div className="pt-1.5 border-t border-current/10 text-[11px] italic">
                      <span className="font-semibold not-italic">Possible Cause: </span>
                      {fault.possibleRootCauses[0]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action button to RCA page */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigate('monitoring')}
              className="text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              &larr; View Live Charts
            </button>
            <button
              onClick={() => onNavigate('faults')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Detailed Root Cause Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
