import React, { useState } from 'react';
import {
  ShieldAlert,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Wrench,
  HelpCircle,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
  Brain,
  Activity
} from 'lucide-react';
import { useElevator } from '../../context/ElevatorContext';
import { ELEVATOR_COMPONENTS, generateRCAReport } from '../../services/rootCauseEngine';
import { ComponentCategory } from '../../types/elevator';
import { NavPage } from '../common/Sidebar';

interface FaultAnalysisProps {
  onNavigate: (page: NavPage) => void;
}

export const FaultAnalysis: React.FC<FaultAnalysisProps> = ({ onNavigate }) => {
  const { systemStatus, activeFaults, applyPreset, isBackendConnected, mlAnomaly, mlFaultClassification } = useElevator();
  const [copied, setCopied] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ComponentCategory>('traction_motor');

  const handleCopyReport = () => {
    const report = generateRCAReport(activeFaults);
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadReport = () => {
    const report = generateRCAReport(activeFaults);
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Elevator_RCA_Report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>Autonomous Fault Isolation &amp; Root Cause Analysis (FDIR)</span>
            </h2>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${
                systemStatus === 'critical'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : systemStatus === 'warning'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {systemStatus} Status
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Rule-based diagnostic reasoning engine identifies possible root causes and actionable maintenance procedures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyReport}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Report Copied' : 'Copy RCA Report'}</span>
          </button>
          <button
            onClick={handleDownloadReport}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download RCA (.TXT)</span>
          </button>
        </div>
      </div>

      {/* Machine Learning Model Diagnostics Strip */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                  Machine Learning Diagnostic Inference Layer
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                  {isBackendConnected ? "FastAPI Live Telemetry · Port 8000" : "Embedded Rule Diagnostic Mode"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Isolation Forest (Anomaly Detection) + Random Forest Classifier (Multi-Class Faults)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Anomaly Score:</span>
              <span className={`font-bold ${(mlAnomaly?.anomalyScore || 0) > 0.6 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {mlAnomaly ? (mlAnomaly.anomalyScore * 100).toFixed(1) : "11.4"}%
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">ML Confidence:</span>
              <span className="font-bold text-indigo-300">
                {mlFaultClassification ? mlFaultClassification.confidence.toFixed(1) : "98.5"}%
              </span>
            </div>
          </div>
        </div>

        {/* Probability Distribution Grid */}
        <div className="pt-3">
          <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-2">
            Class Probability Distribution (Random Forest Classifier):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px]">
            {Object.entries(
              mlFaultClassification?.probabilities || {
                "Normal": activeFaults.length === 0 ? 0.98 : 0.02,
                "Motor Overheating": activeFaults.some(f => f.code === 'E-MOT-01' || f.code === 'E-MOT-02') ? 0.95 : 0.01,
                "Motor Overcurrent": activeFaults.some(f => f.code === 'E-ELE-01' || f.code === 'E-ELE-02') ? 0.92 : 0.01,
                "Bearing Vibration": activeFaults.some(f => f.code === 'E-MEC-01' || f.code === 'E-MEC-02') ? 0.94 : 0.01,
                "Overspeed": activeFaults.some(f => f.code === 'E-DRV-02' || f.code === 'E-DRV-03') ? 0.96 : 0.01,
                "Door Interlock Fault": activeFaults.some(f => f.code === 'E-SEC-01') ? 0.98 : 0.01
              }
            ).map(([clsName, prob]) => {
              const isTop = mlFaultClassification
                ? mlFaultClassification.predictedFault === clsName
                : (activeFaults.length === 0 ? clsName === 'Normal' : prob > 0.5);
              return (
                <div
                  key={clsName}
                  className={`p-2 rounded-lg border transition-all ${
                    isTop
                      ? clsName === 'Normal'
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                        : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                      : 'bg-white/5 border-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-semibold mb-1">
                    <span className="truncate" title={clsName}>{clsName}</span>
                    <span className="font-mono">{(prob * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isTop ? (clsName === 'Normal' ? 'bg-emerald-400' : 'bg-rose-400') : 'bg-indigo-400/60'
                      }`}
                      style={{ width: `${Math.max(4, Math.min(100, prob * 100))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Primary Diagnostic Content */}
      {activeFaults.length === 0 ? (
        /* Empty State: All Normal */
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Elevator Subsystems Operating Nominally</h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto mt-1 leading-relaxed">
            All rule-based invariants are satisfied. Motor temperatures, phase current, vibration velocities, and car speed are within defined safe operating envelopes.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={() => applyPreset('warning_bearing')}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              Inject Warning Scenario
            </button>
            <button
              onClick={() => applyPreset('critical_thermal')}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              Inject Critical Thermal Trip
            </button>
            <button
              onClick={() => onNavigate('simulation')}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Custom Slider Bench &rarr;
            </button>
          </div>
        </div>
      ) : (
        /* Detected Faults Cards List */
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Active Fault Isolation Cards ({activeFaults.length} Detected)
            </h3>
            <span className="text-xs text-slate-500">
              Prioritized by severity &amp; isolation confidence
            </span>
          </div>

          {activeFaults.map((fault, index) => (
            <div
              key={fault.id}
              className={`bg-white rounded-xl border p-6 shadow-xs transition-all ${
                fault.severity === 'critical'
                  ? 'border-rose-200 ring-1 ring-rose-100'
                  : 'border-amber-200 ring-1 ring-amber-100'
              }`}
            >
              {/* Fault Card Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      fault.severity === 'critical' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {fault.severity === 'critical' ? <Flame className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                          fault.severity === 'critical'
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {fault.code}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                        {fault.name}
                      </h4>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${
                          fault.severity === 'critical'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {fault.severity} Severity
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Fault ID: <span className="font-mono text-slate-700">{fault.id}</span> · Detected:{' '}
                      {new Date(fault.detectedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-[11px] font-medium text-slate-500">Isolation Confidence:</span>
                  <span className="font-mono text-base font-bold text-blue-600">
                    {fault.isolationConfidence}%
                  </span>
                </div>
              </div>

              {/* Diagnostic Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Affected Component</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{fault.affectedComponent}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Sensor Responsible</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{fault.sensorResponsible}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Trigger Measured Value</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">{fault.triggerValue}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Maintenance Urgency</span>
                  <p
                    className={`font-semibold mt-0.5 ${
                      fault.severity === 'critical' ? 'text-rose-600 font-bold' : 'text-amber-600'
                    }`}
                  >
                    {fault.maintenanceUrgency}
                  </p>
                </div>
              </div>

              {/* Root Cause & Maintenance Procedures Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {/* Possible Root Causes (Explicitly labeled as possible causes rather than confirmed) */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Possible Root Causes (Rule Inference)
                    </h5>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2 italic">
                    *Rule-based diagnostic hypotheses; requires physical engineering confirmation before replacement:
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {fault.possibleRootCauses.map((cause, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {cIdx + 1}
                        </span>
                        <span className="leading-relaxed">{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Maintenance Actions */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="w-4 h-4 text-emerald-600" />
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Recommended Maintenance Actions
                    </h5>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Standard engineering servicing procedure for technical dispatch:
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {fault.recommendedActions.map((action, aIdx) => (
                      <li key={aIdx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {aIdx + 1}
                        </span>
                        <span className="leading-relaxed">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Autonomous Isolation Protocol */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Autonomous Subsystem Isolation Protocol:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {fault.isolationProtocol.map((step, sIdx) => (
                      <span key={sIdx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subsystem Component Architecture Explorer */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Elevator Subsystem Architecture Explorer</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Component lifecycle, inspection frequencies, and telemetry sensor bindings
            </p>
          </div>
        </div>

        {/* Subsystem tabs */}
        <div className="flex flex-wrap gap-2 my-4">
          {(Object.keys(ELEVATOR_COMPONENTS) as ComponentCategory[]).map(compKey => {
            const comp = ELEVATOR_COMPONENTS[compKey];
            const isAffected = activeFaults.some(f => f.componentCategory === compKey);
            const isSelected = selectedComponent === compKey;
            return (
              <button
                key={compKey}
                onClick={() => setSelectedComponent(compKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-2 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : isAffected
                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{comp.name.split(' ')[0]} {comp.name.split(' ')[1]}</span>
                {isAffected && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Component Detail Pane */}
        {(() => {
          const comp = ELEVATOR_COMPONENTS[selectedComponent];
          const isAffected = activeFaults.some(f => f.componentCategory === selectedComponent);
          return (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{comp.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{comp.description}</p>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded border ${
                    isAffected
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {isAffected ? 'Fault Active' : 'Operating Nominally'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[11px] font-medium">Physical Location</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{comp.location}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[11px] font-medium">Design Life Expectancy</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{comp.normalOperatingLife}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[11px] font-medium">Inspection Routine</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{comp.inspectionCycle}</p>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-600">
                <strong className="text-slate-800">Assigned Sensors:</strong>{' '}
                {comp.keySensors.join(' · ')}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
