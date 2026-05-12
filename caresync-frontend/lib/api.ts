import axios from "axios";
import { getToken, clearSession } from "./auth.utils";
import type { LoginFormValues, RegisterFormValues, AuthUser } from "./auth.schemas";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 → clear session and redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

export async function apiLogin(data: LoginFormValues): Promise<AuthUser> {
  const res = await api.post<AuthUser>("/auth/login", data);
  return res.data;
}

export async function apiRegister(data: RegisterFormValues): Promise<AuthUser> {
  const res = await api.post<AuthUser>("/auth/register", data);
  return res.data;
}