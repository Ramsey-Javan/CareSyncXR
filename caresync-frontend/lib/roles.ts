import type { UserRole } from "@/lib/auth.schemas";

export const ROLES: UserRole[] = [
  "patient",
  "caregiver",
  "doctor",
  "family",
  "admin",
];

export const ROLE_LABELS: Record<UserRole, string> = {
  patient: "Patient",
  caregiver: "Caregiver",
  doctor: "Doctor",
  family: "Family",
  admin: "Admin",
};

export type NavKey =
  | "care-space"
  | "vitals"
  | "medications"
  | "caregiver-tools"
  | "insights"
  | "consultations"
  | "wearable"
  | "emergency"
  | "alerts"
  | "wellness"
  | "care-profile"
  | "settings";

/** Nav items visible per role inside the patient care space */
export const ROLE_NAV_KEYS: Record<UserRole, NavKey[]> = {
  patient: [
    "care-space",
    "vitals",
    "medications",
    "consultations",
    "emergency",
    "settings",
  ],
  caregiver: [
    "care-space",
    "vitals",
    "medications",
    "caregiver-tools",
    "wearable",
    "consultations",
    "emergency",
    "alerts",
    "care-profile",
    "settings",
  ],
  doctor: [
    "care-space",
    "vitals",
    "insights",
    "medications",
    "consultations",
    "emergency",
    "alerts",
    "settings",
  ],
  family: [
    "care-space",
    "wellness",
    "consultations",
    "emergency",
    "settings",
  ],
  admin: ["care-space", "settings"],
};

export function canAccess(role: UserRole, key: NavKey): boolean {
  return ROLE_NAV_KEYS[role]?.includes(key) ?? false;
}
