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
  name: "Sarah Johnson",
  dob: "March 15, 1978",
  age: 47,
  sex: "Female",
  mrn: "MRN-2024-08491",
  primaryPhysician: "Dr. Michael Chen",
  insuranceProvider: "BlueCross BlueShield",
  lastVisit: "February 21, 2026",
};

export const vitalSigns: VitalSign[] = [
  { label: "Blood Pressure", value: "142/88", unit: "mmHg", status: "warning", icon: "heart" },
  { label: "Heart Rate", value: "78", unit: "bpm", status: "normal", icon: "activity" },
  { label: "Respiratory Rate", value: "16", unit: "breaths/min", status: "normal", icon: "wind" },
  { label: "Temperature", value: "98.4", unit: "°F", status: "normal", icon: "thermometer" },
  { label: "BMI", value: "29.2", unit: "kg/m²", status: "warning", icon: "scale" },
  { label: "SpO2", value: "98", unit: "%", status: "normal", icon: "droplets" },
];

export const icd10Codes: ICD10Code[] = [
  { code: "I10", description: "Essential (primary) hypertension", status: "active" },
  { code: "E11.9", description: "Type 2 diabetes mellitus without complications", status: "active" },
  { code: "E78.5", description: "Hyperlipidemia, unspecified", status: "active" },
  { code: "E66.01", description: "Morbid obesity due to excess calories", status: "chronic" },
  { code: "R51.9", description: "Headache, unspecified", status: "resolved" },
];

export const allergies: Allergy[] = [
  { name: "Penicillin", severity: "severe", reaction: "Anaphylaxis" },
  { name: "Sulfa drugs", severity: "moderate", reaction: "Rash, hives" },
  { name: "Latex", severity: "mild", reaction: "Contact dermatitis" },
];

export const labTests: LabTest[] = [
  { name: "HbA1c", status: "pending", date: "Mar 21, 2026", normalRange: "< 5.7%" },
  { name: "Lipid Panel", status: "pending", date: "Mar 21, 2026", normalRange: "LDL < 100 mg/dL" },
  { name: "Complete Metabolic Panel", status: "completed", date: "Feb 21, 2026", result: "Normal", normalRange: "—" },
  { name: "CBC with Differential", status: "completed", date: "Feb 21, 2026", result: "Normal", normalRange: "—" },
  { name: "Thyroid Panel (TSH)", status: "overdue", date: "Jan 15, 2026", normalRange: "0.4–4.0 mIU/L" },
];

export const medications = [
  { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", status: "active" },
  { name: "Metformin", dosage: "500mg", frequency: "Twice daily", status: "active" },
  { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", status: "new" },
  { name: "Aspirin", dosage: "81mg", frequency: "Once daily", status: "new" },
];

export const planOfCare = [
  "Increase Lisinopril to 10mg daily for better BP control",
  "Continue Metformin 500mg BID, reassess after A1c results",
  "Initiate Atorvastatin 20mg daily for hyperlipidemia",
  "Consider low-dose Aspirin 81mg daily for cardiovascular protection",
  "Follow up in 4 weeks with repeat labs",
  "Referral to nutritionist for medical nutrition therapy",
  "Increase walking to 30 min, 5 days/week",
];

export const vitalTrends: VitalTrend[] = [
  { date: "Sep", systolic: 148, diastolic: 92, heartRate: 82, temperature: 98.6, spo2: 97 },
  { date: "Oct", systolic: 145, diastolic: 90, heartRate: 80, temperature: 98.4, spo2: 98 },
  { date: "Nov", systolic: 150, diastolic: 94, heartRate: 84, temperature: 98.5, spo2: 97 },
  { date: "Dec", systolic: 144, diastolic: 89, heartRate: 79, temperature: 98.6, spo2: 98 },
  { date: "Jan", systolic: 146, diastolic: 91, heartRate: 81, temperature: 98.3, spo2: 98 },
  { date: "Feb", systolic: 142, diastolic: 88, heartRate: 78, temperature: 98.4, spo2: 98 },
];
