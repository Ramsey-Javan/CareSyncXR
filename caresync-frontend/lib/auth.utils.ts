import type { AuthUser, UserRole } from "./auth.schemas";

const TOKEN_KEY = "caresync_token";
const USER_KEY = "caresync_user";

/* ---------------------------
   NORMALIZE USER (SOURCE OF TRUTH)
---------------------------- */
export function normalizeUser(user: {
  id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  role?: AuthUser["role"];
  token?: string;
  [key: string]: unknown;
}): AuthUser {
  return {
    id: user.id ?? "user",
    fullName: user.fullName || (user.name as string) || "User",
    email: user.email ?? "",
    role: user.role || "patient",
    token: user.token ?? "",
  };
}

/* ---------------------------
   SAVE SESSION (FIXED)
   ALWAYS NORMALIZE HERE
---------------------------- */
export function saveSession(user: AuthUser): void {
  if (typeof window === "undefined") return;

  const safeUser = normalizeUser(user);

  localStorage.setItem(TOKEN_KEY, safeUser.token);
  localStorage.setItem(USER_KEY, JSON.stringify(safeUser));

  document.cookie = `${TOKEN_KEY}=${safeUser.token}; path=/; max-age=${
    60 * 60 * 24 * 7
  }; SameSite=Lax`;
}

/* ---------------------------
   GET TOKEN
---------------------------- */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/* ---------------------------
   GET USER (ALWAYS SAFE)
---------------------------- */
export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return normalizeUser(JSON.parse(raw));
  } catch {
    return null;
  }
}

/* ---------------------------
   CLEAR SESSION
---------------------------- */
export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

/* ---------------------------
   AUTH CHECK
---------------------------- */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/* ---------------------------
   DASHBOARD ROUTING
---------------------------- */
export const ROLE_DASHBOARD: Record<UserRole, string> = {
  doctor: "/dashboard",
  caregiver: "/dashboard",
  admin: "/dashboard",
  patient: "/dashboard/patient",
  family: "/dashboard/family",
};

export function getDashboardRoute(role: UserRole): string {
  return ROLE_DASHBOARD[role] ?? "/dashboard";
}