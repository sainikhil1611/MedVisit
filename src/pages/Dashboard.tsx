import { useState } from "react";
import {
  Heart, Activity, Wind, Thermometer, Scale, Droplets,
  User, Calendar, Shield, AlertTriangle, FileText, Pill,
  ClipboardList, FlaskConical, TrendingDown, TrendingUp, Minus,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  patientProfile as defaultPatientProfile,
  vitalSigns as defaultVitalSigns,
  icd10Codes as defaultICD10Codes,
  allergies as defaultAllergies,
  labTests as defaultLabTests,
  medications as defaultMedications,
  planOfCare as defaultPlanOfCare,
  vitalTrends
} from "@/lib/dashboardData";
import { DocumentUpload } from "@/components/DocumentUpload";
import type { DashboardData } from "@/lib/api";

const vitalIcons: Record<string, React.ReactNode> = {
  heart: <Heart className="h-5 w-5" />,
  activity: <Activity className="h-5 w-5" />,
  wind: <Wind className="h-5 w-5" />,
  thermometer: <Thermometer className="h-5 w-5" />,
  scale: <Scale className="h-5 w-5" />,
  droplets: <Droplets className="h-5 w-5" />,
};

const statusColor = {
  normal: "text-success",
  warning: "text-warning",
  critical: "text-destructive",
};

const statusBg = {
  normal: "bg-success/10",
  warning: "bg-warning/10",
  critical: "bg-destructive/10",
};

const severityBadge = {
  mild: "bg-info/10 text-info border-info/20",
  moderate: "bg-warning/10 text-warning border-warning/20",
  severe: "bg-destructive/10 text-destructive border-destructive/20",
};

const icdStatusBadge = {
  active: "bg-destructive/10 text-destructive border-destructive/20",
  chronic: "bg-warning/10 text-warning border-warning/20",
  resolved: "bg-success/10 text-success border-success/20",
};

const labStatusBadge = {
  pending: "bg-info/10 text-info border-info/20",
  completed: "bg-success/10 text-success border-success/20",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
};

const bpChartConfig = {
  systolic: { label: "Systolic", color: "hsl(0 72% 51%)" },
  diastolic: { label: "Diastolic", color: "hsl(205 85% 50%)" },
};

const hrChartConfig = {
  heartRate: { label: "Heart Rate", color: "hsl(152 55% 42%)" },
};

const pieColors = [
  "hsl(174 42% 35%)",
  "hsl(205 85% 50%)",
  "hsl(38 92% 50%)",
  "hsl(152 55% 42%)",
  "hsl(0 72% 51%)",
];

const Dashboard = () => {
  // State for dashboard data
  const [patientProfile, setPatientProfile] = useState(defaultPatientProfile);
  const [vitalSigns, setVitalSigns] = useState(defaultVitalSigns);
  const [icd10Codes, setIcd10Codes] = useState(defaultICD10Codes);
  const [allergies, setAllergies] = useState(defaultAllergies);
  const [labTests, setLabTests] = useState(defaultLabTests);
  const [medications, setMedications] = useState(defaultMedications);
  const [planOfCare, setPlanOfCare] = useState(defaultPlanOfCare);

  // Calculate diagnosis data based on current ICD-10 codes
  const diagnosisData = icd10Codes.filter(c => c.status !== "resolved").map((c, i) => ({
    name: c.description.split(" ").slice(0, 2).join(" "),
    value: 1,
    code: c.code,
    full: c.description,
  }));

  const handleDocumentUpload = (data: DashboardData) => {
    // Update all dashboard data from uploaded document
    if (data.patientProfile) setPatientProfile(data.patientProfile);
    if (data.vitalSigns) setVitalSigns(data.vitalSigns);
    if (data.icd10Codes) setIcd10Codes(data.icd10Codes);
    if (data.allergies) setAllergies(data.allergies);
    if (data.labTests) setLabTests(data.labTests);
    if (data.medications) setMedications(data.medications);
    if (data.planOfCare) setPlanOfCare(data.planOfCare);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Patient Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">Comprehensive overview of patient health metrics and clinical data</p>
      </div>

      {/* Document Upload Section */}
      <DocumentUpload onUploadSuccess={handleDocumentUpload} />

      {/* Patient Profile Banner */}
      <Card className="overflow-hidden border-primary/20">
        <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-transparent p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                <User className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{patientProfile.name}</h2>
                <p className="text-sm text-muted-foreground">{patientProfile.mrn}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
              {[
                { label: "DOB", value: patientProfile.dob },
                { label: "Age", value: `${patientProfile.age} yrs` },
                { label: "Sex", value: patientProfile.sex },
                { label: "Physician", value: patientProfile.primaryPhysician },
              ].map(item => (
                <div key={item.label}>
                  <span className="text-muted-foreground">{item.label}</span>
                  <p className="font-medium text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Vital Signs Grid */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-foreground">Vital Signs</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {vitalSigns.map(vital => (
            <Card key={vital.label} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${statusBg[vital.status]} ${statusColor[vital.status]}`}>
                  {vitalIcons[vital.icon]}
                </div>
                <p className="text-xs text-muted-foreground">{vital.label}</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold text-foreground">{vital.value}</span>
                  <span className="text-xs text-muted-foreground">{vital.unit}</span>
                </div>
                {vital.status !== "normal" && (
                  <div className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusBg[vital.status]} ${statusColor[vital.status]}`}>
                    <AlertTriangle className="h-2.5 w-2.5" />
                    {vital.status}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* BP Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Blood Pressure Trend</CardTitle>
            <CardDescription>6-month systolic/diastolic tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={bpChartConfig} className="h-[220px] w-full">
              <LineChart data={vitalTrends} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(210 10% 46%)" }} />
                <YAxis domain={[70, 160]} tick={{ fill: "hsl(210 10% 46%)" }} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="systolic" stroke="var(--color-systolic)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="diastolic" stroke="var(--color-diastolic)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Heart Rate Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Heart Rate Trend</CardTitle>
            <CardDescription>6-month resting heart rate</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={hrChartConfig} className="h-[220px] w-full">
              <BarChart data={vitalTrends} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fill: "hsl(210 10% 46%)" }} className="text-xs" />
                <YAxis domain={[60, 100]} tick={{ fill: "hsl(210 10% 46%)" }} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="heartRate" fill="var(--color-heartRate)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section: ICD-10, Allergies, Diagnosis Pie */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* ICD-10 Codes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" />
              ICD-10 Codes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {icd10Codes.map(code => (
              <div key={code.code} className="flex items-start justify-between gap-2 rounded-lg border border-border p-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-primary">{code.code}</span>
                    <Badge variant="outline" className={`text-[10px] ${icdStatusBadge[code.status]}`}>
                      {code.status}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{code.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Allergies */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-destructive" />
              Allergies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allergies.map(allergy => (
              <div key={allergy.name} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{allergy.name}</span>
                  <Badge variant="outline" className={`text-[10px] ${severityBadge[allergy.severity]}`}>
                    {allergy.severity}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Reaction: {allergy.reaction}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Active Diagnoses Pie */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4 text-primary" />
              Active Diagnoses
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={diagnosisData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {diagnosisData.map((_, index) => (
                      <Cell key={index} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <div className="px-6 pb-4">
            <div className="space-y-1.5">
              {diagnosisData.map((d, i) => (
                <div key={d.code} className="flex items-center gap-2 text-xs">
                  <div className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: pieColors[i] }} />
                  <span className="text-muted-foreground">{d.full}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Section: Medications, Labs, Plan of Care */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Medications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Pill className="h-4 w-4 text-primary" />
              Current Medications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {medications.map(med => (
              <div key={med.name} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{med.name}</p>
                  <p className="text-xs text-muted-foreground">{med.dosage} · {med.frequency}</p>
                </div>
                <Badge
                  variant="outline"
                  className={med.status === "new" ? "border-info/20 bg-info/10 text-info text-[10px]" : "border-success/20 bg-success/10 text-success text-[10px]"}
                >
                  {med.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Lab Tests */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="h-4 w-4 text-primary" />
              Lab Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {labTests.map(test => (
              <div key={test.name} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{test.name}</span>
                  <Badge variant="outline" className={`text-[10px] ${labStatusBadge[test.status]}`}>
                    {test.status}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{test.date}</span>
                  {test.result && <span className="font-medium text-success">{test.result}</span>}
                  {!test.result && test.normalRange && <span>Range: {test.normalRange}</span>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Plan of Care */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4 text-primary" />
              Plan of Care
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {planOfCare.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground leading-snug">{item}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
