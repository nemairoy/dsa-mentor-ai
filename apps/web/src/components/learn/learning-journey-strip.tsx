import { BookOpen, Brain, CheckCircle2, Dumbbell, LineChart, PlayCircle } from "lucide-react";

const journey = [
  { label: "Choose level", icon: Brain },
  { label: "Pick module", icon: BookOpen },
  { label: "Study lesson", icon: PlayCircle },
  { label: "Practice", icon: Dumbbell },
  { label: "Review progress", icon: LineChart },
  { label: "Keep streak", icon: CheckCircle2 },
];

export function LearningJourneyStrip() {
  return (
    <section className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="grid gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        {journey.map((step, index) => (
          <div key={step.label} className="rounded-lg border border-border bg-background p-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                <step.icon aria-hidden={true} size={16} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Step {index + 1}</span>
            </div>
            <p className="mt-2 text-xs font-semibold">{step.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
