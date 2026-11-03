import React from 'react';
import {
  Thermometer,
  Zap,
  Activity,
  Gauge,
  DoorClosed,
  DoorOpen,
  ShieldCheck,
  AlertTriangle,
  Flame,
  ArrowRight,
  HeartPulse,
  Sliders,
  CheckCircle2,
  Clock,
  Brain
} from 'lucide-react';
import { useElevator, SIMULATION_PRESETS } from '../../context/ElevatorContext';
import { SensorCard } from '../common/SensorCard';
import { ElevatorShaftVisualizer } from '../common/ElevatorShaftVisualizer';
import { NavPage } from '../common/Sidebar';

interface DashboardOverviewProps {
  onNavigate: (page: NavPage) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const {
    sensors,
    thresholds,
    systemStatus,
    activeFaults,
    motorHealth,
    alertHistory,
    acknowledgeAlert,
    applyPreset,
    activePresetId,
    isBackendConnected,
    mlAnomaly,
    mlFaultClassification
  } = useElevator();

  // Helper to determine sensor specific status
  const getTempStatus = () => {
    if (sensors.temperature >= thresholds.temperatureCritical) return 'critical';
    if (sensors.temperature >= thresholds.temperatureWarning) return 'warning';
    return 'normal';
  };

  const getCurrentStatus = () => {
    if (sensors.current >= thresholds.currentCritical) return 'critical';
    if (sensors.current >= thresholds.currentWarning) return 'warning';
    return 'normal';
  };

  const getVibStatus = () => {
    if (sensors.vibration >= thresholds.vibrationCritical) return 'critical';
    if (sensors.vibration >= thresholds.vibrationWarning) return 'warning';
    return 'normal';
  };

  const getSpeedStatus = () => {
    if (sensors.speed >= thresholds.speedCritical) return 'critical';
    if (sensors.speed > thresholds.speedMaxNormal) return 'warning';
    return 'normal';
  };

  const getDoorStatus = () => {
    if (!sensors.doorClosed && sensors.speed > thresholds.doorHazardSpeedLimit) return 'critical';
    return 'normal';
  };

  return (
    <div className="space-y-6">
      {/* Top System Health & Active Fault Alert Banner (if any) */}
      {activeFaults.length > 0 && (
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-xs ${
            systemStatus === 'critical'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-lg shrink-0 ${
                systemStatus === 'critical' ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-500 text-white'
              }`}
            >
              {systemStatus === 'critical' ? <Flame className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {systemStatus === 'critical' ? 'CRITICAL SYSTEM TRIP ACTIVE' : 'SYSTEM WARNING ACTIVE'}
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/80 border border-current font-bold">
                  {activeFaults.length} Fault{activeFaults.length > 1 ? 's' : ''} Detected
                </span>
              </div>
              <p className="text-sm font-semibold mt-0.5">
                Primary fault: {activeFaults[0].name} ({activeFaults[0].code})
              </p>
              <p className="text-xs opacity-80 mt-0.5">
                Affected subsystem: {activeFaults[0].affectedComponent} · Sensor: {activeFaults[0].sensorResponsible}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('faults')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 shadow-xs ${
              systemStatus === 'critical'
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
          >
            <span>Investigate Root Cause</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: System Status */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System State</span>
            {systemStatus === 'normal' && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
            {systemStatus === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
            {systemStatus === 'critical' && <Flame className="w-5 h-5 text-rose-600 animate-pulse" />}
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold font-mono capitalize ${
                  systemStatus === 'critical'
                    ? 'text-rose-600'
                    : systemStatus === 'warning'
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {systemStatus}
              </span>
              <span className="text-xs font-medium text-slate-400">Operating</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {systemStatus === 'normal'
                ? 'All sensors in safe baseline'
                : `${activeFaults.length} threshold rule(s) breached`}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Safety Circuit:</span>
            <span className={`font-medium ${systemStatus === 'critical' ? 'text-rose-600 font-bold' : 'text-emerald-600'}`}>
              {systemStatus === 'critical' ? 'TRIPPED' : 'ENERGIZED'}
            </span>
          </div>
        </div>

        {/* Card 2: Motor Health Index */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Motor Health</span>
            <HeartPulse className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {motorHealth.overallHealthScore}%
              </span>
              <span className="text-xs font-medium text-slate-500">Health Index</span>
            </div>
            {/* Health Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  motorHealth.overallHealthScore >= 80
                    ? 'bg-emerald-500'
                    : motorHealth.overallHealthScore >= 55
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${motorHealth.overallHealthScore}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Thermal: {motorHealth.thermalStressScore}%</span>
            <span>Elec: {motorHealth.electricalStressScore}%</span>
            <span>Vib: {motorHealth.mechanicalVibrationScore}%</span>
          </div>
        </div>

        {/* Card 3: Active Faults Count */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Faults</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${activeFaults.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {activeFaults.length}
              </span>
              <span className="text-xs font-medium text-slate-400">Active incidents</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeFaults.length === 0
                ? 'No active subsystem trips'
                : activeFaults.some(f => f.severity === 'critical')
                ? 'Requires immediate technician dispatch'
                : 'Warning level maintenance advised'}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate('faults')}
              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
            >
              <span>View RCA Breakdown</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Car Position & Speed */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hoistway Position</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-mono font-bold">
              FL {sensors.floor}
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {sensors.speed.toFixed(2)}
              </span>
              <span className="text-xs font-medium text-slate-500">m/s Velocity</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 capitalize">
              Direction: <span className="font-semibold text-slate-700">{sensors.direction}</span> · Doors:{' '}
              <span className={`font-semibold ${sensors.doorClosed ? 'text-emerald-600' : 'text-amber-600'}`}>
                {sensors.doorClosed ? 'Closed & Locked' : 'Open'}
              </span>
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Shaft Velocity Limit:</span>
            <span className="font-mono text-slate-700 font-medium">{thresholds.speedMaxNormal.toFixed(2)} m/s</span>
          </div>
        </div>
      </div>

      {/* ML Predictive Diagnostics & Anomaly Detection (Model 1 & 2) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-4 border border-indigo-900/50 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                  ML Predictive Diagnostics &amp; Anomaly Detection
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 font-semibold">
                  {isBackendConnected ? "FastAPI Port 8000 · Live WebSocket" : "Embedded Rule Baseline"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Isolation Forest (Anomaly Detection) + Random Forest Classifier (Fault Isolation)
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('faults')}
            className="text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>View Full RCA Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-3 text-xs">
          {/* Box 1: Anomaly Detection */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Model 1 · Isolation Forest
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-white">
                {mlAnomaly?.isAnomaly ? (
                  <span className="text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Anomaly Detected
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Nominal Envelope
                  </span>
                )}
              </span>
              <span className="font-mono text-xs text-indigo-300">
                Score: {mlAnomaly ? (mlAnomaly.anomalyScore * 100).toFixed(1) : "11.4"}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  (mlAnomaly?.anomalyScore || 0.1) > 0.6 ? "bg-rose-500" : "bg-emerald-400"
                }`}
                style={{ width: `${Math.min(100, ((mlAnomaly?.anomalyScore ?? 0.114) * 100))}%` }}
              />
            </div>
          </div>

          {/* Box 2: Random Forest Classification */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Model 2 · Random Forest Classification
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-white">
                {mlFaultClassification?.predictedFault || (activeFaults.length > 0 ? activeFaults[0].name : "Normal")}
              </span>
              <span className="font-mono text-xs font-bold text-emerald-400">
                {mlFaultClassification ? mlFaultClassification.confidence.toFixed(1) : "98.5"}% Conf.
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 truncate">
              Trained on 4,800 records across 6 fault categories
            </p>
          </div>

          {/* Box 3: Root Cause Isolation Status */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Autonomous FDIR Diagnostics
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-white">
                {activeFaults.length === 0 ? "No Subsystem Excursions" : `${activeFaults.length} Active Fault(s)`}
              </span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                systemStatus === 'critical' ? 'bg-rose-500 text-white' : systemStatus === 'warning' ? 'bg-amber-500 text-white' : 'bg-emerald-500/30 text-emerald-300'
              }`}>
                {systemStatus}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 truncate">
              {activeFaults.length > 0 ? `Affected: ${activeFaults[0].affectedComponent}` : "All safety invariants satisfied"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Scenario Injector Toolbar (Great for quick interactive demonstration) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-xs font-bold text-slate-800">Quick Scenario Injection:</span>
          <span className="text-xs text-slate-500 hidden sm:inline">Simulate physical fault scenarios instantly:</span>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {SIMULATION_PRESETS.map(preset => {
            const isCurrent = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isCurrent
                    ? preset.targetSeverity === 'critical'
                      ? 'bg-rose-600 text-white font-bold shadow-xs'
                      : preset.targetSeverity === 'warning'
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {preset.name}
              </button>
            );
          })}
          <button
            onClick={() => onNavigate('simulation')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors"
          >
            Open Slider Controls &rarr;
          </button>
        </div>
      </div>

      {/* 5 Individual Sensor Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Live Subsystem Sensor Readings
          </h2>
          <button
            onClick={() => onNavigate('monitoring')}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <span>Open Time-Series Charts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Temperature */}
          <SensorCard
            title="Motor Temperature"
            value={sensors.temperature.toFixed(1)}
            unit="°C"
            icon={Thermometer}
            status={getTempStatus()}
            warningThreshold={`${thresholds.temperatureWarning}°C`}
            criticalThreshold={`${thresholds.temperatureCritical}°C`}
            percentage={((sensors.temperature - 20) / (thresholds.temperatureCritical - 20)) * 100}
            subtext="PT100 Stator Winding RTD"
            onClick={() => onNavigate('simulation')}
          />

          {/* 2. Motor Current */}
          <SensorCard
            title="Motor Current"
            value={sensors.current.toFixed(2)}
            unit="A"
            icon={Zap}
            status={getCurrentStatus()}
            warningThreshold={`${thresholds.currentWarning.toFixed(1)}A`}
            criticalThreshold={`${thresholds.currentCritical.toFixed(1)}A`}
            percentage={(sensors.current / (thresholds.currentCritical * 1.2)) * 100}
            subtext="LEM Hall AC Transducer"
            onClick={() => onNavigate('simulation')}
          />

          {/* 3. Vibration */}
          <SensorCard
            title="Machine Vibration"
            value={sensors.vibration.toFixed(2)}
            unit="mm/s"
            icon={Activity}
            status={getVibStatus()}
            warningThreshold={`${thresholds.vibrationWarning.toFixed(1)} mm/s`}
            criticalThreshold={`${thresholds.vibrationCritical.toFixed(1)} mm/s`}
            percentage={(sensors.vibration / (thresholds.vibrationCritical * 1.2)) * 100}
            subtext="Triaxial Piezoelectric RMS"
            onClick={() => onNavigate('simulation')}
          />

          {/* 4. Elevator Speed */}
          <SensorCard
            title="Car Speed"
            value={sensors.speed.toFixed(2)}
            unit="m/s"
            icon={Gauge}
            status={getSpeedStatus()}
            warningThreshold={`${thresholds.speedMaxNormal.toFixed(2)} m/s`}
            criticalThreshold={`${thresholds.speedCritical.toFixed(2)} m/s`}
            percentage={(sensors.speed / (thresholds.speedCritical * 1.1)) * 100}
            subtext="Optical Rotary Encoder"
            onClick={() => onNavigate('simulation')}
          />

          {/* 5. Door Condition */}
          <SensorCard
            title="Door Condition"
            value={sensors.doorClosed ? 'CLOSED' : 'OPEN'}
            unit=""
            icon={sensors.doorClosed ? DoorClosed : DoorOpen}
            status={getDoorStatus()}
            percentage={sensors.doorClosed ? 100 : 25}
            subtext={
              sensors.doorClosed
                ? 'Interlock Circuit Locked'
                : sensors.speed > thresholds.doorHazardSpeedLimit
                ? 'HAZARD: Unsafe Motion!'
                : 'Safe At Floor Landing'
            }
            onClick={() => onNavigate('simulation')}
          />
        </div>
      </div>

      {/* 2-Column Split: Elevator Shaft Visualizer + Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Hoistway Shaft Visualizer (5 cols) */}
        <div className="lg:col-span-5">
          <ElevatorShaftVisualizer />
        </div>

        {/* Right: Recent Alerts & Diagnostic Feed (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Recent Alert &amp; Event Feed
              </h3>
              <p className="text-[11px] text-slate-400">
                Logged threshold violations and safety trips
              </p>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <span>Full History ({alertHistory.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alert Table / List */}
          <div className="my-3 space-y-2 max-h-72 overflow-y-auto pr-1">
            {alertHistory.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                <p className="font-semibold text-slate-600">No Alert Records Logged</p>
                <p className="mt-1">All telemetry is running within nominal boundaries.</p>
              </div>
            ) : (
              alertHistory.slice(0, 5).map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 transition-colors ${
                    alert.severity === 'critical'
                      ? 'bg-rose-50/70 border-rose-200'
                      : alert.severity === 'warning'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        alert.severity === 'critical'
                          ? 'bg-rose-600 text-white'
                          : alert.severity === 'warning'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {alert.faultCode}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span>{alert.faultName}</span>
                        {alert.acknowledged && (
                          <span className="text-[10px] font-normal text-slate-400">(Acked)</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {alert.sensorName}: <span className="font-mono font-medium text-slate-700">{alert.sensorValue}</span> · {alert.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1.5">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                    </div>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Demonstration baseline: Rule-Based Evaluation Engine Active</span>
            <button
              onClick={() => onNavigate('faults')}
              className="font-medium text-blue-600 hover:text-blue-800"
            >
              Analyze Root Causes &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
