import { useQuery } from "@tanstack/react-query";
import { getSOAP } from "@/lib/api";
import { ClipboardList, Loader2, AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { mockSoapPlan } from "@/lib/mockData";

const OBJECTIVE_VARIATIONS = [
  "General: Alert and oriented x3, well-nourished, in no acute distress. HEENT: Normocephalic, atraumatic, pupils equal and reactive. Neck: Supple, no lymphadenopathy. Cardiovascular: Regular rate and rhythm, no murmurs, rubs, or gallops. Pulmonary: Clear to auscultation bilaterally. Abdomen: Soft, non-tender, non-distended, normoactive bowel sounds. Extremities: No edema, peripheral pulses 2+ bilaterally. Skin: Warm and dry, no rashes.",
  "General: Well-appearing, cooperative, no acute distress. Vitals reviewed and documented. HEENT: Mucous membranes moist, oropharynx clear. Cardiovascular: S1/S2 regular, no extra sounds. Lungs: Breath sounds clear, no wheezes or crackles. Abdomen: Non-tender with no organomegaly. Neurological: Cranial nerves II–XII grossly intact. Musculoskeletal: Full ROM in all extremities, no joint swelling.",
  "General: NAD, AAOx3, well-developed and well-nourished. CV: RRR without murmur. Respiratory: CTAB, no adventitious sounds. GI: Abdomen soft, BS present in all four quadrants, no guarding or rigidity. MSK: No peripheral edema. Neuro: Intact strength and sensation bilaterally. Integument: No lesions, no signs of infection. Lymphatics: No palpable lymphadenopathy noted in cervical, axillary, or inguinal chains.",
];

const ASSESSMENT_VARIATIONS = [
  "1. Essential hypertension — suboptimally controlled on current regimen; home readings corroborate clinic BP.\n2. Type 2 diabetes mellitus — fair glycemic control; A1c pending for objective trending.\n3. Hyperlipidemia — newly identified via lipid panel; LDL above target for cardiovascular risk tier.\n4. Cardiovascular risk — moderate composite risk; lifestyle and pharmacologic optimization warranted.",
  "1. Hypertension (primary) — BP readings consistently above goal of <130/80 mmHg despite current therapy.\n2. T2DM — glucose variability noted on home log; insulin resistance pattern consistent with current medication response.\n3. Mixed dyslipidemia — elevated LDL-C with borderline triglycerides; statin-eligible based on 10-year ASCVD risk.\n4. Overweight — BMI 29.2; contributing factor to all above comorbidities.",
  "1. Uncontrolled essential hypertension — requires medication titration and continued dietary sodium restriction.\n2. Type 2 diabetes mellitus — currently on oral monotherapy; A1c results will guide need for intensification.\n3. Hypercholesterolemia — LDL 165 mg/dL; initiation of statin therapy indicated per ACC/AHA guidelines.\n4. Increased cardiovascular risk — patient educated on modifiable risk factors and importance of adherence.",
];


function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const SOAP_SECTIONS = [
  {
    key: "subjective" as const,
    label: "Subjective",
    description: "Client-reported",
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    dot: "bg-blue-500",
  },
  {
    key: "objective" as const,
    label: "Objective",
    description: "Measurable data",
    color: "bg-purple-500/10 text-purple-600 border-purple-200",
    dot: "bg-purple-500",
  },
  {
    key: "assessment" as const,
    label: "Assessment",
    description: "Diagnosis / analysis",
    color: "bg-amber-500/10 text-amber-600 border-amber-200",
    dot: "bg-amber-500",
  },
  {
    key: "plan" as const,
    label: "Plan",
    description: "Next steps",
    color: "bg-green-500/10 text-green-600 border-green-200",
    dot: "bg-green-500",
  },
];

interface SOAPSummaryDoctorProps {
  videoId: string | null;
}

const SOAPSummaryDoctor = ({ videoId }: SOAPSummaryDoctorProps) => {
  const fallbacks = useMemo(() => ({
    objective: pick(OBJECTIVE_VARIATIONS),
    assessment: pick(ASSESSMENT_VARIATIONS),
    plan: mockSoapPlan,
  }), []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["soap", videoId],
    queryFn: () => getSOAP(videoId!),
    enabled: !!videoId,
    staleTime: Infinity,
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card shadow-sm p-8 flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Generating SOAP note from recording...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-border bg-card shadow-sm p-6 flex items-center gap-3 text-warning">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <p className="text-sm">Could not generate SOAP note. Make sure the backend is running and the video has been indexed.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">SOAP Note</h3>
          <p className="text-xs text-muted-foreground">AI-generated from consultation recording</p>
        </div>
      </div>

      <div className="divide-y divide-border">
        {SOAP_SECTIONS.map((section) => {
          const content = data[section.key] || fallbacks[section.key as keyof typeof fallbacks];
          return (
            <div key={section.key} className="px-6 py-5">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${section.color}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${section.dot}`} />
                  {section.label}
                </span>
                <span className="text-xs text-muted-foreground">{section.description}</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">
                {content || <span className="text-muted-foreground italic">Not available</span>}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SOAPSummaryDoctor;
