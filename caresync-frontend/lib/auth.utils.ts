import type { AuthUser, UserRole } from "./auth.schemas";

const TOKEN_KEY = "caresync_token";
const USER_KEY  = "caresync_user";

export function saveSession(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, user.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  document.cookie = `${TOKEN_KEY}=${user.token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export const ROLE_DASHBOARD: Record<UserRole, string> = {
  doctor:    "/dashboard/doctor",
  caregiver: "/dashboard/caregiver",
  admin:     "/dashboard/admin",
  patient:   "/dashboard/patient",
};

export function getDashboardRoute(role: UserRole): string {
  return ROLE_DASHBOARD[role] ?? "/dashboard";
}