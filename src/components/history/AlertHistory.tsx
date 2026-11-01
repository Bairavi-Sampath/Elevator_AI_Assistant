import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Check,
  RotateCcw
} from 'lucide-react';
import { useElevator } from '../../context/ElevatorContext';
import { SystemStatus } from '../../types/elevator';

export const AlertHistory: React.FC = () => {
  const { alertHistory, acknowledgeAlert, clearAlert, clearAllAlerts } = useElevator();

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | SystemStatus>('all');

  const filteredAlerts = useMemo(() => {
    return alertHistory.filter(item => {
      // Severity filter
      if (severityFilter !== 'all' && item.severity !== severityFilter) {
        return false;
      }
      // Search query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          item.faultCode.toLowerCase().includes(query) ||
          item.faultName.toLowerCase().includes(query) ||
          item.sensorName.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [alertHistory, severityFilter, searchTerm]);

  // Export to CSV
  const handleExportCSV = () => {
    if (alertHistory.length === 0) return;
    const headers = ['Fault ID', 'Timestamp', 'Fault Code', 'Fault Name', 'Severity', 'Sensor Name', 'Sensor Reading', 'Description', 'Acknowledged'];
    const rows = alertHistory.map(a => [
      `"${a.id}"`,
      `"${new Date(a.timestamp).toISOString()}"`,
      `"${a.faultCode}"`,
      `"${a.faultName.replace(/"/g, '""')}"`,
      `"${a.severity.toUpperCase()}"`,
      `"${a.sensorName.replace(/"/g, '""')}"`,
      `"${a.sensorValue}"`,
      `"${a.description.replace(/"/g, '""')}"`,
      `"${a.acknowledged ? 'YES' : 'NO'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Elevator_Alert_History_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <span>Elevator Fault &amp; Alert Event Audit Log</span>
            </h2>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {alertHistory.length} Total Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological audit of all automatic safety threshold trips, abnormal sensor excursions, and operator acknowledgments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={alertHistory.length === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Log</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all stored alert history?')) {
                clearAllAlerts();
              }
            }}
            disabled={alertHistory.length === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by fault code, component name, or sensor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              severityFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({alertHistory.length})
          </button>
          <button
            onClick={() => setSeverityFilter('critical')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              severityFilter === 'critical'
                ? 'bg-white text-rose-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Critical ({alertHistory.filter(a => a.severity === 'critical').length})
          </button>
          <button
            onClick={() => setSeverityFilter('warning')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              severityFilter === 'warning'
                ? 'bg-white text-amber-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Warning ({alertHistory.filter(a => a.severity === 'warning').length})
          </button>
          <button
            onClick={() => setSeverityFilter('normal')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              severityFilter === 'normal'
                ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Normal / Cleared ({alertHistory.filter(a => a.severity === 'normal').length})
          </button>
        </div>
      </div>

      {/* Alert Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Fault ID / Code</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Fault Description</th>
                <th className="py-3 px-4">Sensor Reading</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No Matching Alert Records Found</p>
                    <p className="text-xs mt-1">Try resetting your filter or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredAlerts.map(item => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      item.severity === 'critical' ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    {/* Fault ID & Code */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{item.faultCode}</div>
                      <div className="text-[10px] text-slate-400">{item.id}</div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 font-mono text-slate-600 tabular-nums">
                      <div>{new Date(item.timestamp).toLocaleDateString()}</div>
                      <div className="text-[11px] text-slate-400">{new Date(item.timestamp).toLocaleTimeString()}</div>
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.severity === 'critical'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : item.severity === 'warning'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {item.severity === 'critical' && <Flame className="w-3 h-3 text-rose-600" />}
                        {item.severity === 'warning' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        {item.severity === 'normal' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        <span>{item.severity}</span>
                      </span>
                    </td>

                    {/* Fault Description */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{item.faultName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.description}</div>
                    </td>

                    {/* Sensor Reading */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{item.sensorValue}</div>
                      <div className="text-[10px] text-slate-400">{item.sensorName}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {item.acknowledged ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Acknowledged</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>Unacknowledged</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {!item.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(item.id)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-[11px] font-medium transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => clearAlert(item.id)}
                        title="Remove record"
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredAlerts.length} of {alertHistory.length} logged incidents</span>
          <span>Stored in browser LocalStorage</span>
        </div>
      </div>
    </div>
  );
};
