import { useState } from "react";
import VideoUpload from "@/components/VideoUpload";
import EMRDocument from "@/components/EMRDocument";
import MedicationPlanDoctor from "@/components/MedicationPlanDoctor";

type DoctorStep = "upload" | "review";

const DoctorView = () => {
  const [step, setStep] = useState<DoctorStep>("upload");
  const [emrApproved, setEmrApproved] = useState(false);
  const [medPublished, setMedPublished] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Doctor Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload a consultation recording to generate EMR and medication plan
        </p>
      </div>

      {step === "upload" && (
        <VideoUpload onAnalysisComplete={() => setStep("review")} />
      )}

      {step === "review" && (
        <div className="space-y-6">
          <EMRDocument approved={emrApproved} onApprove={() => setEmrApproved(true)} />
          {emrApproved && (
            <MedicationPlanDoctor
              published={medPublished}
              onPublish={() => setMedPublished(true)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorView;
