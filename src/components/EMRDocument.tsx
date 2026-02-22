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
  "General: Alert and oriented x3, well-nourished, in no acute distress. HEENT: Normocephalic, atraumatic, pupils equal and reactive. Neck: Supple, no lymphadenopathy. Cardiovascular: Regular rate and rhythm, no murmurs, rubs, or gallops. Pulmonary: Clear to auscultation bilaterally. Abdomen: Soft, non-tender, non-distended, normoactive bowel sounds. Extremities: No edema, peripheral pulses 2+ bilaterally. Skin: Warm and dry, no rashes.",
  "General: Well-appearing, cooperative, no acute distress. Vitals reviewed and documented. HEENT: Mucous membranes moist, oropharynx clear. Cardiovascular: S1/S2 regular, no extra sounds. Lungs: Breath sounds clear, no wheezes or crackles. Abdomen: Non-tender with no organomegaly. Neurological: Cranial nerves II–XII grossly intact. Musculoskeletal: Full ROM in all extremities, no joint swelling.",
  "General: NAD, AAOx3, well-developed and well-nourished. CV: RRR without murmur. Respiratory: CTAB, no adventitious sounds. GI: Abdomen soft, BS present in all four quadrants, no guarding or rigidity. MSK: No peripheral edema. Neuro: Intact strength and sensation bilaterally. Integument: No lesions, no signs of infection. Lymphatics: No palpable lymphadenopathy noted in cervical, axillary, or inguinal chains.",
];

const ASSESSMENT_VARIATIONS = [
  "1. Essential hypertension — suboptimally controlled on current regimen; home readings corroborate clinic BP.\n2. Type 2 diabetes mellitus — fair glycemic control; A1c pending for objective trending.\n3. Hyperlipidemia — newly identified via lipid panel; LDL above target for cardiovascular risk tier.\n4. Cardiovascular risk — moderate composite risk; lifestyle and pharmacologic optimization warranted.",
  "1. Hypertension (primary) — BP readings consistently above goal of <130/80 mmHg despite current therapy.\n2. T2DM — glucose variability noted on home log; insulin resistance pattern consistent with current medication response.\n3. Mixed dyslipidemia — elevated LDL-C with borderline triglycerides; statin-eligible based on 10-year ASCVD risk.\n4. Overweight — BMI 29.2; contributing factor to all above comorbidities.",
  "1. Uncontrolled essential hypertension — requires medication titration and continued dietary sodium restriction.\n2. Type 2 diabetes mellitus — currently on oral monotherapy; A1c results will guide need for intensification.\n3. Hypercholesterolemia — LDL 165 mg/dL; initiation of statin therapy indicated per ACC/AHA guidelines.\n4. Increased cardiovascular risk — patient educated on modifiable risk factors and importance of adherence.",
];

const PLAN_VARIATIONS = [
  "1. Uptitrate Lisinopril to 10 mg daily; reassess BP at 4-week follow-up.\n2. Continue Metformin 500 mg BID; await A1c to determine if dose escalation is needed.\n3. Start Atorvastatin 20 mg QHS for lipid management; recheck lipid panel in 3 months.\n4. Consider low-dose Aspirin 81 mg daily pending cardiovascular risk-benefit discussion.\n5. Order fasting lipid panel, CMP, HbA1c, and UA prior to next visit.\n6. Refer to registered dietitian for medical nutrition therapy and carbohydrate counting education.\n7. Return to clinic in 4 weeks or sooner if symptoms worsen.",
  "1. Increase antihypertensive therapy: Lisinopril 5 mg → 10 mg once daily.\n2. Maintain current diabetes regimen; expedite A1c result review and adjust if A1c >7.5%.\n3. Initiate statin therapy with Atorvastatin 20 mg at bedtime; counsel to avoid grapefruit.\n4. Discuss aspirin therapy; defer initiation pending GI risk review at next visit.\n5. Lifestyle: target 30 min moderate aerobic activity 5×/week; reduce dietary saturated fat and refined carbohydrates.\n6. Labs: HbA1c, fasting glucose, CMP, CBC, lipid panel — all to be drawn before next appointment.\n7. Follow-up in 4 weeks; patient instructed to call with any new symptoms.",
  "1. Pharmacologic: Increase Lisinopril 10 mg daily for blood pressure optimization.\n2. Continue Metformin 500 mg twice daily with meals; monitor for GI tolerance.\n3. New prescription: Atorvastatin 20 mg nightly — patient counseled on myopathy warning signs.\n4. Prophylactic antiplatelet therapy with Aspirin 81 mg daily initiated for CV risk reduction.\n5. Nutritional referral placed; patient to schedule with dietitian within 2 weeks.\n6. Pending labs: HbA1c, BMP, fasting lipid panel, microalbumin.\n7. Next office visit in 4 weeks with lab results in hand for medication management review.",
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
