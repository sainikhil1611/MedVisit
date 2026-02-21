import { useState, useCallback, useRef } from "react";
import { Upload, Video, CheckCircle2, Loader2, FileVideo, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadVideo, getUploadStatus, VIDEO_ID_KEY } from "@/lib/api";

interface VideoUploadProps {
  onAnalysisComplete: (videoId: string) => void;
}

type UploadStatus = "idle" | "uploading" | "analyzing" | "complete" | "error";

const POLL_INTERVAL_MS = 3000;

const VideoUpload = ({ onAnalysisComplete }: VideoUploadProps) => {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopProgressAnimation = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const startProgressAnimation = () => {
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Cap at 90% until server confirms
        return prev + Math.random() * 8 + 3;
      });
    }, 300);
  };

  const pollStatus = useCallback(
    async (taskId: string, videoId: string) => {
      try {
        const result = await getUploadStatus(taskId);
        if (result.status === "ready") {
          const resolvedVideoId = result.video_id || videoId;
          localStorage.setItem(VIDEO_ID_KEY, resolvedVideoId);
          setStatus("complete");
          setTimeout(() => onAnalysisComplete(resolvedVideoId), 800);
        } else if (result.status === "failed") {
          stopProgressAnimation();
          setStatus("error");
          setErrorMsg(result.error || "Processing failed. Please try again.");
        } else {
          // Still indexing — poll again
          pollTimeoutRef.current = setTimeout(() => pollStatus(taskId, videoId), POLL_INTERVAL_MS);
        }
      } catch {
        stopProgressAnimation();
        setStatus("error");
        setErrorMsg("Could not reach the server. Is the backend running?");
      }
    },
    [onAnalysisComplete]
  );

  const handleFile = useCallback(
    async (file: File) => {
      setFileName(file.name);
      setStatus("uploading");
      setProgress(0);
      setErrorMsg("");
      startProgressAnimation();

      try {
        const result = await uploadVideo(file, "appt-001", "patient-001", "doctor-001");
        stopProgressAnimation();
        setProgress(100);
        setStatus("analyzing");
        // Start polling for indexing completion
        pollTimeoutRef.current = setTimeout(
          () => pollStatus(result.task_id, result.video_id),
          POLL_INTERVAL_MS
        );
      } catch (e) {
        stopProgressAnimation();
        setStatus("error");
        setErrorMsg(e instanceof Error ? e.message : "Upload failed. Is the backend running?");
      }
    },
    [pollStatus]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-destructive/40 bg-destructive/5 p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-foreground">Upload Failed</h3>
        <p className="mb-4 text-sm text-muted-foreground">{errorMsg}</p>
        <Button variant="outline" onClick={() => setStatus("idle")}>Try Again</Button>
      </div>
    );
  }

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
