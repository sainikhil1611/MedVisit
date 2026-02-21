export interface Topic {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Timestamp {
  id: string;
  time: number; // seconds
  label: string;
  topic: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
  confidence: number;
  approved: boolean;
}

export interface EMRData {
  patientName: string;
  dateOfVisit: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  assessment: string;
  plan: string;
  vitals: { label: string; value: string }[];
}

export const mockTopics: Topic[] = [
  { id: "1", title: "Blood Pressure Management", description: "Discussion about current BP readings and lifestyle modifications", icon: "heart" },
  { id: "2", title: "Medication Review", description: "Review of current medications and potential adjustments", icon: "pill" },
  { id: "3", title: "Diet & Nutrition", description: "Dietary recommendations for cardiovascular health", icon: "apple" },
  { id: "4", title: "Follow-up Schedule", description: "Planning next appointment and lab work", icon: "calendar" },
  { id: "5", title: "Exercise Recommendations", description: "Safe exercise routines and activity levels", icon: "activity" },
];

export const mockTimestamps: Timestamp[] = [
  { id: "1", time: 12, label: "Introduction & Check-in", topic: "General" },
  { id: "2", time: 45, label: "Blood Pressure Discussion", topic: "Blood Pressure Management" },
  { id: "3", time: 120, label: "Current Medications Review", topic: "Medication Review" },
  { id: "4", time: 210, label: "New Medication Discussion", topic: "Medication Review" },
  { id: "5", time: 305, label: "Dietary Guidelines", topic: "Diet & Nutrition" },
  { id: "6", time: 420, label: "Exercise Plan", topic: "Exercise Recommendations" },
  { id: "7", time: 510, label: "Follow-up Scheduling", topic: "Follow-up Schedule" },
  { id: "8", time: 570, label: "Questions & Wrap-up", topic: "General" },
];

export const mockMedications: Medication[] = [
  { id: "1", name: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "Ongoing", notes: "Take in the morning. Monitor for dizziness.", confidence: 0.95, approved: false },
  { id: "2", name: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "Ongoing", notes: "Take with meals to reduce GI side effects.", confidence: 0.88, approved: false },
  { id: "3", name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", duration: "3 months then reassess", notes: "Take at bedtime. Avoid grapefruit.", confidence: 0.72, approved: false },
  { id: "4", name: "Aspirin", dosage: "81mg", frequency: "Once daily", duration: "Ongoing", notes: "Low-dose for cardiovascular protection.", confidence: 0.65, approved: false },
];

export const mockEMR: EMRData = {
  patientName: "Sarah Johnson",
  dateOfVisit: "February 21, 2026",
  chiefComplaint: "Routine follow-up for hypertension and type 2 diabetes management",
  historyOfPresentIllness: "Patient presents for a scheduled follow-up. Reports generally feeling well. Notes occasional morning headaches (2-3 per week) and mild fatigue in the afternoons. Has been monitoring blood pressure at home with readings averaging 142/88 mmHg. Blood glucose readings have been variable, ranging from 110-180 mg/dL fasting. Patient reports adherence to current medication regimen. Diet has improved with reduced sodium intake. Exercise limited to walking 20 minutes, 3 times per week.",
  assessment: "1. Essential hypertension - suboptimally controlled\n2. Type 2 diabetes mellitus - fair control, A1c pending\n3. Hyperlipidemia - newly identified, LDL 165 mg/dL\n4. Cardiovascular risk assessment - moderate risk profile",
  plan: "1. Increase Lisinopril from 5mg to 10mg daily for better BP control\n2. Continue Metformin 500mg BID, reassess after A1c results\n3. Initiate Atorvastatin 20mg daily for hyperlipidemia\n4. Consider low-dose Aspirin 81mg daily for cardiovascular protection\n5. Follow up in 4 weeks with repeat labs\n6. Referral to nutritionist for medical nutrition therapy",
  vitals: [
    { label: "Blood Pressure", value: "142/88 mmHg" },
    { label: "Heart Rate", value: "78 bpm" },
    { label: "Temperature", value: "98.4°F" },
    { label: "Weight", value: "185 lbs" },
    { label: "BMI", value: "29.2" },
    { label: "SpO2", value: "98%" },
  ],
};

export const mockDoctorSummary = `During today's visit, we reviewed your current health status focusing on blood pressure management and diabetes care. Your blood pressure has been slightly elevated, so we're adjusting your medication to help bring it to a healthier range. We also discussed your cholesterol levels and decided to start a new medication to help manage that. 

Key takeaways from your visit:
• Your blood pressure medication is being increased for better control
• A new cholesterol medication is being started
• Continue your diabetes medication as prescribed
• Focus on reducing sodium in your diet
• Gradually increase walking to 30 minutes, 5 days per week
• Lab work will be needed before your next visit in 4 weeks`;

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
