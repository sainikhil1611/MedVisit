import { useState, useCallback } from "react";
import { Upload, Video, CheckCircle2, Loader2, FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoUploadProps {
  onAnalysisComplete: () => void;
}

type UploadStatus = "idle" | "uploading" | "analyzing" | "complete";

const VideoUpload = ({ onAnalysisComplete }: VideoUploadProps) => {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const simulateUpload = useCallback((file: File) => {
    setFileName(file.name);
    setStatus("uploading");
    setProgress(0);

    const uploadInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setStatus("analyzing");
          simulateAnalysis();
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
  }, []);

  const simulateAnalysis = () => {
    let step = 0;
    const steps = ["Extracting audio...", "Transcribing conversation...", "Identifying topics...", "Generating EMR...", "Creating medication plan..."];
    const analysisInterval = setInterval(() => {
      step++;
      if (step >= steps.length) {
        clearInterval(analysisInterval);
        setStatus("complete");
        setTimeout(() => onAnalysisComplete(), 800);
      }
    }, 1200);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) simulateUpload(file);
  }, [simulateUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) simulateUpload(file);
  };

  if (status === "complete") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <CheckCircle2 className="h-8 w-8 text-accent" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-foreground">Analysis Complete</h3>
        <p className="text-sm text-muted-foreground">EMR and medication plan are ready for review</p>
      </div>
    );
  }

  if (status === "analyzing") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-foreground">Analyzing Video</h3>
        <p className="text-sm text-muted-foreground">AI is processing the consultation recording...</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {["Extracting audio", "Transcribing", "Identifying topics", "Generating EMR", "Medication plan"].map((step, i) => (
            <span key={step} className={`rounded-full px-3 py-1 text-xs font-medium ${i < 3 ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
              {step}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (status === "uploading") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <FileVideo className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-foreground">Uploading...</h3>
        <p className="mb-4 text-sm text-muted-foreground">{fileName}</p>
        <div className="h-2 w-64 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <span className="mt-2 text-xs text-muted-foreground">{Math.min(Math.round(progress), 100)}%</span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
        dragActive
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary/40 hover:bg-muted/50"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Video className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-foreground">Upload Consultation Recording</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        Drag and drop a video file or click to browse. Supported formats: MP4, MOV, AVI, WebM.
      </p>
      <label>
        <input type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
        <Button asChild>
          <span className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Select Video File
          </span>
        </Button>
      </label>
    </div>
  );
};

export default VideoUpload;
