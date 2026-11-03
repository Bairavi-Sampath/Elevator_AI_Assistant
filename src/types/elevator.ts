/**
 * Type definitions for Autonomous Fault Isolation & Root Cause Analysis Assistant for Elevator Systems
 */

export type SystemStatus = 'normal' | 'warning' | 'critical';

export type OperatingMode = 'simulation' | 'real_hardware';

export type TelemetryConnectionState = 'simulation_active' | 'hardware_connected' | 'disconnected';

export interface SensorData {
  timestamp: number;
  temperature: number; // °C
  current: number;     // A (Motor armature / line current)
  vibration: number;   // mm/s (Peak vibration velocity RMS)
  speed: number;       // m/s (Elevator car linear speed)
  doorClosed: boolean; // true = Closed, false = Open
  floor: number;       // Current floor (1 - 12)
  direction: 'up' | 'down' | 'idle';
}

export interface SensorThresholds {
  temperatureWarning: number;   // default 60°C
  temperatureCritical: number;  // default 75°C
  currentWarning: number;       // default 5.0 A
  currentCritical: number;      // default 7.0 A
  vibrationWarning: number;     // default 4.0 mm/s
  vibrationCritical: number;    // default 7.0 mm/s
  speedMaxNormal: number;       // default 1.75 m/s
  speedCritical: number;        // default 2.20 m/s
  doorHazardSpeedLimit: number; // default 0.10 m/s (if door open while speed > limit -> hazard)
}

export type ComponentCategory =
  | 'traction_motor'
  | 'bearing_gearbox'
  | 'brake_assembly'
  | 'door_interlock'
  | 'drive_inverter'
  | 'guide_rail_counterweight';

export interface DetectedFault {
  id: string;
  code: string;
  name: string;
  severity: 'warning' | 'critical';
  affectedComponent: string;
  componentCategory: ComponentCategory;
  sensorResponsible: string;
  triggerValue: string;
  thresholdBreached: string;
  detectedAt: number;
  possibleRootCauses: string[];
  recommendedActions: string[];
  maintenanceUrgency: 'Immediate Shutdown Required' | 'Schedule Inspection within 24 Hours' | 'Routine Maintenance Required';
  isolationConfidence: number; // 0 - 100%
  isolationProtocol: string[];
}

export interface AlertHistoryItem {
  id: string;
  timestamp: number;
  faultCode: string;
  faultName: string;
  severity: SystemStatus;
  sensorName: string;
  sensorValue: string;
  description: string;
  acknowledged: boolean;
}

export interface SimulationPreset {
  id: string;
  name: string;
  description: string;
  targetSeverity: SystemStatus;
  values: {
    temperature: number;
    current: number;
    vibration: number;
    speed: number;
    doorClosed: boolean;
    floor?: number;
    direction?: 'up' | 'down' | 'idle';
  };
}

export interface MotorHealthMetrics {
  overallHealthScore: number; // 0 - 100
  thermalStressScore: number;
  electricalStressScore: number;
  mechanicalVibrationScore: number;
  status: SystemStatus;
}

export interface AnomalyDetectionData {
  isAnomaly: boolean;
  anomalyScore: number; // 0.0 - 1.0
  modelVersion?: string;
}

export interface FaultClassificationData {
  predictedFault: string;
  confidence: number; // 0 - 100%
  probabilities: Record<string, number>;
  modelVersion?: string;
}

export interface BackendDiagnosisData {
  timestamp: number;
  systemStatus: SystemStatus;
  anomaly: AnomalyDetectionData;
  faultClassification: FaultClassificationData;
  rca: DetectedFault[];
  motorHealth: MotorHealthMetrics;
}
