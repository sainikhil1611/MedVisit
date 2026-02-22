import { useQuery } from "@tanstack/react-query";
import { getSOAP, VIDEO_ID_KEY } from "@/lib/api";
import { ClipboardList, Loader2, AlertTriangle } from "lucide-react";

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
          const content = data[section.key];
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
