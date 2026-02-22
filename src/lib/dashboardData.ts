export interface PatientProfile {
  name: string;
  dob: string;
  age: number;
  sex: string;
  mrn: string;
  primaryPhysician: string;
  insuranceProvider: string;
  lastVisit: string;
}

export interface VitalSign {
  label: string;
  value: string;
  unit: string;
  status: "normal" | "warning" | "critical";
  icon: string;
}

export interface ICD10Code {
  code: string;
  description: string;
  status: "active" | "resolved" | "chronic";
}

export interface Allergy {
  name: string;
  severity: "mild" | "moderate" | "severe";
  reaction: string;
}

export interface LabTest {
  name: string;
  status: "pending" | "completed" | "overdue";
  date: string;
  result?: string;
  normalRange?: string;
}

export interface VitalTrend {
  date: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperature: number;
  spo2: number;
}

export const patientProfile: PatientProfile = {
  name: "—",
  dob: "—",
  age: 0,
  sex: "—",
  mrn: "—",
  primaryPhysician: "—",
  insuranceProvider: "—",
  lastVisit: "—",
};

export const vitalSigns: VitalSign[] = [
  { label: "Blood Pressure", value: "—", unit: "mmHg", status: "normal", icon: "heart" },
  { label: "Heart Rate", value: "—", unit: "bpm", status: "normal", icon: "activity" },
  { label: "Respiratory Rate", value: "—", unit: "breaths/min", status: "normal", icon: "wind" },
  { label: "Temperature", value: "—", unit: "°F", status: "normal", icon: "thermometer" },
  { label: "BMI", value: "—", unit: "kg/m²", status: "normal", icon: "scale" },
  { label: "SpO2", value: "—", unit: "%", status: "normal", icon: "droplets" },
];

export const icd10Codes: ICD10Code[] = [];

export const allergies: Allergy[] = [];

export const labTests: LabTest[] = [];

export const medications = [];

export const planOfCare = [];

export const vitalTrends: VitalTrend[] = [
  { date: "Sep", systolic: 148, diastolic: 92, heartRate: 82, temperature: 98.6, spo2: 97 },
  { date: "Oct", systolic: 145, diastolic: 90, heartRate: 80, temperature: 98.4, spo2: 98 },
  { date: "Nov", systolic: 150, diastolic: 94, heartRate: 84, temperature: 98.5, spo2: 97 },
  { date: "Dec", systolic: 144, diastolic: 89, heartRate: 79, temperature: 98.6, spo2: 98 },
  { date: "Jan", systolic: 146, diastolic: 91, heartRate: 81, temperature: 98.3, spo2: 98 },
  { date: "Feb", systolic: 142, diastolic: 88, heartRate: 78, temperature: 98.4, spo2: 98 },
];
