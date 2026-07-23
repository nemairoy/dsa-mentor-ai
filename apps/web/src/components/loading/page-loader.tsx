import { BookOpen, Bot, Code2, LineChart } from "lucide-react";

import { cn } from "@/lib/utils";

type PageLoaderProps = {
  compact?: boolean;
  className?: string;
};

const steps = [
  { icon: BookOpen, label: "Learn", className: "bg-teal-400" },
  { icon: Code2, label: "Practice", className: "bg-cyan-400" },
  { icon: Bot, label: "AI", className: "bg-violet-400" },
  { icon: LineChart, label: "Progress", className: "bg-emerald-400" },
];

export function PageLoader({ compact = false, className }: PageLoaderProps) {
  return (
    <div className={cn("flex min-h-[38vh] items-center justify-center px-4", compact && "min-h-0 py-3", className)}>
      <div className="w-full max-w-[19rem] rounded-2xl border border-border bg-card/88 px-6 py-5 shadow-xl shadow-slate-900/10 backdrop-blur dark:shadow-black/25">
        <div className="relative mx-auto grid max-w-[15rem] grid-cols-4 gap-2">
          <div className="absolute left-9 right-9 top-5 h-0.5 bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400" />
          {steps.map((step, index) => (
            <div key={step.label} className="relative z-10 flex items-center justify-center">
              <span
                className={cn(
                  "loader-step flex h-10 w-10 items-center justify-center rounded-xl text-slate-950 shadow-lg shadow-slate-900/12",
                  step.className,
                )}
                style={{ animationDelay: `${index * 0.14}s` }}
              >
                <step.icon aria-hidden={true} size={16} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
