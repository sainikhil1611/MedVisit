import { useState, useRef } from "react";
import { mockTopics, mockTimestamps, mockMedications, mockDoctorSummary, formatTime } from "@/lib/mockData";
import { Heart, Pill, Apple, CalendarDays, Activity, Stethoscope, Clock, PlayCircle, FileText, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, React.ReactNode> = {
  heart: <Heart className="h-5 w-5" />,
  pill: <Pill className="h-5 w-5" />,
  apple: <Apple className="h-5 w-5" />,
  calendar: <CalendarDays className="h-5 w-5" />,
  activity: <Activity className="h-5 w-5" />,
};

const PatientView = () => {
  const [activeSection, setActiveSection] = useState<string>("topics");
  const videoRef = useRef<HTMLVideoElement>(null);

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  const sections = [
    { id: "topics", label: "Topics Covered", icon: <FileText className="h-4 w-4" /> },
    { id: "summary", label: "Doctor Summary", icon: <Stethoscope className="h-4 w-4" /> },
    { id: "medications", label: "Medication Plan", icon: <Pill className="h-4 w-4" /> },
    { id: "navigate", label: "Navigate Your Visit", icon: <PlayCircle className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Your Visit Summary
        </h1>
        <p className="text-sm text-muted-foreground">
          February 21, 2026 · Dr. Michael Chen
        </p>
      </div>

      {/* Video Player */}
      <div className="overflow-hidden rounded-2xl border border-border bg-foreground/5">
        <video
          ref={videoRef}
          className="aspect-video w-full bg-foreground/10"
          controls
          poster=""
        >
          <source src="" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeSection === s.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* Topics Covered */}
      {activeSection === "topics" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {mockTopics.map((topic) => (
            <div key={topic.id} className="group rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {iconMap[topic.icon] || <Activity className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{topic.title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{topic.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Doctor Summary */}
      {activeSection === "summary" && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Summary from Dr. Michael Chen</h3>
          </div>
          <div className="space-y-3">
            {mockDoctorSummary.split("\n").filter(Boolean).map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed text-foreground/85">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Medication Plan */}
      {activeSection === "medications" && (
        <div className="space-y-3">
          {mockMedications.map((med) => (
            <div key={med.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Pill className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{med.name}</h3>
                    <Badge variant="outline" className="text-xs">{med.dosage}</Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{med.frequency} · {med.duration}</p>
                  {med.notes && (
                    <p className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">{med.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigate Your Visit */}
      {activeSection === "navigate" && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="divide-y divide-border">
            {mockTimestamps.map((ts) => (
              <button
                key={ts.id}
                onClick={() => seekTo(ts.time)}
                className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-2 text-primary">
                  <Clock className="h-4 w-4" />
                  <span className="w-12 text-sm font-mono font-medium">{formatTime(ts.time)}</span>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-foreground">{ts.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{ts.topic}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientView;
