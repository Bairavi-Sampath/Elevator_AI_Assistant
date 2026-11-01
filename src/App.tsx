/**
 * Autonomous Fault Isolation and Root Cause Analysis Assistant for Elevator Systems
 * Main Application Entry
 */

import React, { useState } from 'react';
import { ElevatorProvider, useElevator } from './context/ElevatorContext';
import { Sidebar, NavPage } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { LiveMonitoring } from './components/monitoring/LiveMonitoring';
import { SensorSimulation } from './components/simulation/SensorSimulation';
import { FaultAnalysis } from './components/faults/FaultAnalysis';
import { AlertHistory } from './components/history/AlertHistory';
import { SettingsPage } from './components/settings/SettingsPage';
import { HardwarePendingModal } from './components/common/HardwarePendingModal';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState(false);
  const { operatingMode } = useElevator();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* 1. Dark Navy Blue Sidebar */}
      <Sidebar currentPage={currentPage} onSelectPage={setCurrentPage} />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          onOpenHardwareModal={() => setIsHardwareModalOpen(true)}
        />

        {/* Real Sensor Mode Pending Notice Banner (if in Real Hardware mode) */}
        {operatingMode === 'real_hardware' && (
          <div className="bg-indigo-900 text-indigo-100 px-6 py-2.5 text-xs flex items-center justify-between border-b border-indigo-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>
                <strong>Real Sensor Mode:</strong> Physical ESP32 + FastAPI hardware bridge integration is pending. Standby telemetry active.
              </span>
            </div>
            <button
              onClick={() => setIsHardwareModalOpen(true)}
              className="text-[11px] underline hover:text-white font-medium ml-4 shrink-0"
            >
              View Hardware Architecture
            </button>
          </div>
        )}

        {/* Main Viewport Content */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {currentPage === 'dashboard' && <DashboardOverview onNavigate={setCurrentPage} />}
          {currentPage === 'monitoring' && <LiveMonitoring />}
          {currentPage === 'simulation' && <SensorSimulation onNavigate={setCurrentPage} />}
          {currentPage === 'faults' && <FaultAnalysis onNavigate={setCurrentPage} />}
          {currentPage === 'history' && <AlertHistory />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>

        {/* Industrial Footer */}
        <footer className="border-t border-slate-200 bg-white px-6 py-3.5 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Autonomous Elevator FDIR Assistant</span>
            <span>·</span>
            <span>Educational Engineering Prototype</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span>Standard: EN 81-20/50 Baseline</span>
            <span>·</span>
            <span>Unit: Traction Car 01</span>
            <span>·</span>
            <span className="text-emerald-600 font-medium">Telemetry Online</span>
          </div>
        </footer>
      </div>

      {/* Hardware Pending Modal */}
      <HardwarePendingModal
        isOpen={isHardwareModalOpen}
        onClose={() => setIsHardwareModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ElevatorProvider>
      <AppContent />
    </ElevatorProvider>
  );
}
