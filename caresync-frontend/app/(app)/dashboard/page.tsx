"use client";

import Link from "next/link";
import {
  Activity,
  Camera,
  HeartPulse,
  History,
  ScrollText,
  Users,
} from "lucide-react";

const dashboardCards = [
  {
    title: "Patient Management",
    description: "Create, edit, and review patient records from one place.",
    href: "/patients",
    icon: Users,
  },
  {
    title: "Health Logging",
    description: "Record vitals, symptoms, and trends for ongoing care.",
    href: "/health-logs",
    icon: HeartPulse,
  },
  {
    title: "Health History",
    description: "Review past readings and identify changes over time.",
    href: "/health/history",
    icon: History,
  },
  {
    title: "Photo Capture",
    description: "Upload medication or wound photos to support remote review.",
    href: "/health-logs/photo-capture",
    icon: Camera,
  },
  {
    title: "New Patient",
    description: "Add a new patient and connect them with their care team.",
    href: "/patients/new",
    icon: ScrollText,
  },
  {
    title: "Patient Details",
    description: "Open an individual record to inspect health progress and notes.",
    href: "/patients/1",
    icon: Activity,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
          CareSync workspace
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Care coordination at a glance
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Use this landing page to reach the core patient management and health
          monitoring workflows without leaving the dashboard.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboardCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">{card.title}</h2>
              </div>
              <p className="mt-3 text-sm text-slate-600">{card.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
