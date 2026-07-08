import { PatientStatus } from "@/lib/types/patients";

const config: Record<PatientStatus, { label: string; className: string }> = {
  stable:    { label: "Stable",          className: "bg-teal-50 text-teal-800"   },
  attention: { label: "Needs attention", className: "bg-amber-50 text-amber-900" },
  critical:  { label: "Critical",        className: "bg-red-50 text-red-800"     },
};

export default function StatusBadge({ status }: { status: PatientStatus }) {
  const { label, className } = config[status];
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${className}`}>
      {label}
    </span>
  );
}
