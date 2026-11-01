import { DetectedFault, ComponentCategory } from '../types/elevator';

export interface ElevatorComponentMeta {
  id: ComponentCategory;
  name: string;
  location: string;
  normalOperatingLife: string;
  keySensors: string[];
  inspectionCycle: string;
  description: string;
}

export const ELEVATOR_COMPONENTS: Record<ComponentCategory, ElevatorComponentMeta> = {
  traction_motor: {
    id: 'traction_motor',
    name: 'Permanent Magnet Synchronous Traction Motor',
    location: 'Overhead Machine Room / Machine-Room-Less (MRL) Bedplate',
    normalOperatingLife: '15 - 20 Years / 3,000,000 Travel Cycles',
    keySensors: ['PT100 Stator Winding RTD', 'Line Current Hall Effect Sensor', 'Thermal Bimetallic Switch'],
    inspectionCycle: 'Monthly visual / Semi-annual insulation surge resistance audit',
    description: 'Direct-drive hoisting motor providing drive torque to hoist cables with precise closed-loop vector control.'
  },
  bearing_gearbox: {
    id: 'bearing_gearbox',
    name: 'Traction Sheave Bearings & Shaft Assembly',
    location: 'Traction Machine Shaft / Pillow Block Housings',
    normalOperatingLife: '8 - 12 Years / 100,000 Operating Hours',
    keySensors: ['Triaxial Piezoelectric Accelerometer (mm/s RMS)', 'Acoustic Emission Sensor'],
    inspectionCycle: 'Quarterly lubrication sampling and vibration spectrum baseline survey',
    description: 'Precision spherical roller bearings supporting machine drive sheave radial loads and rope tensions.'
  },
  brake_assembly: {
    id: 'brake_assembly',
    name: 'Electromechanical Disc / Drum Safety Brake',
    location: 'Drive Machine Shaft End',
    normalOperatingLife: '5 - 8 Years / Lining Wear Limited',
    keySensors: ['Brake Shoe Micro-Switch Lift Contact', 'Brake Coil Current Shunt', 'Caliper Temperature Probe'],
    inspectionCycle: 'Monthly air gap measurement (0.25 - 0.35 mm) and emergency stop deceleration check',
    description: 'Fail-safe spring-applied holding brake that automatically engages on power loss or safety circuit break.'
  },
  door_interlock: {
    id: 'door_interlock',
    name: 'Landing & Car Door Interlock Safety Contacts',
    location: 'Car Header & Hoistway Entrance Sills',
    normalOperatingLife: '3 - 5 Years / High Cyclical Duty',
    keySensors: ['Door Closed Gate Switch', 'Landing Lock Beak Contact Blades', 'Infrared Light Curtain Sensor'],
    inspectionCycle: 'Bi-weekly interlock mechanical hook engagement and contact wipe verification',
    description: 'Critical electrical safety chain that strictly guarantees the car cannot move unless all doors are fully closed and locked.'
  },
  drive_inverter: {
    id: 'drive_inverter',
    name: 'VVVF Variable Frequency Inverter Drive',
    location: 'Machine Room Controller Cabinet',
    normalOperatingLife: '10 - 12 Years / DC Bus Capacitor Limited',
    keySensors: ['Optical Quadrature Rotary Encoder (1024/2048 PPR)', 'IGBT Heatsink Thermistor', 'DC Bus Voltage Transducer'],
    inspectionCycle: 'Quarterly harmonic scan, terminal torque inspection, and cooling duct clean',
    description: 'Solid-state inverter modulating frequency and voltage to deliver jerk-free S-curve motion profile.'
  },
  guide_rail_counterweight: {
    id: 'guide_rail_counterweight',
    name: 'Guide Rails, Roller Guides & Counterweight Frame',
    location: 'Vertical Hoistway Walls',
    normalOperatingLife: '20+ Years / Shoe Liners 2 - 3 Years',
    keySensors: ['Car Frame Dynamic Accelerometer', 'Load Weighing Transducer (Under Platform)'],
    inspectionCycle: 'Semi-annual rail straightness check, lubrication wick inspection, and bolt torque check',
    description: 'Machined steel T-rails and roller shoes guiding passenger car and balancing counterweight smoothly up and down the shaft.'
  }
};

/**
 * Format an engineering RCA export document
 */
export function generateRCAReport(faults: DetectedFault[], systemDate: Date = new Date()): string {
  const timestampStr = systemDate.toISOString();
  let report = `========================================================================\n`;
  report += `AUTONOMOUS FAULT ISOLATION AND ROOT CAUSE ANALYSIS (RCA) REPORT\n`;
  report += `ELEVATOR SYSTEM HEALTH MANAGEMENT ASSISTANT - PROTOTYPE SUITE\n`;
  report += `Generated at: ${timestampStr}\n`;
  report += `Evaluation Standard: EN 81-20/50 & ASME A17.1 Rule Baseline (Configurable Prototype)\n`;
  report += `========================================================================\n\n`;

  if (faults.length === 0) {
    report += `SYSTEM STATUS: NOMINAL (NORMAL)\n`;
    report += `No active threshold excursions or subsystem faults detected.\n`;
    report += `All telemetry streams (Temperature, Current, Vibration, Speed, Doors) within safe operating envelopes.\n`;
    return report;
  }

  report += `ACTIVE FAULT COUNT: ${faults.length}\n`;
  report += `OVERALL SYSTEM STATUS: ${faults.some(f => f.severity === 'critical') ? 'CRITICAL (SHUTDOWN / IMMEDIATE ACTION)' : 'WARNING (MAINTENANCE REQUIRED)'}\n\n`;

  faults.forEach((fault, index) => {
    report += `------------------------------------------------------------------------\n`;
    report += `FAULT RECORD #${index + 1}: [${fault.code}] ${fault.name.toUpperCase()}\n`;
    report += `------------------------------------------------------------------------\n`;
    report += `Severity Level        : ${fault.severity.toUpperCase()}\n`;
    report += `Affected Subsystem    : ${fault.affectedComponent}\n`;
    report += `Category Key          : ${fault.componentCategory}\n`;
    report += `Sensor Responsible    : ${fault.sensorResponsible}\n`;
    report += `Trigger Value Measured: ${fault.triggerValue}\n`;
    report += `Threshold Reference   : ${fault.thresholdBreached}\n`;
    report += `Detection Timestamp   : ${new Date(fault.detectedAt).toLocaleString()}\n`;
    report += `Isolation Confidence : ${fault.isolationConfidence}%\n`;
    report += `Maintenance Urgency   : ${fault.maintenanceUrgency}\n\n`;

    report += `[IDENTIFIED POSSIBLE ROOT CAUSES (Rule-Based Probabilistic Inference)]:\n`;
    fault.possibleRootCauses.forEach((cause, idx) => {
      report += `  ${idx + 1}. [Possible Cause] ${cause}\n`;
    });
    report += `  *Note: These represent potential causal hypotheses derived from rule isolation patterns and must be confirmed via physical diagnostic checks before part replacement.*\n\n`;

    report += `[RECOMMENDED ENGINEERING MAINTENANCE PROCEDURES]:\n`;
    fault.recommendedActions.forEach((action, idx) => {
      report += `  Step ${idx + 1}: ${action}\n`;
    });
    report += `\n`;

    report += `[AUTONOMOUS ISOLATION PROTOCOL]:\n`;
    fault.isolationProtocol.forEach((step, idx) => {
      report += `  - ${step}\n`;
    });
    report += `\n`;
  });

  report += `========================================================================\n`;
  report += `END OF AUTOMATED DIAGNOSTIC LOG\n`;
  report += `========================================================================\n`;

  return report;
}
