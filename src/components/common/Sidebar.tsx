import React from 'react';
import {
  LayoutDashboard,
  Activity,
  SlidersHorizontal,
  ShieldAlert,
  History,
  Settings,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Flame
} from 'lucide-react';
import { useElevator } from '../../context/ElevatorContext';

export type NavPage = 'dashboard' | 'monitoring' | 'simulation' | 'faults' | 'history' | 'settings';

interface SidebarProps {
  currentPage: NavPage;
  onSelectPage: (page: NavPage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onSelectPage }) => {
  const { systemStatus, activeFaults, operatingMode } = useElevator();

  const navItems = [
    { id: 'dashboard' as NavPage, label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'monitoring' as NavPage, label: 'Live Monitoring', icon: Activity },
    { id: 'simulation' as NavPage, label: 'Sensor Simulation', icon: SlidersHorizontal },
    {
      id: 'faults' as NavPage,
      label: 'Fault Analysis (RCA)',
      icon: ShieldAlert,
      badge: activeFaults.length > 0 ? activeFaults.length : undefined
    },
    { id: 'history' as NavPage, label: 'Alert History', icon: History },
    { id: 'settings' as NavPage, label: 'Threshold Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B192C] text-slate-200 flex flex-col shrink-0 border-r border-slate-800 select-none min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white tracking-tight leading-tight">
              A-FDIR Assistant
            </div>
            <div className="text-[11px] text-slate-400 leading-tight">
              Elevator Diagnostic Core
            </div>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Unit ID:</span>
          <span className="font-mono text-slate-300 font-medium">ELV-SHAFT-01</span>
        </div>
      </div>

      {/* System Status Indicator Widget */}
      <div className="mx-4 my-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
            System Status
          </span>
          {systemStatus === 'normal' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Normal</span>
            </span>
          )}
          {systemStatus === 'warning' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Warning</span>
            </span>
          )}
          {systemStatus === 'critical' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-400 animate-pulse">
              <Flame className="w-3.5 h-3.5" />
              <span>Critical Trip</span>
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>Active Faults:</span>
          <span className={`font-mono font-semibold ${activeFaults.length > 0 ? (systemStatus === 'critical' ? 'text-rose-400' : 'text-amber-400') : 'text-slate-300'}`}>
            {activeFaults.length}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isActive
                      ? 'bg-white text-blue-700'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mode Status Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-slate-400">Mode:</span>
          <span className="font-medium text-slate-200">
            {operatingMode === 'simulation' ? 'Simulated Telemetry' : 'Hardware (Pending)'}
          </span>
        </div>
        <div className="text-[10px] text-slate-400 leading-snug">
          Educational Demonstration Suite v1.0
        </div>
      </div>
    </aside>
  );
};
