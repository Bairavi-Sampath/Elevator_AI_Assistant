import React, { useState } from 'react';
import {
  Settings,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Thermometer,
  Zap,
  Activity,
  Gauge,
  Sliders
} from 'lucide-react';
import { useElevator, DEFAULT_THRESHOLDS } from '../../context/ElevatorContext';
import { SensorThresholds } from '../../types/elevator';

export const SettingsPage: React.FC = () => {
  const { thresholds, updateThresholds, resetThresholdsToDefaults } = useElevator();

  // Local draft state for threshold form
  const [formValues, setFormValues] = useState<SensorThresholds>(thresholds);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // System parameters (configurable metadata)
  const [systemParams, setSystemParams] = useState({
    ratedCapacityKg: 1600,
    totalFloors: 12,
    machineType: 'Permanent Magnet Synchronous Gearless PMSM',
    suspensionRatio: '2:1 Underslung',
    ambientMachineRoomLimitC: 35.0,
    ratedVelocityMs: 1.50
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateThresholds(formValues);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Reset all demonstration thresholds to original baseline values?')) {
      resetThresholdsToDefaults();
      setFormValues(DEFAULT_THRESHOLDS);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Educational Prototype Disclaimer Card */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <div className="font-bold text-blue-950 uppercase tracking-wide">
            Educational Prototype Specification Notice
          </div>
          <p className="mt-0.5 text-blue-800">
            This dashboard is an academic engineering prototype designed for demonstration of autonomous fault isolation (FDIR) algorithms and root cause inference. All thresholds are configurable test parameters and do not replace certified elevator safety controllers (EN 81-20/50 or ASME A17.1).
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Sensor Thresholds Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Sensor Demonstration Thresholds</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure warning and critical excursion triggers used by the rule-based detection engine.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors border border-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Defaults</span>
              </button>

              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {savedSuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <Save className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'Thresholds Saved!' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

          {/* Threshold Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
            {/* 1. Temperature Thresholds */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Motor Temperature (°C)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500">
                Monitored via PT100 RTD sensor embedded in the motor stator core.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-amber-800 block mb-1">
                    Warning Threshold (°C)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="40"
                    max="100"
                    value={formValues.temperatureWarning}
                    onChange={e => setFormValues({ ...formValues, temperatureWarning: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Baseline default: 60°C</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-rose-800 block mb-1">
                    Critical Threshold (°C)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="50"
                    max="120"
                    value={formValues.temperatureCritical}
                    onChange={e => setFormValues({ ...formValues, temperatureCritical: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Baseline default: 75°C</span>
                </div>
              </div>
            </div>

            {/* 2. Motor Current Thresholds */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Motor Armature Current (A)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500">
                Measured via LEM Hall Effect current transducer on the VFD output feeder.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-amber-800 block mb-1">
                    Warning Threshold (A)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="10.0"
                    value={formValues.currentWarning}
                    onChange={e => setFormValues({ ...formValues, currentWarning: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Baseline default: 5.0 A</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-rose-800 block mb-1">
                    Critical Threshold (A)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="2.0"
                    max="15.0"
                    value={formValues.currentCritical}
                    onChange={e => setFormValues({ ...formValues, currentCritical: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Baseline default: 7.0 A</span>
                </div>
              </div>
            </div>

            {/* 3. Vibration Thresholds */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Machine Vibration Velocity (mm/s)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500">
                Peak RMS vibration measured at machine bedplate &amp; bearing housings.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-amber-800 block mb-1">
                    Warning Threshold (mm/s)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="10.0"
                    value={formValues.vibrationWarning}
                    onChange={e => setFormValues({ ...formValues, vibrationWarning: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Baseline default: 4.0 mm/s</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-rose-800 block mb-1">
                    Critical Threshold (mm/s)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="2.0"
                    max="15.0"
                    value={formValues.vibrationCritical}
                    onChange={e => setFormValues({ ...formValues, vibrationCritical: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Baseline default: 7.0 mm/s</span>
                </div>
              </div>
            </div>

            {/* 4. Speed & Door Hazard Thresholds */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Car Velocity &amp; Door Safety (m/s)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500">
                Derived from optical quadrature rotary encoder &amp; door limit contact switches.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-800 block mb-1">
                    Nominal Max Speed (m/s)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="3.0"
                    value={formValues.speedMaxNormal}
                    onChange={e => setFormValues({ ...formValues, speedMaxNormal: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Baseline default: 1.75 m/s</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-rose-800 block mb-1">
                    Overspeed Trip Limit (m/s)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="1.0"
                    max="4.0"
                    value={formValues.speedCritical}
                    onChange={e => setFormValues({ ...formValues, speedCritical: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Baseline default: 2.20 m/s</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Operating Range & Hardware Parameters */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Elevator System Specifications &amp; Structural Range</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Physical parameters of the monitored elevator car installation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-medium text-slate-600 block mb-1">Rated Passenger Load Capacity (kg)</label>
              <input
                type="number"
                value={systemParams.ratedCapacityKg}
                onChange={e => setSystemParams({ ...systemParams, ratedCapacityKg: parseInt(e.target.value) || 1600 })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Number of Hoistway Landings</label>
              <input
                type="number"
                value={systemParams.totalFloors}
                onChange={e => setSystemParams({ ...systemParams, totalFloors: parseInt(e.target.value) || 12 })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Nominal Contract Speed (m/s)</label>
              <input
                type="number"
                step="0.1"
                value={systemParams.ratedVelocityMs}
                onChange={e => setSystemParams({ ...systemParams, ratedVelocityMs: parseFloat(e.target.value) || 1.5 })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-medium text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-medium text-slate-600 block mb-1">Traction Drive Motor Classification</label>
              <input
                type="text"
                value={systemParams.machineType}
                onChange={e => setSystemParams({ ...systemParams, machineType: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="font-medium text-slate-600 block mb-1">Machine Room Ambient Temperature Limit (°C)</label>
              <input
                type="number"
                value={systemParams.ambientMachineRoomLimitC}
                onChange={e => setSystemParams({ ...systemParams, ambientMachineRoomLimitC: parseFloat(e.target.value) || 35 })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-medium text-slate-900"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
