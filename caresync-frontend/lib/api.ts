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
import { MOCK_HOSPITALS } from "./mock/seed";
import { analyzeVitalsLocal } from "./aiEmergencyBrain";
import {
  getCareProfile,
  getDisplayNameForRole,
} from "./careProfile";
import type { UserRole } from "./auth.schemas";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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

function simulateDelay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms));
}

/* ─── Auth ─── */

export async function apiLogin(payload: LoginPayload): Promise<AuthUser> {
  try {
    const { data } = await client.post("/auth/login", payload);
    return {
      id: data.id ?? "user-1",
      email: payload.email,
      fullName: data.full_name ?? payload.email.split("@")[0],
      role: (data.role ?? payload.role) as AuthUser["role"],
      token: data.access_token,
    };
  } catch {
    await simulateDelay();
    const role = payload.role as AuthUser["role"];
    const profile =
      typeof window !== "undefined" ? getCareProfile(payload.email) : null;
    const emailFallback =
      payload.email.split("@")[0]?.replace(/[._]/g, " ") ?? "User";
    const fullName = getDisplayNameForRole(
      role as UserRole,
      profile,
      emailFallback
    );

    return {
      id: profile?.userId ?? "demo-user",
      email: payload.email,
      fullName,
      role,
      token: `demo-token-${Date.now()}`,
    };
  }
}

export async function apiRegister(payload: RegisterPayload): Promise<AuthUser> {
  try {
    const { data } = await client.post("/auth/register", {
      full_name: payload.fullName,
      email: payload.email,
      password: payload.password,
      role: payload.role,
    });
    return {
      id: data.id,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role as AuthUser["role"],
      token: data.access_token,
    };
  } catch {
    await simulateDelay();
    return {
      id: `user-${Date.now()}`,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role as AuthUser["role"],
      token: `demo-token-${Date.now()}`,
    };
  }
}

/* ─── Patients ─── */

export async function apiFetchPatients(): Promise<Patient[]> {
  try {
    const { data } = await client.get("/patients", { headers: authHeaders() });
    return data;
  } catch {
    return [];
  }
}

export async function apiCreatePatient(payload: CreatePatientPayload): Promise<Patient> {
  try {
    const { data } = await client.post("/patients", payload, { headers: authHeaders() });
    return data;
  } catch {
    await simulateDelay();
    const id = `p-${Date.now()}`;
    return {
      id,
      name: payload.name,
      room: payload.room,
      wearableId: `wear-${id}`,
      patientCode: `CS-${id.slice(-6).toUpperCase()}`,
      codeRotatesAt: Date.now() + 15 * 60 * 1000,
      status: "stable",
      vitals: {
        heartRate: 78,
        oxygen: 98,
        systolic: 118,
        diastolic: 76,
        bp: "118/76",
        temperature: 36.7,
        respiratoryRate: 15,
        timestamp: new Date().toISOString(),
      },
      history: [],
      location: { lat: -1.29, lng: 36.82, label: "Nairobi ICU" },
    };
  }
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
  try {
    const { data } = await client.get("/alerts", { headers: authHeaders() });
    return data;
  } catch {
    return [];
  }
}

/* ─── SOS & routing ─── */

export async function apiTriggerSOS(payload: SOSPayload): Promise<HospitalRouting> {
  try {
    const { data } = await client.post("/sos", payload, { headers: authHeaders() });
    return data.routing ?? data;
  } catch {
    await simulateDelay(800);
    const hospital = MOCK_HOSPITALS[Math.floor(Math.random() * MOCK_HOSPITALS.length)];
    return {
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      distanceKm: hospital.distanceKm,
      etaMinutes: hospital.etaMinutes,
      status: "dispatching",
      nextOfKinNotified: true,
      escalationLevel: 2,
    };
  }
}

export async function apiGetSOSRouting(sosId: string): Promise<HospitalRouting> {
  try {
    const { data } = await client.get(`/sos/${sosId}/routing`, {
      headers: authHeaders(),
    });
    return data;
  } catch {
    const hospital = MOCK_HOSPITALS[0];
    return {
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      distanceKm: hospital.distanceKm,
      etaMinutes: hospital.etaMinutes,
      status: "en_route",
      nextOfKinNotified: true,
      escalationLevel: 3,
    };
  }
}

/* ─── AI ─── */

export async function apiGenerateAIInsight(
  payload: AIAnalyzePayload
): Promise<AIInsight> {
  try {
    const { data } = await client.post("/ai/analyze", payload, {
      headers: authHeaders(),
    });
    return data;
  } catch {
    await simulateDelay(600);
    const latest = payload.vitalsHistory.at(-1);
    const analysis = latest
      ? analyzeVitalsLocal({
          heartRate: latest.heartRate,
          oxygen: latest.oxygen,
          bp: latest.bp,
        })
      : analyzeVitalsLocal({ heartRate: 80, oxygen: 97, bp: "120/80" });

    return {
      id: `ai-${Date.now()}`,
      patientId: payload.patientId,
      patientName: "Patient",
      summary: `${analysis.explanation} Trend analysis indicates ${analysis.severity} risk profile over the last monitoring window.`,
      riskLevel: analysis.severity,
      flags:
        analysis.severity === "critical"
          ? ["Hypoxia risk", "Tachycardia", "Escalation recommended"]
          : analysis.severity === "warning"
            ? ["Vitals drift", "Increase monitoring"]
            : ["Within normal range"],
      generatedAt: new Date().toISOString(),
    };
  }
}

/* ─── Consultations / Daily.co ─── */

export async function apiScheduleConsultation(
  payload: ScheduleConsultationPayload
): Promise<Consultation> {
  try {
    const { data } = await client.post("/consultations", payload, {
      headers: authHeaders(),
    });
    return data;
  } catch {
    await simulateDelay();
    return {
      id: `c-${Date.now()}`,
      patientId: payload.patientId,
      patientName: "Patient",
      doctorName: "Dr. On Call",
      scheduledAt: payload.scheduledAt,
      status: "scheduled",
    };
  }
}

export async function apiGetConsultationRoom(
  consultationId: string
): Promise<{ roomUrl: string }> {
  try {
    const { data } = await client.post(
      `/consultations/${consultationId}/room`,
      {},
      { headers: authHeaders() }
    );
    return { roomUrl: data.room_url ?? data.roomUrl };
  } catch {
    return {
      roomUrl:
        "https://caresync.daily.co/demo-room-placeholder?showLeaveButton=true",
    };
  }
}

export async function apiListConsultations(): Promise<Consultation[]> {
  try {
    const { data } = await client.get("/consultations", {
      headers: authHeaders(),
    });
    return data;
  } catch {
    return [];
  }
}

/* ─── WebSocket URL (future) ─── */

export function getWebSocketUrl(): string {
  const wsBase = BASE_URL.replace(/^http/, "ws");
  return `${wsBase}/ws/vitals`;
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
  try {
    await client.post("/caregiver/vitals", payload, { headers: authHeaders() });
    return { ok: true };
  } catch {
    await simulateDelay(300);
    return { ok: true };
  }
}

export async function apiAddCaregiverNote(payload: {
  patientId: string;
  note: string;
}): Promise<{ ok: boolean }> {
  try {
    await client.post("/caregiver/notes", payload, { headers: authHeaders() });
    return { ok: true };
  } catch {
    await simulateDelay(300);
    return { ok: true };
  }
}

export async function apiMarkMedicationAdministered(
  medicationId: string
): Promise<{ ok: boolean }> {
  try {
    await client.post(
      `/medications/${medicationId}/administer`,
      {},
      { headers: authHeaders() }
    );
    return { ok: true };
  } catch {
    await simulateDelay(300);
    return { ok: true };
  }
}
