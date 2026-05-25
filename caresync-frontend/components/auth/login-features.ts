import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Brain,
  HeartPulse,
  Home,
  Siren,
  Stethoscope,
  Users,
  Video,
  Watch,
} from "lucide-react";

export type LoginFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: "emerald" | "cyan" | "red";
};

export const LOGIN_FEATURES: LoginFeature[] = [
  {
    icon: HeartPulse,
    title: "Patient care space",
    description: "One calm environment for doctor, caregiver, and family",
    accent: "emerald",
  },
  {
    icon: Watch,
    title: "Wearable intelligence",
    description: "Live vitals with privacy-preserving rotating codes",
    accent: "cyan",
  },
  {
    icon: Siren,
    title: "Emergency response",
    description: "SOS, GPS, hospital routing, and coordinated alerts",
    accent: "red",
  },
  {
    icon: Brain,
    title: "AI companionship",
    description: "Supportive summaries — not cold clinical overload",
    accent: "cyan",
  },
  {
    icon: Video,
    title: "Telehealth visits",
    description: "Secure Daily.co consultations inside the care space",
    accent: "cyan",
  },
];

export const LOGIN_ROLES = [
  { value: "patient", label: "Patient", icon: Home },
  { value: "caregiver", label: "Caregiver", icon: HeartPulse },
  { value: "doctor", label: "Doctor", icon: Stethoscope },
  { value: "family", label: "Family", icon: Users },
  { value: "admin", label: "Admin", icon: Activity },
] as const;
