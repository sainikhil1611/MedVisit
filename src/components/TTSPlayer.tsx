import { useState, useRef } from "react";
import { Volume2, Square, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSpeech } from "@/lib/api";

const LANGUAGES = [
  { code: "en",    label: "English"    },
  { code: "es",    label: "Spanish"    },
  { code: "fr",    label: "French"     },
  { code: "de",    label: "German"     },
  { code: "hi",    label: "Hindi"      },
  { code: "ar",    label: "Arabic"     },
  { code: "pt",    label: "Portuguese" },
  { code: "zh-CN", label: "Chinese"    },
  { code: "ja",    label: "Japanese"   },
  { code: "ko",    label: "Korean"     },
];

interface TTSPlayerProps {
  text: string;
}

export function TTSPlayer({ text }: TTSPlayerProps) {
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setPlaying(false);
  };

  const handleListen = async () => {
    if (playing) {
      stopAudio();
      return;
    }

    setLoading(true);
    setError("");
    try {
      const blob = await getSpeech(text, language);
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.addEventListener("ended", () => {
        setPlaying(false);
        URL.revokeObjectURL(url);
        blobUrlRef.current = null;
      });

      await audio.play();
      setPlaying(true);
    } catch {
      setError("Could not generate audio. Check that the backend is running and ELEVENLABS_API_KEY is set.");
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLang: string) => {
    stopAudio();
    setError("");
    setLanguage(newLang);
  };

  return (
    <div className="mt-5 pt-4 border-t border-border">
      <div className="flex items-center gap-2 flex-wrap">
        <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground">Listen in:</span>
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code} className="text-xs">
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant={playing ? "destructive" : "secondary"}
          onClick={handleListen}
          disabled={loading}
          className="gap-1.5 h-8 text-xs"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : playing ? (
            <Square className="h-3.5 w-3.5 fill-current" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
          {loading ? "Generating…" : playing ? "Stop" : "Listen"}
        </Button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
