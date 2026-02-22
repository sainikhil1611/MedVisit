import { useState } from "react";
import VideoUpload from "@/components/VideoUpload";
import SOAPSummaryDoctor from "@/components/SOAPSummaryDoctor";
import MedicationPlanDoctor from "@/components/MedicationPlanDoctor";
import { VIDEO_ID_KEY } from "@/lib/api";

type DoctorStep = "upload" | "review";

const DoctorView = () => {
  const [step, setStep] = useState<DoctorStep>("upload");
  const [medPublished, setMedPublished] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(
    () => localStorage.getItem(VIDEO_ID_KEY)
  );

  const handleAnalysisComplete = (vid: string) => {
    setVideoId(vid);
    setStep("review");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Doctor Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload a consultation recording to generate a SOAP note and medication plan
        </p>
      </div>

      {step === "upload" && (
        <>
          <VideoUpload onAnalysisComplete={handleAnalysisComplete} />
          {videoId && (
            <div className="flex justify-center">
              <button
                className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                onClick={() => setStep("review")}
              >
                Resume previous session
              </button>
            </div>
          )}
        </>
      )}

      {step === "review" && (
        <div className="space-y-6">
          <SOAPSummaryDoctor videoId={videoId} />
          <MedicationPlanDoctor
            videoId={videoId}
            published={medPublished}
            onPublish={() => setMedPublished(true)}
          />
        </div>
      )}
    </div>
  );
};

export default DoctorView;
