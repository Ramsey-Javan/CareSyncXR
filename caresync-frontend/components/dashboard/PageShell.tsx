"use client";

import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
  fullWidth,
}: {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={cn(
        "space-y-8 animate-in fade-in duration-300",
        !fullWidth && "max-w-[1600px]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
