import React from 'react';
import { LucideIcon, AlertTriangle, Flame, CheckCircle } from 'lucide-react';
import { SystemStatus } from '../../types/elevator';

interface SensorCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  status: SystemStatus;
  warningThreshold?: string;
  criticalThreshold?: string;
  percentage?: number; // 0 to 100 relative to full scale
  subtext?: string;
  onClick?: () => void;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  status,
  warningThreshold,
  criticalThreshold,
  percentage = 40,
  subtext,
  onClick
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'critical':
        return {
          border: 'border-rose-300 ring-1 ring-rose-200',
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          barColor: 'bg-rose-500',
          iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
          valueColor: 'text-rose-700'
        };
      case 'warning':
        return {
          border: 'border-amber-300 ring-1 ring-amber-200',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          barColor: 'bg-amber-500',
          iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
          valueColor: 'text-amber-700'
        };
      case 'normal':
      default:
        return {
          border: 'border-slate-200 hover:border-slate-300',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          barColor: 'bg-blue-600',
          iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
          valueColor: 'text-slate-900'
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border transition-all duration-200 shadow-xs flex flex-col justify-between ${styles.border} ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      }`}
    >
      <div>
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${styles.iconBg}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-700 tracking-tight">{title}</h3>
              <p className="text-[11px] text-slate-400">Telemetry Stream</p>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border capitalize ${styles.badge}`}>
            {status === 'critical' && <Flame className="w-3 h-3 text-rose-600" />}
            {status === 'warning' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
            {status === 'normal' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
            <span>{status}</span>
          </span>
        </div>

        {/* Value Display */}
        <div className="mt-4 flex items-baseline gap-1.5">
          <span className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${styles.valueColor}`}>
            {value}
          </span>
          <span className="text-xs font-semibold text-slate-500 uppercase">{unit}</span>
        </div>

        {/* Subtext info */}
        {subtext && (
          <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">{subtext}</p>
        )}
      </div>

      {/* Progress / Gauge bar */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${styles.barColor}`}
            style={{ width: `${Math.max(4, Math.min(100, percentage))}%` }}
          />
        </div>

        {/* Threshold indicators */}
        {(warningThreshold || criticalThreshold) && (
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Warn: {warningThreshold}</span>
            <span>Crit: {criticalThreshold}</span>
          </div>
        )}
      </div>
    </div>
  );
};
