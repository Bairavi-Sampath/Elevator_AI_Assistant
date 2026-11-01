import React, { createContext, useContext, useState, useEffect, useRef, useMemo, ReactNode } from 'react';
import {
  SensorData,
  SensorThresholds,
  DetectedFault,
  SystemStatus,
  MotorHealthMetrics,
  AlertHistoryItem,
  OperatingMode,
  SimulationPreset
} from '../types/elevator';
import { evaluateSensors } from '../services/faultDetectionEngine';

export const DEFAULT_THRESHOLDS: SensorThresholds = {
  temperatureWarning: 60.0,
  temperatureCritical: 75.0,
  currentWarning: 5.0,
  currentCritical: 7.0,
  vibrationWarning: 4.0,
  vibrationCritical: 7.0,
  speedMaxNormal: 1.75,
  speedCritical: 2.20,
  doorHazardSpeedLimit: 0.10
};

export const NOMINAL_SENSORS: SensorData = {
  timestamp: Date.now(),
  temperature: 42.0,
  current: 3.2,
  vibration: 1.8,
  speed: 1.25,
  doorClosed: true,
  floor: 4,
  direction: 'up'
};

export const SIMULATION_PRESETS: SimulationPreset[] = [
  {
    id: 'nominal',
    name: 'Normal Baseline',
    description: 'All subsystems within optimal nominal operating parameters.',
    targetSeverity: 'normal',
    values: {
      temperature: 42.0,
      current: 3.2,
      vibration: 1.8,
      speed: 1.25,
      doorClosed: true,
      floor: 3,
      direction: 'up'
    }
  },
  {
    id: 'warning_bearing',
    name: 'Warning: Bearing Friction',
    description: 'Elevated machine vibration and moderate temperature rise indicative of early raceway wear.',
    targetSeverity: 'warning',
    values: {
      temperature: 63.5,
      current: 5.3,
      vibration: 4.6,
      speed: 1.2,
      doorClosed: true,
      floor: 6,
      direction: 'up'
    }
  },
  {
    id: 'critical_thermal',
    name: 'Critical: Motor Thermal Overload',
    description: 'Severe stator temperature escalation above 75°C with high current draw.',
    targetSeverity: 'critical',
    values: {
      temperature: 81.5,
      current: 7.8,
      vibration: 3.8,
      speed: 0.85,
      doorClosed: true,
      floor: 9,
      direction: 'up'
    }
  },
  {
    id: 'critical_vibration',
    name: 'Critical: Mechanical Bearing Seizure',
    description: 'Catastrophic bearing vibration (> 7.5 mm/s) with extreme frictional heat buildup.',
    targetSeverity: 'critical',
    values: {
      temperature: 77.0,
      current: 6.8,
      vibration: 8.2,
      speed: 0.6,
      doorClosed: true,
      floor: 5,
      direction: 'idle'
    }
  },
  {
    id: 'door_hazard',
    name: 'Critical: Door Interlock Failure',
    description: 'Car door open while elevator car is actively traveling in hoistway.',
    targetSeverity: 'critical',
    values: {
      temperature: 44.0,
      current: 3.6,
      vibration: 2.1,
      speed: 1.35,
      doorClosed: false, // OPEN during motion!
      floor: 7,
      direction: 'down'
    }
  },
  {
    id: 'overspeed_trip',
    name: 'Critical: Drive Overspeed Trip',
    description: 'Car velocity exceeds governor trip threshold (> 2.2 m/s).',
    targetSeverity: 'critical',
    values: {
      temperature: 52.0,
      current: 5.9,
      vibration: 4.8,
      speed: 2.45,
      doorClosed: true,
      floor: 2,
      direction: 'down'
    }
  }
];

export interface TelemetryPoint {
  timeStr: string;
  timestamp: number;
  temperature: number;
  current: number;
  vibration: number;
  speed: number;
  status: SystemStatus;
}

interface ElevatorContextType {
  sensors: SensorData;
  thresholds: SensorThresholds;
  systemStatus: SystemStatus;
  activeFaults: DetectedFault[];
  motorHealth: MotorHealthMetrics;
  telemetryHistory: TelemetryPoint[];
  alertHistory: AlertHistoryItem[];
  operatingMode: OperatingMode;
  isSimulatingNoise: boolean;
  isStreamingPaused: boolean;
  activePresetId: string | null;
  // Actions
  updateSensors: (partial: Partial<SensorData>) => void;
  applyPreset: (presetId: string) => void;
  resetToNominal: () => void;
  updateThresholds: (partial: Partial<SensorThresholds>) => void;
  resetThresholdsToDefaults: () => void;
  setOperatingMode: (mode: OperatingMode) => void;
  toggleSimulatingNoise: () => void;
  toggleStreamingPause: () => void;
  acknowledgeAlert: (alertId: string) => void;
  clearAlert: (alertId: string) => void;
  clearAllAlerts: () => void;
  carShaftAnimationProgress: number; // 0 - 100 for elevator shaft graphic
}

const ElevatorContext = createContext<ElevatorContextType | undefined>(undefined);

const LOCAL_STORAGE_THRESHOLDS_KEY = 'elevator_assistant_thresholds_v1';
const LOCAL_STORAGE_ALERTS_KEY = 'elevator_assistant_alerts_v1';

export const ElevatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load persisted thresholds
  const [thresholds, setThresholds] = useState<SensorThresholds>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_THRESHOLDS_KEY);
      if (saved) {
        return { ...DEFAULT_THRESHOLDS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_THRESHOLDS;
  });

  // Load persisted alert history
  const [alertHistory, setAlertHistory] = useState<AlertHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ALERTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    // Seed initial realistic baseline history for demonstration
    const now = Date.now();
    return [
      {
        id: `ALT-SEED-1`,
        timestamp: now - 3600000 * 2,
        faultCode: 'E-MOT-01',
        faultName: 'Elevated Motor Operating Temperature',
        severity: 'warning',
        sensorName: 'PT100 Stator RTD',
        sensorValue: '62.4 °C',
        description: 'Sensor exceeded warning threshold of 60.0°C during peak noon traffic.',
        acknowledged: true
      },
      {
        id: `ALT-SEED-2`,
        timestamp: now - 3600000 * 5,
        faultCode: 'E-MEC-01',
        faultName: 'Elevated Machine Vibration Level',
        severity: 'warning',
        sensorName: 'Machine Accelerometer',
        sensorValue: '4.32 mm/s',
        description: 'Vibration spike logged at 4th floor landing transition.',
        acknowledged: true
      }
    ];
  });

  const [sensors, setSensors] = useState<SensorData>(NOMINAL_SENSORS);
  const [operatingMode, setOperatingMode] = useState<OperatingMode>('simulation');
  const [isSimulatingNoise, setIsSimulatingNoise] = useState<boolean>(true);
  const [isStreamingPaused, setIsStreamingPaused] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string | null>('nominal');
  const [carShaftAnimationProgress, setCarShaftAnimationProgress] = useState<number>(35);

  // Buffer of last 30 telemetry points for line charts
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>(() => {
    const initial: TelemetryPoint[] = [];
    const now = Date.now();
    for (let i = 25; i >= 0; i--) {
      const ts = now - i * 2000;
      const d = new Date(ts);
      const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
      initial.push({
        timeStr,
        timestamp: ts,
        temperature: +(42.0 + (Math.random() - 0.5) * 0.8).toFixed(1),
        current: +(3.2 + (Math.random() - 0.5) * 0.15).toFixed(2),
        vibration: +(1.8 + (Math.random() - 0.5) * 0.2).toFixed(2),
        speed: 1.25,
        status: 'normal'
      });
    }
    return initial;
  });

  // Evaluate faults dynamically
  const { status: systemStatus, faults: activeFaults, motorHealth } = useMemo(() => {
    return evaluateSensors(sensors, thresholds);
  }, [sensors, thresholds]);

  // Alert generation state tracker for transition-based logging
  const previousFaultsRef = useRef<Map<string, DetectedFault>>(new Map());

  // Auto-generate alerts on fault occurrence or recovery
  useEffect(() => {
    const now = Date.now();
    const newAlerts: AlertHistoryItem[] = [];
    const currentFaultMap = new Map<string, DetectedFault>();

    activeFaults.forEach(fault => {
      currentFaultMap.set(fault.code, fault);
      // If fault was not previously active, log new incident immediately!
      if (!previousFaultsRef.current.has(fault.code)) {
        newAlerts.push({
          id: `ALT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          timestamp: now,
          faultCode: fault.code,
          faultName: fault.name,
          severity: fault.severity,
          sensorName: fault.sensorResponsible.split('(')[0].trim(),
          sensorValue: fault.triggerValue,
          description: `Breached ${fault.thresholdBreached}. Affected: ${fault.affectedComponent}`,
          acknowledged: false
        });
      }
    });

    // Check for cleared faults (were active, now cleared)
    previousFaultsRef.current.forEach((prevFault, code) => {
      if (!currentFaultMap.has(code)) {
        newAlerts.push({
          id: `ALT-CLR-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          timestamp: now,
          faultCode: `${code}-CLR`,
          faultName: `Resolved: ${prevFault.name}`,
          severity: 'normal',
          sensorName: prevFault.sensorResponsible.split('(')[0].trim(),
          sensorValue: 'Nominal Level',
          description: `Fault condition resolved. Telemetry returned to nominal operating limits for ${prevFault.affectedComponent}.`,
          acknowledged: true
        });
      }
    });

    previousFaultsRef.current = currentFaultMap;

    if (newAlerts.length > 0) {
      setAlertHistory(prev => {
        const updated = [...newAlerts, ...prev].slice(0, 100);
        try {
          localStorage.setItem(LOCAL_STORAGE_ALERTS_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    }
  }, [activeFaults]);

  // Persist thresholds whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_THRESHOLDS_KEY, JSON.stringify(thresholds));
    } catch {
      // ignore
    }
  }, [thresholds]);

  // 1-Second Telemetry Tick: updates historical buffer and micro-noise
  useEffect(() => {
    if (isStreamingPaused) return;

    const interval = setInterval(() => {
      setSensors(prev => {
        let { temperature, current, vibration, speed, doorClosed, floor, direction } = prev;

        // Apply realistic micro-fluctuation noise if enabled
        if (isSimulatingNoise) {
          const tempJitter = (Math.random() - 0.5) * 0.15;
          const currentJitter = (Math.random() - 0.5) * 0.08;
          const vibJitter = (Math.random() - 0.5) * 0.12;
          const speedJitter = speed > 0 ? (Math.random() - 0.5) * 0.02 : 0;

          temperature = +(temperature + tempJitter).toFixed(1);
          current = +(Math.max(0, current + currentJitter)).toFixed(2);
          vibration = +(Math.max(0, vibration + vibJitter)).toFixed(2);
          speed = +(Math.max(0, speed + speedJitter)).toFixed(2);
        }

        // Car position and floor movement simulation
        let nextFloor = floor;
        let nextDir = direction;
        if (speed > 0) {
          setCarShaftAnimationProgress(p => {
            let nextP = direction === 'up' ? p + speed * 1.5 : p - speed * 1.5;
            if (nextP >= 95) {
              nextDir = 'down';
              nextP = 95;
            } else if (nextP <= 5) {
              nextDir = 'up';
              nextP = 5;
            }
            nextFloor = Math.max(1, Math.min(12, Math.round(1 + (nextP / 100) * 11)));
            return nextP;
          });
        }

        const now = Date.now();
        const d = new Date(now);
        const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;

        // Append to telemetry history (keep last 30 points)
        setTelemetryHistory(history => {
          const updated = [
            ...history.slice(-29),
            {
              timeStr,
              timestamp: now,
              temperature,
              current,
              vibration,
              speed,
              status: systemStatus
            }
          ];
          return updated;
        });

        return {
          ...prev,
          timestamp: now,
          temperature,
          current,
          vibration,
          speed,
          doorClosed,
          floor: nextFloor,
          direction: nextDir
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isStreamingPaused, isSimulatingNoise, systemStatus]);

  // Actions
  const appendTelemetryHistory = (nextSensors: SensorData) => {
    const d = new Date(nextSensors.timestamp);
    const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
    setTelemetryHistory(history => [
      ...history.slice(-29),
      {
        timeStr,
        timestamp: nextSensors.timestamp,
        temperature: nextSensors.temperature,
        current: nextSensors.current,
        vibration: nextSensors.vibration,
        speed: nextSensors.speed,
        status: systemStatus
      }
    ]);
  };

  const updateSensors = (partial: Partial<SensorData>) => {
    setActivePresetId(null);
    setSensors(prev => {
      const next = {
        ...prev,
        ...partial,
        timestamp: Date.now()
      };
      appendTelemetryHistory(next);
      return next;
    });
  };

  const applyPreset = (presetId: string) => {
    const preset = SIMULATION_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setActivePresetId(preset.id);
    setSensors(prev => {
      const next = {
        ...prev,
        ...preset.values,
        timestamp: Date.now()
      };
      appendTelemetryHistory(next);
      return next;
    });
  };

  const resetToNominal = () => {
    applyPreset('nominal');
  };

  const updateThresholds = (partial: Partial<SensorThresholds>) => {
    setThresholds(prev => ({ ...prev, ...partial }));
  };

  const resetThresholdsToDefaults = () => {
    setThresholds(DEFAULT_THRESHOLDS);
  };

  const toggleSimulatingNoise = () => {
    setIsSimulatingNoise(prev => !prev);
  };

  const toggleStreamingPause = () => {
    setIsStreamingPaused(prev => !prev);
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlertHistory(prev => {
      const updated = prev.map(item => (item.id === alertId ? { ...item, acknowledged: true } : item));
      try {
        localStorage.setItem(LOCAL_STORAGE_ALERTS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearAlert = (alertId: string) => {
    setAlertHistory(prev => {
      const updated = prev.filter(item => item.id !== alertId);
      try {
        localStorage.setItem(LOCAL_STORAGE_ALERTS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearAllAlerts = () => {
    setAlertHistory([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_ALERTS_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <ElevatorContext.Provider
      value={{
        sensors,
        thresholds,
        systemStatus,
        activeFaults,
        motorHealth,
        telemetryHistory,
        alertHistory,
        operatingMode,
        isSimulatingNoise,
        isStreamingPaused,
        activePresetId,
        updateSensors,
        applyPreset,
        resetToNominal,
        updateThresholds,
        resetThresholdsToDefaults,
        setOperatingMode,
        toggleSimulatingNoise,
        toggleStreamingPause,
        acknowledgeAlert,
        clearAlert,
        clearAllAlerts,
        carShaftAnimationProgress
      }}
    >
      {children}
    </ElevatorContext.Provider>
  );
};

export function useElevator() {
  const context = useContext(ElevatorContext);
  if (!context) {
    throw new Error('useElevator must be used within an ElevatorProvider');
  }
  return context;
}
