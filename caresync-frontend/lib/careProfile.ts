import type { UserRole } from "./auth.schemas";
import type { AuthUser } from "./types";

export type SetupBy = "patient" | "caregiver";

export type CareProfile = {
  userId: string;
  email: string;
  careUnitName: string;
  setupBy: SetupBy;
  patientName: string;
  patientLocation: string;
  caregiverName: string;
  caregiverEmail?: string;
  doctorName: string;
  doctorEmail?: string;
  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinPhone?: string;
  nextOfKinEmail?: string;
  completedAt: string;
};

const PROFILE_PREFIX = "caresync_care_profile:";
const PENDING_USER_KEY = "caresync_pending_user";

function profileKey(email: string) {
  return `${PROFILE_PREFIX}${email.toLowerCase().trim()}`;
}

export function formatNextOfKin(profile: Pick<
  CareProfile,
  "nextOfKinName" | "nextOfKinRelationship"
>): string {
  const rel = profile.nextOfKinRelationship?.trim();
  return rel ? `${profile.nextOfKinName} (${rel})` : profile.nextOfKinName;
}

export function saveCareProfile(profile: CareProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(profileKey(profile.email), JSON.stringify(profile));
}

export function getCareProfile(email: string): CareProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(profileKey(email));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CareProfile;
  } catch {
    return null;
  }
}

export function hasCareProfile(email: string): boolean {
  return !!getCareProfile(email);
}

export function savePendingUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PENDING_USER_KEY, JSON.stringify(user));
}

export function getPendingUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PENDING_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearPendingUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PENDING_USER_KEY);
}

/** Display name for auth session based on role + saved care profile */
export function getDisplayNameForRole(
  role: UserRole,
  profile: CareProfile | null,
  fallback: string
): string {
  if (!profile) return fallback;

  switch (role) {
    case "patient":
      return profile.patientName || fallback;
    case "caregiver":
      return profile.caregiverName || fallback;
    case "family":
      return profile.nextOfKinName || fallback;
    case "doctor":
      return profile.doctorName || fallback;
    default:
      return fallback;
  }
}

export function buildCareProfileFromForm(
  user: AuthUser,
  form: Omit<CareProfile, "userId" | "email" | "completedAt">
): CareProfile {
  return {
    userId: user.id,
    email: user.email,
    ...form,
    completedAt: new Date().toISOString(),
  };
}
