const BASE_URL = "/api";

export interface AIMedication {
  name: string;
  dosage: string;
  frequency: string;
  purpose: string;
  instructions: string;
  video_start_seconds: number;
  confidence: number;
}

export interface SOAPResult {
  video_id: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface UploadResult {
  task_id: string;
  video_id: string;
  appointment_id: string;
  status: string;
  message: string;
}

export interface UploadStatus {
  task_id: string;
  video_id: string;
  appointment_id?: string;
  patient_id?: string;
  status: "indexing" | "ready" | "failed";
  error?: string;
}

export interface PendingReview {
  video_id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  medication_status: string;
  ai_medications: AIMedication[];
}

export interface MedicationPlan {
  source: "doctor_manual" | "doctor_approved_ai";
  medications: AIMedication[];
  override_text?: string;
  status: string;
  reviewed_by: string;
}

export interface SummaryResult {
  video_id: string;
  summary: string;
  medication_plan: MedicationPlan | null;
}

export interface GistResult {
  video_id: string;
  title: string;
  topics: string[];
  hashtags: string[];
}

export interface Chapter {
  start: number;
  end: number;
  title: string;
  summary: string;
}

export interface ChaptersResult {
  video_id: string;
  chapters: Chapter[];
}

export async function uploadVideo(
  video: File,
  appointmentId: string,
  patientId: string,
  doctorId: string
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("video", video);
  formData.append("appointment_id", appointmentId);
  formData.append("patient_id", patientId);
  formData.append("doctor_id", doctorId);

  const res = await fetch(`${BASE_URL}/upload`, { method: "POST", body: formData });
  if (!res.ok) throw new Error(`Upload failed: ${await res.text()}`);
  return res.json();
}

export async function getUploadStatus(taskId: string): Promise<UploadStatus> {
  const res = await fetch(`${BASE_URL}/upload/status/${taskId}`);
  if (!res.ok) throw new Error(`Status check failed: ${await res.text()}`);
  return res.json();
}

export async function getPendingReviews(): Promise<{ pending: PendingReview[] }> {
  const res = await fetch(`${BASE_URL}/review/pending`);
  if (!res.ok) throw new Error(`Failed to fetch pending reviews: ${await res.text()}`);
  return res.json();
}

export async function approveMedications(videoId: string) {
  const res = await fetch(`${BASE_URL}/review/${videoId}/approve`, { method: "POST" });
  if (!res.ok) throw new Error(`Approve failed: ${await res.text()}`);
  return res.json();
}

export async function overrideMedications(videoId: string, manualText: string) {
  const res = await fetch(`${BASE_URL}/review/${videoId}/override`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ manual_text: manualText }),
  });
  if (!res.ok) throw new Error(`Override failed: ${await res.text()}`);
  return res.json();
}

export async function getSummary(videoId: string): Promise<SummaryResult> {
  const res = await fetch(`${BASE_URL}/summary/${videoId}`);
  if (!res.ok) throw new Error(`Summary fetch failed: ${await res.text()}`);
  return res.json();
}

export async function getGist(videoId: string): Promise<GistResult> {
  const res = await fetch(`${BASE_URL}/gist/${videoId}`);
  if (!res.ok) throw new Error(`Gist fetch failed: ${await res.text()}`);
  return res.json();
}

export async function getChapters(videoId: string): Promise<ChaptersResult> {
  const res = await fetch(`${BASE_URL}/chapters/${videoId}`);
  if (!res.ok) throw new Error(`Chapters fetch failed: ${await res.text()}`);
  return res.json();
}

export interface VideoInfo {
  video_id: string;
  stream_url: string | null;
  thumbnail_url: string | null;
}

export async function getVideoInfo(videoId: string): Promise<VideoInfo> {
  const res = await fetch(`${BASE_URL}/video/${videoId}`);
  if (!res.ok) throw new Error(`Video info fetch failed: ${await res.text()}`);
  return res.json();
}

export interface SearchClip {
  video_id: string;
  start: number;
  end: number;
  score: number;
  confidence: string;
  transcription: string;
}

export interface SearchResult {
  query: string;
  results: SearchClip[];
}

export async function searchVideo(query: string, videoId?: string | null): Promise<SearchResult> {
  const body: Record<string, unknown> = { query, page_limit: 5 };
  const res = await fetch(`${BASE_URL}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Search failed: ${await res.text()}`);
  const data: SearchResult = await res.json();
  if (videoId) {
    data.results = data.results.filter((c) => c.video_id === videoId);
  }
  return data;
}

export const VIDEO_ID_KEY = "medvisit_video_id";

export async function getSpeech(text: string, language: string): Promise<Blob> {
  const res = await fetch(`${BASE_URL}/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });
  if (!res.ok) throw new Error(`TTS failed: ${await res.text()}`);
  return res.blob();
}

export async function getSOAP(videoId: string): Promise<SOAPResult> {
  const res = await fetch(`${BASE_URL}/soap/${videoId}`);
  if (!res.ok) throw new Error(`SOAP fetch failed: ${await res.text()}`);
  return res.json();
}
