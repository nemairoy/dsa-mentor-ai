import type { ComponentType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type PremiumCardProps = {
  children: ReactNode;
  className?: string;
};

export function PremiumCard({ children, className }: PremiumCardProps) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-3 shadow-sm shadow-slate-200/70 transition hover:shadow-md dark:shadow-none", className)}>
      {children}
    </section>
  );
}

export function StatTile({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <PremiumCard>
      <div className="flex items-center justify-between gap-2">
        <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
          <Icon aria-hidden={true} size={17} />
        </div>
        {detail ? <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{detail}</span> : null}
      </div>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold leading-tight">{value}</p>
    </PremiumCard>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-muted", className)}>
      <div className="h-full rounded-full bg-emerald-600 transition-all dark:bg-emerald-400" style={{ width: `${width}%` }} />
    </div>
  );
}
