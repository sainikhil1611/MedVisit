import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { mockTopics, mockTimestamps, mockMedications, mockDoctorSummary, formatTime } from "@/lib/mockData";
import type { Topic, Timestamp, Medication } from "@/lib/mockData";
import { Heart, Pill, Apple, CalendarDays, Activity, Stethoscope, Clock, PlayCircle, FileText, ChevronRight, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getGist, getSummary, getChapters, getVideoInfo, searchVideo, VIDEO_ID_KEY, AIMedication, SearchClip } from "@/lib/api";
import { TTSPlayer } from "@/components/TTSPlayer";

const iconMap: Record<string, React.ReactNode> = {
  heart: <Heart className="h-5 w-5" />,
  pill: <Pill className="h-5 w-5" />,
  apple: <Apple className="h-5 w-5" />,
  calendar: <CalendarDays className="h-5 w-5" />,
  activity: <Activity className="h-5 w-5" />,
};

const TOPIC_ICONS = ["heart", "pill", "apple", "calendar", "activity"];

function topicsFromStrings(rawTopics: string[]): Topic[] {
  return rawTopics.map((t, i) => ({
    id: String(i + 1),
    title: t,
    description: "",
    icon: TOPIC_ICONS[i % TOPIC_ICONS.length],
  }));
}

function chaptersToTimestamps(chapters: { start: number; end: number; title: string; summary: string }[]): Timestamp[] {
  return chapters.map((ch, i) => ({
    id: String(i + 1),
    time: ch.start,
    label: ch.title,
    topic: ch.summary,
  }));
}

function aiMedsToPatientMedications(meds: AIMedication[]): Medication[] {
  return meds.map((m, i) => ({
    id: String(i + 1),
    name: m.name,
    dosage: m.dosage,
    frequency: m.frequency,
    duration: "As prescribed",
    notes: [m.purpose, m.instructions].filter(Boolean).join(" · "),
    confidence: m.confidence ?? 0.85,
    approved: true,
  }));
}

const STALE = Infinity;

const PatientView = () => {
  const [activeSection, setActiveSection] = useState<string>("topics");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchClip[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const videoId = localStorage.getItem(VIDEO_ID_KEY);

  // --- Cached queries (staleTime: Infinity → never refetch while cached) ---

  const { data: gistData, isLoading: loadingTopics } = useQuery({
    queryKey: ["gist", videoId],
    queryFn: () => getGist(videoId!),
    enabled: !!videoId,
    staleTime: STALE,
  });

  const { data: summaryData, isLoading: loadingSummary } = useQuery({
    queryKey: ["summary", videoId],
    queryFn: () => getSummary(videoId!),
    enabled: !!videoId,
    staleTime: STALE,
    retry: false,
  });

  const { data: chaptersData, isLoading: loadingChapters } = useQuery({
    queryKey: ["chapters", videoId],
    queryFn: () => getChapters(videoId!),
    enabled: !!videoId,
    staleTime: STALE,
    retry: false,
  });

  const { data: videoInfo } = useQuery({
    queryKey: ["videoInfo", videoId],
    queryFn: () => getVideoInfo(videoId!),
    enabled: !!videoId,
    staleTime: STALE,
  });

  // Derive display data, falling back to mock when API data isn't available yet
  const topics: Topic[] =
    gistData?.topics?.length ? topicsFromStrings(gistData.topics) : mockTopics;

  const timestamps: Timestamp[] =
    chaptersData?.chapters?.length ? chaptersToTimestamps(chaptersData.chapters) : mockTimestamps;

  const doctorSummary: string =
    summaryData?.summary || mockDoctorSummary;

  const medications: Medication[] =
    summaryData?.medication_plan?.medications?.length
      ? aiMedsToPatientMedications(summaryData.medication_plan.medications)
      : mockMedications;

  // Set stream URL on the video element when it becomes available
  useEffect(() => {
    const url = videoInfo?.stream_url;
    if (!url || !videoRef.current) return;
    videoRef.current.src = url;
  }, [videoInfo]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    setSearchError("");
    setSearchResults(null);
    try {
      const data = await searchVideo(q, videoId);
      setSearchResults(data.results);
    } catch {
      setSearchError("Search failed. Make sure the backend is running.");
    } finally {
      setSearching(false);
    }
  };

  const seekTo = (time: number) => {
    // 1. Scroll the video player into view so the user can see it
    videoContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    // 2. Seek and play after the scroll animation starts
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        videoRef.current.play().catch(() => {
          // Autoplay may be blocked — the user can press play manually
        });
      }
    }, 300);
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
      <div ref={videoContainerRef} className="overflow-hidden rounded-2xl border border-border bg-foreground/5">
        <video
          ref={videoRef}
          className="aspect-video w-full bg-foreground/10"
          controls
          poster={videoInfo?.thumbnail_url ?? undefined}
        >
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
        loadingTopics ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {topics.map((topic) => (
              <div key={topic.id} className="group rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {iconMap[topic.icon] || <Activity className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{topic.title}</h3>
                    {topic.description && (
                      <p className="mt-0.5 text-sm text-muted-foreground">{topic.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Doctor Summary */}
      {activeSection === "summary" && (
        loadingSummary ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Summary from Dr. Michael Chen</h3>
            </div>
            <div className="space-y-3">
              {doctorSummary.split("\n").filter(Boolean).map((paragraph, i) => (
                <p key={i} className="text-sm leading-relaxed text-foreground/85">
                  {paragraph}
                </p>
              ))}
            </div>
            <TTSPlayer text={doctorSummary} />
          </div>
        )
      )}

      {/* Medication Plan */}
      {activeSection === "medications" && (
        loadingSummary ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-3">
            {medications.map((med) => (
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
        )
      )}

      {/* Navigate Your Visit */}
      {activeSection === "navigate" && (
        <div className="space-y-4">
          {/* Search box */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search your visit... e.g. "blood pressure medication"'
              className="flex-1"
            />
            <Button type="submit" disabled={searching || !searchQuery.trim()}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>

          {/* Search results */}
          {searchResults !== null && (
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center gap-2 text-xs text-muted-foreground">
                <Search className="h-3.5 w-3.5" />
                {searchResults.length > 0
                  ? `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""} for "${searchQuery}"`
                  : `No results found for "${searchQuery}"`}
              </div>
              {searchResults.length > 0 && (
                <div className="divide-y divide-border">
                  {searchResults.map((clip, i) => (
                    <button
                      key={i}
                      onClick={() => seekTo(clip.start)}
                      className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2 text-primary pt-0.5 shrink-0">
                        <Clock className="h-4 w-4" />
                        <span className="w-12 text-sm font-mono font-medium">{formatTime(clip.start)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {clip.transcription && (
                          <p className="text-sm text-foreground leading-snug line-clamp-2">{clip.transcription}</p>
                        )}
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatTime(clip.start)} – {formatTime(clip.end)}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {searchError && (
            <p className="text-sm text-destructive px-1">{searchError}</p>
          )}

          {/* Chapter list */}
          {loadingChapters ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-border text-xs text-muted-foreground font-medium uppercase tracking-wide">
                All Chapters
              </div>
              <div className="divide-y divide-border">
                {timestamps.map((ts) => (
                  <button
                    key={ts.id}
                    onClick={() => seekTo(ts.time)}
                    className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2 text-primary pt-0.5 shrink-0">
                      <Clock className="h-4 w-4" />
                      <span className="w-12 text-sm font-mono font-medium">{formatTime(ts.time)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-snug">{ts.label}</p>
                      {ts.topic && (
                        <p className="mt-0.5 text-xs text-muted-foreground leading-snug line-clamp-2">{ts.topic}</p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientView;
