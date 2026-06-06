import axios, { type AxiosInstance } from "axios";
import type {
  AIAnalyzePayload,
  AIInsight,
  AlertItem,
  AuthUser,
  Consultation,
  CreatePatientPayload,
  HospitalRouting,
  LoginPayload,
  Patient,
  RegisterPayload,
  ScheduleConsultationPayload,
  SOSPayload,
} from "./types";

// Use relative URL – Next.js rewrites will forward to backend
const BASE_URL = "/api";

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

function authHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("caresync_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper to get full URL for endpoints that don't use /api prefix (like health)
export function getBackendUrl(path: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  return `${apiUrl}${path}`;
}

/* ─── Auth ─── */

export async function apiLogin(payload: LoginPayload): Promise<AuthUser> {
  const { data } = await client.post("/auth/login", {
    email: payload.email,
    password: payload.password,
  });
  // Backend returns: { access_token, refresh_token, token_type, user_id?, full_name?, role? }
  return {
    id: data.user_id ?? "user",
    email: payload.email,
    fullName: data.full_name ?? payload.email.split("@")[0],
    role: (data.role ?? payload.role) as AuthUser["role"],
    token: data.access_token,
  };
}

export async function apiRegister(payload: RegisterPayload): Promise<AuthUser> {
  const { data } = await client.post("/auth/register", {
    email: payload.email,
    password: payload.password,
    full_name: payload.fullName,
    role: payload.role,
  });
  return {
    id: data.id,
    email: payload.email,
    fullName: payload.fullName,
    role: payload.role as AuthUser["role"],
    token: data.access_token,
  };
}

/* ─── Patients ─── */

export async function apiFetchPatients(): Promise<Patient[]> {
  const { data } = await client.get("/patients", { headers: authHeaders() });
  return data;
}

export async function apiCreatePatient(
  payload: CreatePatientPayload
): Promise<Patient> {
  const { data } = await client.post("/patients", payload, {
    headers: authHeaders(),
  });
  return data;
}

export async function apiUpdatePatient(
  id: string,
  payload: Partial<CreatePatientPayload>
): Promise<Patient> {
  const { data } = await client.patch(`/patients/${id}`, payload, {
    headers: authHeaders(),
  });
  return data;
}

export async function apiDeletePatient(id: string): Promise<void> {
  await client.delete(`/patients/${id}`, { headers: authHeaders() });
}

/* ─── Alerts ─── */

export async function apiFetchAlerts(): Promise<AlertItem[]> {
  const { data } = await client.get("/alerts", { headers: authHeaders() });
  return data;
}

/* ─── SOS ─── */

export async function apiTriggerSOS(
  payload: SOSPayload
): Promise<HospitalRouting> {
  const { data } = await client.post("/sos", payload, {
    headers: authHeaders(),
  });
  return data.routing ?? data;
}

export async function apiGetSOSRouting(
  sosId: string
): Promise<HospitalRouting> {
  const { data } = await client.get(`/sos/${sosId}/routing`, {
    headers: authHeaders(),
  });
  return data;
}

/* ─── AI ─── */

export async function apiGenerateAIInsight(
  payload: AIAnalyzePayload
): Promise<AIInsight> {
  const { data } = await client.post("/ai/analyze", payload, {
    headers: authHeaders(),
  });
  return data;
}

/* ─── Consultations ─── */

export async function apiScheduleConsultation(
  payload: ScheduleConsultationPayload
): Promise<Consultation> {
  const { data } = await client.post("/consultations", payload, {
    headers: authHeaders(),
  });
  return data;
}

export async function apiGetConsultationRoom(
  consultationId: string
): Promise<{ roomUrl: string }> {
  const { data } = await client.post(
    `/consultations/${consultationId}/room`,
    {},
    { headers: authHeaders() }
  );
  return { roomUrl: data.room_url ?? data.roomUrl };
}

export async function apiListConsultations(): Promise<Consultation[]> {
  const { data } = await client.get("/consultations", {
    headers: authHeaders(),
  });
  return data;
}

/* ─── WebSocket URL ─── */

export function getWebSocketUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  return apiUrl.replace(/^http/, "ws") + "/ws/vitals";
}

/* ─── Home care / caregiver ─── */

export type CaregiverVitalsPayload = {
  patientId: string;
  glucose?: number;
  bp?: string;
  temperature?: number;
  symptoms?: string;
  note?: string;
};

export async function apiLogCaregiverVitals(
  payload: CaregiverVitalsPayload
): Promise<{ ok: boolean }> {
  await client.post("/caregiver/vitals", payload, { headers: authHeaders() });
  return { ok: true };
}

export async function apiAddCaregiverNote(payload: {
  patientId: string;
  note: string;
}): Promise<{ ok: boolean }> {
  await client.post("/caregiver/notes", payload, { headers: authHeaders() });
  return { ok: true };
}

export async function apiMarkMedicationAdministered(
  medicationId: string
): Promise<{ ok: boolean }> {
  await client.post(
    `/medications/${medicationId}/administer`,
    {},
    { headers: authHeaders() }
  );
  return { ok: true };
}