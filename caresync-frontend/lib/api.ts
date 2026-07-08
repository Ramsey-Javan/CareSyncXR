import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { ACCESS_TOKEN_KEY } from "@/lib/constants/auth";
import {
  clearSession,
  getRefreshToken,
  persistTokens,
} from "@/lib/auth/session";
import { refreshTokens } from "@/lib/auth/token-refresh";
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

// Base API URL configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

/**
 * Shared Axios instance for CareSync API requests.
 * Automatically handles interceptors and 401 token refreshes.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/** Attach access token from localStorage on every client request. */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Helper to get full URL for endpoints that don't use standard prefixes (like health check)
export function getBackendUrl(path: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  return `${apiUrl}${path}`;
}

let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  const storedRefresh = getRefreshToken();
  if (!storedRefresh) return null;

  if (!refreshPromise) {
    refreshPromise = refreshTokens(storedRefresh)
      .then((tokens) => {
        persistTokens(tokens.access_token, tokens.refresh_token);
        return tokens.access_token;
      })
      .catch(() => {
        clearSession();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

/** Handle 401 globally — attempt refresh, then redirect to login. */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      typeof window !== "undefined"
    ) {
      const url = originalRequest.url ?? "";
      const isAuthEndpoint =
        url.includes("/auth/login") ||
        url.includes("/auth/logout") ||
        url.includes("/auth/refresh");

      if (!isAuthEndpoint) {
        originalRequest._retry = true;
        const newToken = await tryRefreshToken();

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      }

      clearSession();

      const isAuthPage =
        window.location.pathname === "/login" ||
        window.location.pathname === "/register";

      if (!isAuthPage) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

/* ─── Authentication API Callers ─── */

export async function apiLogin(payload: LoginPayload): Promise<AuthUser> {
  const { data } = await api.post("/auth/login", {
    email: payload.email,
    password: payload.password,
  });
  return {
    id: data.user_id ?? "user",
    email: payload.email,
    fullName: data.full_name ?? payload.email.split("@")[0],
    role: (data.role ?? payload.role) as AuthUser["role"],
    token: data.access_token,
  };
}

export async function apiRegister(payload: RegisterPayload): Promise<AuthUser> {
  const { data } = await api.post("/auth/register", {
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
  const { data } = await api.get("/patients");
  return data;
}

export async function apiCreatePatient(
  payload: CreatePatientPayload
): Promise<Patient> {
  const { data } = await api.post("/patients", payload);
  return data;
}

export async function apiUpdatePatient(
  id: string,
  payload: Partial<CreatePatientPayload>
): Promise<Patient> {
  const { data } = await api.patch(`/patients/${id}`, payload);
  return data;
}

export async function apiDeletePatient(id: string): Promise<void> {
  await api.delete(`/patients/${id}`);
}

/* ─── Alerts ─── */

export async function apiFetchAlerts(): Promise<AlertItem[]> {
  const { data } = await api.get("/alerts");
  return data;
}

/* ─── SOS ─── */

export async function apiTriggerSOS(
  payload: SOSPayload
): Promise<HospitalRouting> {
  const { data } = await api.post("/sos", payload);
  return data.routing ?? data;
}

export async function apiGetSOSRouting(
  sosId: string
): Promise<HospitalRouting> {
  const { data } = await api.get(`/sos/${sosId}/routing`);
  return data;
}

/* ─── AI ─── */

export async function apiGenerateAIInsight(
  payload: AIAnalyzePayload
): Promise<AIInsight> {
  const { data } = await api.post("/ai/analyze", payload);
  return data;
}

/* ─── Consultations ─── */

export async function apiScheduleConsultation(
  payload: ScheduleConsultationPayload
): Promise<Consultation> {
  const { data } = await api.post("/consultations", payload);
  return data;
}

export async function apiGetConsultationRoom(
  consultationId: string
): Promise<{ roomUrl: string }> {
  const { data } = await api.post(`/consultations/${consultationId}/room`, {});
  return { roomUrl: data.room_url ?? data.roomUrl };
}

export async function apiListConsultations(): Promise<Consultation[]> {
  const { data } = await api.get("/consultations");
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
  await api.post("/caregiver/vitals", payload);
  return { ok: true };
}

export async function apiAddCaregiverNote(payload: {
  patientId: string;
  note: string;
}): Promise<{ ok: boolean }> {
  await api.post("/caregiver/notes", payload);
  return { ok: true };
}

export async function apiMarkMedicationAdministered(
  medicationId: string
): Promise<{ ok: boolean }> {
  await api.post(`/medications/${medicationId}/administer`, {});
  return { ok: true };
}

export default api;