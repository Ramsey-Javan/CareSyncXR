import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  Brain,
  HeartPulse,
  LayoutDashboard,
  Pill,
  Settings,
  Siren,
  Sparkles,
  UserRound,
  UserRoundCog,
  Video,
  Watch,
} from "lucide-react";
import type { NavKey } from "@/lib/roles";
import { canAccess } from "@/lib/roles";
import type { UserRole } from "@/lib/auth.schemas";

export type NavItem = {
  key: NavKey;
  href: string;
  label: string;
  icon: LucideIcon;
  priority?: boolean;
  badgeKey?: "alerts" | "critical" | "medication";
};

export type NavSection = {
  id: string;
  label: string;
  items: NavItem[];
};

const ALL_ITEMS: NavItem[] = [
  {
    key: "care-space",
    href: "/dashboard",
    label: "Care Space",
    icon: LayoutDashboard,
    priority: true,
  },
  {
    key: "vitals",
    href: "/dashboard/vitals",
    label: "Live Vitals",
    icon: Activity,
    priority: true,
    badgeKey: "critical",
  },
  {
    key: "emergency",
    href: "/dashboard/emergency",
    label: "Emergency",
    icon: Siren,
    priority: true,
  },
  {
    key: "alerts",
    href: "/dashboard/alerts",
    label: "Alerts",
    icon: AlertTriangle,
    badgeKey: "alerts",
  },
  {
    key: "medications",
    href: "/dashboard/medication",
    label: "Medications",
    icon: Pill,
    badgeKey: "medication",
  },
  {
    key: "caregiver-tools",
    href: "/dashboard/caregiver",
    label: "Care Log",
    icon: UserRoundCog,
  },
  {
    key: "insights",
    href: "/dashboard/ai-insights",
    label: "AI Insights",
    icon: Brain,
  },
  {
    key: "consultations",
    href: "/dashboard/consultations",
    label: "Consultations",
    icon: Video,
  },
  {
    key: "wearable",
    href: "/dashboard/wearables",
    label: "Wearable",
    icon: Watch,
  },
  {
    key: "wellness",
    href: "/dashboard/family",
    label: "Wellness",
    icon: HeartPulse,
  },
  {
    key: "care-profile",
    href: "/dashboard/care-profile",
    label: "Care Circle",
    icon: UserRound,
  },
  {
    key: "settings",
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function getNavForRole(role: UserRole): NavSection[] {
  const items = ALL_ITEMS.filter((item) => canAccess(role, item.key));
  const primary = items.filter((i) =>
    ["care-space", "vitals", "emergency", "wellness", "medications"].includes(
      i.key
    )
  );
  const care = items.filter((i) =>
    ["caregiver-tools", "insights", "consultations", "wearable", "alerts"].includes(
      i.key
    )
  );
  const system = items.filter((i) =>
    ["care-profile", "settings"].includes(i.key)
  );

  const sections: NavSection[] = [];
  if (primary.length) {
    sections.push({ id: "primary", label: "Care space", items: primary });
  }
  if (care.length) {
    sections.push({ id: "care", label: "Coordination", items: care });
  }
  if (system.length) {
    sections.push({ id: "system", label: "Account", items: system });
  }
  return sections;
}

/** @deprecated use getNavForRole */
export const DASHBOARD_NAV: NavSection[] = getNavForRole("caregiver");

export const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Patient care space",
    subtitle: "Real-time wellbeing · one care journey",
  },
  "/dashboard/vitals": {
    title: "Live vitals",
    subtitle: "Wearable stream · calm monitoring",
  },
  "/dashboard/emergency": {
    title: "Emergency response",
    subtitle: "SOS · routing · coordination",
  },
  "/dashboard/medication": {
    title: "Medications",
    subtitle: "Schedules · adherence · reminders",
  },
  "/dashboard/caregiver": {
    title: "Care log",
    subtitle: "Vitals · observations · daily routines",
  },
  "/dashboard/ai-insights": {
    title: "AI insights",
    subtitle: "Supportive summaries · early warnings",
  },
  "/dashboard/consultations": {
    title: "Consultations",
    subtitle: "Secure video visits with live context",
  },
  "/dashboard/wearables": {
    title: "Wearable",
    subtitle: "Device connection · privacy code",
  },
  "/dashboard/alerts": {
    title: "Alerts",
    subtitle: "What needs your attention",
  },
  "/dashboard/family": {
    title: "Family wellness",
    subtitle: "Reassuring visibility · appointments",
  },
  "/dashboard/patient": {
    title: "Your health",
    subtitle: "Calm view of your care journey",
  },
  "/dashboard/care-profile": {
    title: "Care circle",
    subtitle: "Doctor · caregiver · family · device",
  },
  "/dashboard/settings": {
    title: "Settings",
    subtitle: "Account and preferences",
  },
  "/dashboard/home-care": {
    title: "Care space",
    subtitle: "Redirected hub",
  },
  "/dashboard/icu": {
    title: "Live vitals",
    subtitle: "Redirected monitoring",
  },
  "/dashboard/command-center": {
    title: "Emergency",
    subtitle: "Redirected response",
  },
};

export function getPageMeta(pathname: string) {
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  if (pathname.startsWith("/dashboard/consultations/video")) {
    return {
      title: "Video visit",
      subtitle: "Live consultation in the care space",
    };
  }
  return {
    title: "CareSync",
    subtitle: "Personalized remote care",
  };
}
