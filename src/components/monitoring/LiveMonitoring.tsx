import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import {
  Play,
  Pause,
  Radio,
  RotateCcw,
  Thermometer,
  Zap,
  Activity,
  Gauge,
  DoorClosed,
  DoorOpen,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { useElevator } from '../../context/ElevatorContext';

export const LiveMonitoring: React.FC = () => {
  const {
    sensors,
    thresholds,
    telemetryHistory,
    isStreamingPaused,
    toggleStreamingPause,
    isSimulatingNoise,
    toggleSimulatingNoise
  } = useElevator();

  const [activeTab, setActiveTab] = useState<'grid' | 'temperature' | 'current' | 'vibration' | 'speed'>('grid');

  // Compute live statistics over the current buffer
  const getStats = (key: 'temperature' | 'current' | 'vibration' | 'speed') => {
    if (telemetryHistory.length === 0) return { min: 0, max: 0, avg: 0, current: 0 };
    const values = telemetryHistory.map(p => p[key]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return {
      min: +min.toFixed(2),
      max: +max.toFixed(2),
      avg: +avg.toFixed(2),
      current: +values[values.length - 1].toFixed(2)
    };
  };

  const tempStats = getStats('temperature');
  const currentStats = getStats('current');
  const vibStats = getStats('vibration');
  const speedStats = getStats('speed');

  return (
    <div className="space-y-6">
      {/* Live Monitoring Header & Control Strip */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Continuous Telemetry Waveforms
            </h2>
            <span className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{isStreamingPaused ? 'Buffer Paused' : '1.5s Sampling Rate'}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time buffer of last 30 readings with automated threshold reference lines
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Pause / Resume */}
          <button
            onClick={toggleStreamingPause}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
              isStreamingPaused
                ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isStreamingPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5 text-slate-500" />}
            <span>{isStreamingPaused ? 'Resume Charts' : 'Freeze Charts'}</span>
          </button>

          {/* Noise Toggle */}
          <button
            onClick={toggleSimulatingNoise}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
              isSimulatingNoise
                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-blue-600" />
            <span>Gaussian Noise: {isSimulatingNoise ? 'ON' : 'OFF'}</span>
          </button>

          {/* View Mode Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Sensors
            </button>
            <button
              onClick={() => setActiveTab('temperature')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'temperature' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Temp
            </button>
            <button
              onClick={() => setActiveTab('current')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'current' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Current
            </button>
            <button
              onClick={() => setActiveTab('vibration')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'vibration' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vibration
            </button>
            <button
              onClick={() => setActiveTab('speed')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'speed' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Speed
            </button>
          </div>
        </div>
      </div>

      {/* Door Status Real-Time Summary Ribbon */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
              sensors.doorClosed
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : sensors.speed > thresholds.doorHazardSpeedLimit
                ? 'bg-rose-50 text-rose-600 border-rose-300'
                : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}
          >
            {sensors.doorClosed ? <DoorClosed className="w-5 h-5" /> : <DoorOpen className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Door Interlock &amp; Gate Position Monitor
            </div>
            <div className="text-xs text-slate-500">
              State:{' '}
              <span className={`font-semibold ${sensors.doorClosed ? 'text-emerald-600' : 'text-amber-600'}`}>
                {sensors.doorClosed ? 'Fully Closed and Mechanical Gate Contact Verified' : 'Open at Hoistway Sill'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3 py-1 rounded bg-slate-50 border border-slate-200">
            <span className="text-slate-500">Motion Hazard Interlock: </span>
            <span
              className={`font-bold ${
                !sensors.doorClosed && sensors.speed > thresholds.doorHazardSpeedLimit
                  ? 'text-rose-600'
                  : 'text-emerald-600'
              }`}
            >
              {!sensors.doorClosed && sensors.speed > thresholds.doorHazardSpeedLimit ? 'TRIPPED (HAZARD)' : 'SECURE'}
            </span>
          </div>

          <div className="px-3 py-1 rounded bg-slate-50 border border-slate-200">
            <span className="text-slate-500">Max In-Transit Tolerance: </span>
            <span className="text-slate-800 font-semibold">{thresholds.doorHazardSpeedLimit.toFixed(2)} m/s</span>
          </div>
        </div>
      </div>

      {/* Graphs Layout */}
      {(activeTab === 'grid' || activeTab === 'temperature') && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Traction Motor Temperature (°C)
              </h3>
            </div>
            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-600">
              <span>Cur: <strong className="text-slate-900">{tempStats.current}°C</strong></span>
              <span>Min: {tempStats.min}°C</span>
              <span>Max: {tempStats.max}°C</span>
              <span>Avg: {tempStats.avg}°C</span>
              <span className="text-amber-600 font-semibold">Warn: {thresholds.temperatureWarning}°C</span>
              <span className="text-rose-600 font-semibold">Crit: {thresholds.temperatureCritical}°C</span>
            </div>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timeStr" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis domain={[20, 120]} tick={{ fontSize: 10 }} stroke="#94a3b8" unit="°C" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  formatter={(val?: any) => [typeof val === 'number' ? `${val.toFixed(1)} °C` : `${val}`, 'Temperature']}
                />
                {/* Warning threshold reference line */}
                <ReferenceLine
                  y={thresholds.temperatureWarning}
                  stroke="#d97706"
                  strokeDasharray="4 4"
                  label={{ value: `Warn (${thresholds.temperatureWarning}°C)`, fill: '#d97706', fontSize: 10, position: 'right' }}
                />
                {/* Critical threshold reference line */}
                <ReferenceLine
                  y={thresholds.temperatureCritical}
                  stroke="#dc2626"
                  strokeWidth={1.5}
                  label={{ value: `Crit (${thresholds.temperatureCritical}°C)`, fill: '#dc2626', fontSize: 10, position: 'right' }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#e11d48"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {(activeTab === 'grid' || activeTab === 'current') && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Motor Armature Current (A)
              </h3>
            </div>
            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-600">
              <span>Cur: <strong className="text-slate-900">{currentStats.current}A</strong></span>
              <span>Min: {currentStats.min}A</span>
              <span>Max: {currentStats.max}A</span>
              <span>Avg: {currentStats.avg}A</span>
              <span className="text-amber-600 font-semibold">Warn: {thresholds.currentWarning.toFixed(1)}A</span>
              <span className="text-rose-600 font-semibold">Crit: {thresholds.currentCritical.toFixed(1)}A</span>
            </div>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timeStr" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis domain={[0, 14]} tick={{ fontSize: 10 }} stroke="#94a3b8" unit="A" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  formatter={(val?: any) => [typeof val === 'number' ? `${val.toFixed(2)} A` : `${val}`, 'Current']}
                />
                <ReferenceLine
                  y={thresholds.currentWarning}
                  stroke="#d97706"
                  strokeDasharray="4 4"
                  label={{ value: `Warn (${thresholds.currentWarning}A)`, fill: '#d97706', fontSize: 10, position: 'right' }}
                />
                <ReferenceLine
                  y={thresholds.currentCritical}
                  stroke="#dc2626"
                  strokeWidth={1.5}
                  label={{ value: `Crit (${thresholds.currentCritical}A)`, fill: '#dc2626', fontSize: 10, position: 'right' }}
                />
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke="#d97706"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {(activeTab === 'grid' || activeTab === 'vibration') && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                3. Machine Bedplate &amp; Bearing Vibration (mm/s RMS)
              </h3>
            </div>
            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-600">
              <span>Cur: <strong className="text-slate-900">{vibStats.current} mm/s</strong></span>
              <span>Min: {vibStats.min}</span>
              <span>Max: {vibStats.max}</span>
              <span>Avg: {vibStats.avg}</span>
              <span className="text-amber-600 font-semibold">Warn: {thresholds.vibrationWarning.toFixed(1)} mm/s</span>
              <span className="text-rose-600 font-semibold">Crit: {thresholds.vibrationCritical.toFixed(1)} mm/s</span>
            </div>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timeStr" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis domain={[0, 14]} tick={{ fontSize: 10 }} stroke="#94a3b8" unit=" mm/s" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  formatter={(val?: any) => [typeof val === 'number' ? `${val.toFixed(2)} mm/s` : `${val}`, 'Vibration']}
                />
                <ReferenceLine
                  y={thresholds.vibrationWarning}
                  stroke="#d97706"
                  strokeDasharray="4 4"
                  label={{ value: `Warn (${thresholds.vibrationWarning} mm/s)`, fill: '#d97706', fontSize: 10, position: 'right' }}
                />
                <ReferenceLine
                  y={thresholds.vibrationCritical}
                  stroke="#dc2626"
                  strokeWidth={1.5}
                  label={{ value: `Crit (${thresholds.vibrationCritical} mm/s)`, fill: '#dc2626', fontSize: 10, position: 'right' }}
                />
                <Line
                  type="monotone"
                  dataKey="vibration"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {(activeTab === 'grid' || activeTab === 'speed') && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                4. Elevator Car Velocity &amp; Speed Profile (m/s)
              </h3>
            </div>
            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-600">
              <span>Cur: <strong className="text-slate-900">{speedStats.current} m/s</strong></span>
              <span>Min: {speedStats.min}</span>
              <span>Max: {speedStats.max}</span>
              <span>Nominal Max: {thresholds.speedMaxNormal.toFixed(2)} m/s</span>
              <span className="text-rose-600 font-semibold">Overspeed Trip: {thresholds.speedCritical.toFixed(2)} m/s</span>
            </div>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetryHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timeStr" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis domain={[0, 3.5]} tick={{ fontSize: 10 }} stroke="#94a3b8" unit=" m/s" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  formatter={(val?: any) => [typeof val === 'number' ? `${val.toFixed(2)} m/s` : `${val}`, 'Speed']}
                />
                <ReferenceLine
                  y={thresholds.speedMaxNormal}
                  stroke="#2563eb"
                  strokeDasharray="4 4"
                  label={{ value: `Nominal Max (${thresholds.speedMaxNormal} m/s)`, fill: '#2563eb', fontSize: 10, position: 'right' }}
                />
                <ReferenceLine
                  y={thresholds.speedCritical}
                  stroke="#dc2626"
                  strokeWidth={1.5}
                  label={{ value: `Overspeed (${thresholds.speedCritical} m/s)`, fill: '#dc2626', fontSize: 10, position: 'right' }}
                />
                <Line
                  type="monotone"
                  dataKey="speed"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
