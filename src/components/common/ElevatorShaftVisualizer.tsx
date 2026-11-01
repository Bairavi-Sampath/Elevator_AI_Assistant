import React from 'react';
import { ArrowUp, ArrowDown, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useElevator } from '../../context/ElevatorContext';

export const ElevatorShaftVisualizer: React.FC = () => {
  const { sensors, activeFaults, carShaftAnimationProgress } = useElevator();

  const isDoorHazard = !sensors.doorClosed && sensors.speed > 0.10;
  const isMoving = sensors.speed > 0.05;

  // Total floors: 12
  const floors = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
      {/* Visualizer Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Shaft Hoistway &amp; Car Dynamic Visualizer
          </h3>
          <p className="text-[11px] text-slate-400">
            Real-time mechanical position &amp; safety interlock tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Movement Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-medium">
            {sensors.direction === 'up' && isMoving && (
              <span className="flex items-center text-blue-600 font-semibold gap-1">
                <ArrowUp className="w-3.5 h-3.5 animate-bounce" /> UP
              </span>
            )}
            {sensors.direction === 'down' && isMoving && (
              <span className="flex items-center text-blue-600 font-semibold gap-1">
                <ArrowDown className="w-3.5 h-3.5 animate-bounce" /> DOWN
              </span>
            )}
            {!isMoving && <span className="text-slate-500">HOLD</span>}
            <span>·</span>
            <span>{sensors.speed.toFixed(2)} m/s</span>
          </div>

          {/* Current Floor */}
          <div className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold">
            FL {sensors.floor.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Main Shaft Schematic View */}
      <div className="my-4 relative h-72 bg-slate-900 rounded-lg p-3 overflow-hidden border border-slate-800 flex items-stretch gap-3">
        {/* Machine Room Header at top */}
        <div className="absolute top-0 left-0 right-0 h-7 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between px-3 text-[10px] text-slate-300 font-mono z-20">
          <span>MACHINE ROOM (PMSM MOTOR &amp; VFD)</span>
          <span className="text-slate-400">PULLEY RATIO 2:1</span>
        </div>

        {/* Floor Markers Column */}
        <div className="w-10 flex flex-col justify-between py-7 text-[10px] font-mono text-slate-500 z-10 shrink-0">
          {floors.map(fl => (
            <div
              key={fl}
              className={`flex items-center gap-1 transition-colors ${
                sensors.floor === fl ? 'text-amber-400 font-bold' : ''
              }`}
            >
              <span>{fl.toString().padStart(2, '0')}F</span>
              {sensors.floor === fl && <span className="w-1 h-1 rounded-full bg-amber-400" />}
            </div>
          ))}
        </div>

        {/* Hoistway Grid with Car & Cables */}
        <div className="relative flex-1 bg-slate-950/70 rounded border border-slate-800/80 mx-1 overflow-hidden">
          {/* Guide Rail vertical lines */}
          <div className="absolute top-7 bottom-0 left-4 w-0.5 bg-slate-700/60" />
          <div className="absolute top-7 bottom-0 right-4 w-0.5 bg-slate-700/60" />

          {/* Steel Hoisting Cables */}
          <div
            className="absolute top-7 left-1/2 -translate-x-1/2 w-0.5 bg-slate-400/70"
            style={{
              height: `${100 - carShaftAnimationProgress}%`
            }}
          />

          {/* The Elevator Car */}
          <div
            className={`absolute left-6 right-16 h-14 rounded-md border-2 transition-all duration-300 flex flex-col justify-between p-2 shadow-lg z-10 ${
              isDoorHazard
                ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                : sensors.doorClosed
                ? 'bg-slate-800 border-blue-400/80 text-white'
                : 'bg-amber-950/80 border-amber-400 text-amber-200'
            }`}
            style={{
              bottom: `${Math.min(80, Math.max(2, carShaftAnimationProgress))}%`
            }}
          >
            {/* Top row in car: Floor & Door Status */}
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="font-bold">CAR #1</span>
              <span className="text-[9px] px-1 rounded bg-black/40">
                {sensors.doorClosed ? 'DOORS LOCKED' : 'DOORS OPEN'}
              </span>
            </div>

            {/* Door animation representation inside car */}
            <div className="flex items-center justify-center gap-1 py-0.5">
              {sensors.doorClosed ? (
                <div className="w-full flex items-center justify-center gap-0.5 text-[9px] bg-slate-900/90 py-0.5 rounded border border-slate-700">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="text-slate-300 font-mono">Sill Latched</span>
                </div>
              ) : (
                <div className="w-full flex items-center justify-between px-1 bg-amber-500/20 py-0.5 rounded border border-amber-500/40 text-[9px] font-mono font-bold text-amber-300 animate-pulse">
                  <span>|&lt;--</span>
                  <span>OPENED</span>
                  <span>--&gt;|</span>
                </div>
              )}
            </div>
          </div>

          {/* Counterweight (moves inverse to car) */}
          <div
            className="absolute right-6 w-5 h-10 rounded bg-slate-700 border border-slate-500 transition-all duration-300 shadow-md z-10 flex items-center justify-center"
            style={{
              top: `${Math.min(80, Math.max(12, carShaftAnimationProgress))}%`
            }}
          >
            <span className="text-[8px] font-mono text-slate-300 -rotate-90">CW</span>
          </div>

          {/* Counterweight cable */}
          <div
            className="absolute top-7 right-8.5 w-0.5 bg-slate-500/60"
            style={{
              height: `${carShaftAnimationProgress}%`
            }}
          />
        </div>
      </div>

      {/* Safety Hazard Warning Bar if applicable */}
      {isDoorHazard ? (
        <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-800 text-xs">
          <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
          <div className="leading-tight">
            <span className="font-bold">CRITICAL INTERLOCK TRIP:</span> Car is moving at{' '}
            {sensors.speed.toFixed(2)} m/s while hoistway doors are unlatched!
          </div>
        </div>
      ) : activeFaults.length > 0 ? (
        <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-amber-800 text-xs">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <div className="leading-tight">
            <span className="font-semibold">Subsystem Alert:</span> {activeFaults[0].name} detected.
            Inspect affected component.
          </div>
        </div>
      ) : (
        <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>All mechanical clearances &amp; door interlocks verified.</span>
          <span className="font-mono text-emerald-600 font-semibold">100% Interlock Integrity</span>
        </div>
      )}
    </div>
  );
};
