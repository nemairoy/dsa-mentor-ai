import { BookOpen, Bot, Code2, LineChart } from "lucide-react";

import { cn } from "@/lib/utils";

type PageLoaderProps = {
  compact?: boolean;
  label?: string;
  className?: string;
};

const steps = [
  { icon: BookOpen, label: "Learn", className: "bg-teal-400" },
  { icon: Code2, label: "Practice", className: "bg-cyan-400" },
  { icon: Bot, label: "AI", className: "bg-violet-400" },
  { icon: LineChart, label: "Progress", className: "bg-emerald-400" },
];

export function PageLoader({ compact = false, label = "Preparing your workspace", className }: PageLoaderProps) {
  return (
    <div className={cn("flex min-h-[48vh] items-center justify-center px-4", compact && "min-h-0 py-4", className)}>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card/92 p-5 shadow-xl shadow-slate-900/10 backdrop-blur dark:shadow-black/25">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 shadow-[0_18px_45px_rgba(13,148,136,0.24)] ring-1 ring-white/15">
          <div className="flex flex-col items-center leading-none">
            <span className="text-sm font-black tracking-normal text-white">DSA</span>
            <span className="mt-1 h-1 w-7 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" />
          </div>
        </div>

        <div className="relative mx-auto mb-4 grid max-w-[17rem] grid-cols-4 gap-2">
          <div className="absolute left-9 right-9 top-5 h-0.5 bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400" />
          {steps.map((step, index) => (
            <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
              <span
                className={cn(
                  "loader-step flex h-10 w-10 items-center justify-center rounded-xl text-slate-950 shadow-lg shadow-slate-900/12",
                  step.className,
                )}
                style={{ animationDelay: `${index * 0.14}s` }}
              >
                <step.icon aria-hidden={true} size={16} />
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">{step.label}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-sm font-bold text-foreground">{label}</p>
        <p className="mt-1 text-center text-xs text-muted-foreground">Loading the next page. Please wait.</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="loader-progress h-full rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400" />
        </div>
      </div>
    </div>
  );
}
