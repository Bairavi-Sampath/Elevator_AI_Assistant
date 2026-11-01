import React from 'react';
import {
  RotateCcw,
  Play,
  Pause,
  Radio,
  Sliders,
  AlertTriangle,
  Flame,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { useElevator } from '../../context/ElevatorContext';
import { NavPage } from './Sidebar';

interface HeaderProps {
  currentPage: NavPage;
  onSelectPage: (page: NavPage) => void;
  onOpenHardwareModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onSelectPage,
  onOpenHardwareModal
}) => {
  const {
    systemStatus,
    activeFaults,
    operatingMode,
    setOperatingMode,
    isStreamingPaused,
    toggleStreamingPause,
    isSimulatingNoise,
    toggleSimulatingNoise,
    resetToNominal
  } = useElevator();

  const pageTitles: Record<NavPage, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Elevator Monitoring Dashboard',
      subtitle: 'Real-time telemetry, motor health indexing & active fault monitoring'
    },
    monitoring: {
      title: 'Live Sensor Monitoring',
      subtitle: 'Continuous dynamic waveforms and threshold boundary references'
    },
    simulation: {
      title: 'Sensor Simulation & Fault Injection',
      subtitle: 'Interactive test bench for elevator operating parameter perturbation'
    },
    faults: {
      title: 'Autonomous Fault Isolation & Root Cause Analysis',
      subtitle: 'Rule-based diagnostic reasoning, component isolation and maintenance actions'
    },
    history: {
      title: 'Alert History & Event Audit Log',
      subtitle: 'Chronological threshold breaches and maintenance dispatch records'
    },
    settings: {
      title: 'Demonstration Threshold Configuration',
      subtitle: 'Configurable warning, critical limits and system boundary settings'
    }
  };

  const currentInfo = pageTitles[currentPage];

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Traction Elevator #01</span>
          <span>/</span>
          <span className="text-slate-800 font-semibold">{currentInfo.title}</span>
        </div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
          {currentInfo.title}
        </h1>
      </div>

      {/* Action Controls */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Operating Mode Selector */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setOperatingMode('simulation')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              operatingMode === 'simulation'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Simulation Mode</span>
          </button>
          <button
            onClick={() => {
              setOperatingMode('real_hardware');
              onOpenHardwareModal();
            }}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              operatingMode === 'real_hardware'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
            <span>Real Sensor Mode</span>
          </button>
        </div>

        {/* Stream Play/Pause */}
        <button
          onClick={toggleStreamingPause}
          title={isStreamingPaused ? 'Resume live telemetry stream' : 'Pause live telemetry stream'}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
            isStreamingPaused
              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {isStreamingPaused ? (
            <>
              <Play className="w-3.5 h-3.5 text-amber-600" />
              <span>Resume Stream</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 text-slate-500" />
              <span>Pause Stream</span>
            </>
          )}
        </button>

        {/* Noise Toggle */}
        <button
          onClick={toggleSimulatingNoise}
          title="Toggle realistic sensor noise micro-fluctuations"
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
            isSimulatingNoise
              ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${isSimulatingNoise ? 'text-blue-600' : 'text-slate-400'}`} />
          <span>Noise: {isSimulatingNoise ? 'ON' : 'OFF'}</span>
        </button>

        {/* Reset to Nominal */}
        <button
          onClick={resetToNominal}
          title="Reset all sensor parameters to nominal baseline"
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Nominal</span>
        </button>

        {/* Quick System Status Chip */}
        <div
          onClick={() => {
            if (activeFaults.length > 0) {
              onSelectPage('faults');
            }
          }}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors ${
            systemStatus === 'critical'
              ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
              : systemStatus === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          {systemStatus === 'critical' && <Flame className="w-4 h-4 text-rose-600 animate-pulse" />}
          {systemStatus === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
          {systemStatus === 'normal' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span className="capitalize font-semibold">{systemStatus}</span>
          {activeFaults.length > 0 && (
            <span className="font-mono text-[10px] px-1.5 py-0.2 bg-white/80 rounded border border-current font-bold">
              {activeFaults.length} Fault{activeFaults.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
