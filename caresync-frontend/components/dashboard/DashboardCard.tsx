import { cn } from "@/lib/utils";

export function DashboardCard({
  children,
  className,
  variant = "default",
  padding = "md",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "glass" | "dark" | "critical" | "warning";
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}) {
  const paddingClass = {
    none: "",
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  }[padding];

  const variantClass = {
    default: "bg-white border-slate-200/80 shadow-medical",
    glass: "glass-panel border-white/60 shadow-medical",
    dark: "bg-slate-900 border-slate-800 text-slate-100 shadow-medical-lg",
    critical: "bg-white border-red-200/80 shadow-medical ring-1 ring-red-500/10",
    warning: "bg-white border-yellow-200/80 shadow-medical",
  }[variant];

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      className={cn(
        "rounded-2xl border transition-shadow duration-200",
        variantClass,
        paddingClass,
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DashboardCardHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-4", className)}>
      <div>
        <h2 className="text-base font-semibold text-slate-900 tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
