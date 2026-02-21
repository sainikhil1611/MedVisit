import { mockEMR } from "@/lib/mockData";
import { FileText, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EMRDocumentProps {
  approved: boolean;
  onApprove: () => void;
}

const EMRDocument = ({ approved, onApprove }: EMRDocumentProps) => {
  const emr = mockEMR;

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

        {/* Assessment */}
        <div className="px-6 py-4">
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assessment</h4>
          <div className="space-y-1">
            {emr.assessment.split("\n").map((line, i) => (
              <p key={i} className="text-sm text-foreground leading-relaxed">{line}</p>
            ))}
          </div>
        </div>

        {/* Plan */}
        <div className="px-6 py-4">
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan</h4>
          <div className="space-y-1">
            {emr.plan.split("\n").map((line, i) => (
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
