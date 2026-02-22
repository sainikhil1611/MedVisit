import { mockEMR } from "@/lib/mockData";
import { FileText, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

interface EMRDocumentProps {
  approved: boolean;
  onApprove: () => void;
}

const OBJECTIVE_VARIATIONS = [
  "General: Alert and oriented, mildly uncomfortable due to nausea, no acute hemodynamic distress. Vitals: T 37.0°C, BP 122/78, HR 92, RR 16, SpO2 98%. HEENT: Mucous membranes moist, oropharynx clear. Cardiovascular: S1/S2 regular, no murmurs. Pulmonary: Clear to auscultation bilaterally. Abdomen: Mild epigastric tenderness on palpation, normoactive bowel sounds in all quadrants, no guarding, rigidity, or rebound tenderness. No hepatosplenomegaly. Extremities: No edema. Skin: Warm and dry, no rashes.",
  "General: Mildly ill-appearing, cooperative, in no severe distress. Vitals: T 37.8°C (slightly elevated), BP 130/84, HR 96, RR 18, SpO2 97%. HEENT: Mild pharyngeal erythema, no exudates, no sinus tenderness on percussion. Neck: Supple, no lymphadenopathy. Cardiovascular: RRR, no extra heart sounds. Pulmonary: Clear to auscultation bilaterally, no wheezes or crackles. Abdomen: Soft, non-tender, normoactive bowel sounds. Neurological: No focal deficits; cranial nerves grossly intact.",
  "General: Alert and oriented x3, mild distress consistent with reported pain. Vitals: T 37.6°C, BP 128/82, HR 90, RR 17, SpO2 98%. HEENT: Oropharynx mildly erythematous; rhinorrhea noted. Cardiovascular: S1/S2 regular. Lungs: CTAB. GI: Abdomen soft, mild tenderness in epigastric region, bowel sounds present in all four quadrants, no organomegaly. MSK: No peripheral edema. Skin: Warm, no rashes or lesions.",
];

const ASSESSMENT_VARIATIONS = [
  "1. Acute gastroenteritis — most likely food-borne illness secondary to seafood and pasta ingestion at anniversary dinner; presentation consistent with bacterial or toxin-mediated food poisoning.\n2. Nausea and vomiting — without associated diarrhea; patient hemodynamically stable with no signs of significant dehydration.\n3. No known drug or food allergies — documented and noted.",
  "1. Viral upper respiratory infection — three-day history of chest pain, severe headaches, and frequent sneezing with low-grade fever; clinical picture consistent with viral etiology.\n2. Low-grade fever (T 37.8°C) — supportive of infectious process; bacterial superinfection not suspected at this time.\n3. Penicillin allergy — confirmed and prominently documented; all penicillin-class antibiotics contraindicated.",
  "1. Acute gastrointestinal illness — food poisoning presentation following consumption of seafood dish; nausea and vomiting without diarrhea, no dehydration signs at time of exam.\n2. Viral syndrome — overlapping presentation in concurrent patient encounter; rhinorrhea, headache, chest discomfort, and low-grade fever consistent with viral upper respiratory tract infection.\n3. Penicillin allergy (second patient) — allergy confirmed; prescribing decisions adjusted accordingly.",
];

const PLAN_VARIATIONS = [
  "1. Strict bowel rest: avoid all solid foods and dairy products for 24 hours.\n2. Oral rehydration: maintain hydration with water or black tea with sugar; small frequent sips encouraged.\n3. Gradual dietary reintroduction with bland foods (e.g., toast, rice) after 24-hour rest period as tolerated.\n4. OTC antiemetic (e.g., dimenhydrinate) as needed for nausea relief.\n5. Prescribe stronger analgesic (non-penicillin class) for headache management in concurrent patient.\n6. Bed rest for 2–3 days; avoid strenuous activity.\n7. Return for blood work (CBC, CMP, viral panel) if symptoms persist beyond 72 hours.\n8. Patient instructed to seek emergency care if vomiting becomes uncontrollable, signs of dehydration develop, or chest pain worsens significantly.",
  "1. NPO for solid foods and dairy for 24 hours; advance diet as tolerated starting with clear liquids.\n2. Hydration with water or sweetened black tea; avoid caffeinated beverages and acidic drinks.\n3. Analgesic therapy: prescribe stronger pain relief for severe headache; counsel on dosing schedule and maximum daily dose.\n4. Bed rest recommended for 2 to 3 days; limit physical exertion.\n5. Penicillin allergy confirmed and documented — all penicillin-class antibiotics strictly contraindicated for this patient.\n6. Order blood tests (CBC, CRP, viral screen) if symptoms do not improve within 3 days.\n7. Patient educated on warning signs: return immediately for worsening chest pain, high fever (>39°C), or new neurological symptoms.",
  "1. Dietary modification: NPO for solids and dairy 24 hours; rehydrate with water or black tea with sugar; reintroduce bland diet gradually.\n2. Rest at home; avoid activity for 24 hours minimum.\n3. Analgesics prescribed for headache pain management (non-penicillin antibiotic class avoided per allergy documentation).\n4. Bed rest 2–3 days for viral symptom management; antipyretics as needed for fever.\n5. Follow-up blood tests (CBC, metabolic panel) scheduled if no symptomatic improvement by day 3.\n6. Both patients counseled on adequate hydration and monitoring symptom trajectory.\n7. Return to clinic immediately if: severe dehydration, chest pain radiating to arm or jaw, fever spiking above 39°C, or altered mental status.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const EMRDocument = ({ approved, onApprove }: EMRDocumentProps) => {
  const emr = mockEMR;
  const objective = useMemo(() => pick(OBJECTIVE_VARIATIONS), []);
  const assessment = useMemo(() => pick(ASSESSMENT_VARIATIONS), []);
  const plan = useMemo(() => pick(PLAN_VARIATIONS), []);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Electronic Medical Record</h3>
            <p className="text-xs text-muted-foreground">{emr.dateOfVisit} · {emr.patientName}</p>
          </div>
        </div>
        {approved ? (
          <Badge className="bg-success/10 text-success border-success/20 gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approved
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1.5 text-warning border-warning/30">
            <Clock className="h-3.5 w-3.5" />
            Pending Review
          </Badge>
        )}
      </div>

      <div className="divide-y divide-border">
        {/* Vitals */}
        <div className="px-6 py-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vitals</h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {emr.vitals.map((v) => (
              <div key={v.label} className="rounded-lg bg-muted/50 px-3 py-2">
                <span className="block text-xs text-muted-foreground">{v.label}</span>
                <span className="text-sm font-semibold text-foreground">{v.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chief Complaint */}
        <div className="px-6 py-4">
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chief Complaint</h4>
          <p className="text-sm text-foreground leading-relaxed">{emr.chiefComplaint}</p>
        </div>

        {/* HPI */}
        <div className="px-6 py-4">
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">History of Present Illness</h4>
          <p className="text-sm text-foreground leading-relaxed">{emr.historyOfPresentIllness}</p>
        </div>

        {/* Objective */}
        <div className="px-6 py-4">
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Objective</h4>
          <p className="text-sm text-foreground leading-relaxed">{objective}</p>
        </div>

        {/* Assessment */}
        <div className="px-6 py-4">
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assessment</h4>
          <div className="space-y-1">
            {assessment.split("\n").map((line, i) => (
              <p key={i} className="text-sm text-foreground leading-relaxed">{line}</p>
            ))}
          </div>
        </div>

        {/* Plan */}
        <div className="px-6 py-4">
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan</h4>
          <div className="space-y-1">
            {plan.split("\n").map((line, i) => (
              <p key={i} className="text-sm text-foreground leading-relaxed">{line}</p>
            ))}
          </div>
        </div>
      </div>

      {!approved && (
        <div className="border-t border-border bg-muted/30 px-6 py-4">
          <Button onClick={onApprove} className="w-full sm:w-auto">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Approve EMR Document
          </Button>
        </div>
      )}
    </div>
  );
};

export default EMRDocument;
