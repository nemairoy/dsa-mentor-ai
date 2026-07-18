"use client";

import { useAnimationPlayer } from "@/components/visualization/context/animation-player-context";
import type { AnimationDefinition } from "@/core/visualization/schema/animation-schema";
import { cn } from "@/lib/utils";

export function CodeSyncPanel({ definition }: { definition: AnimationDefinition }) {
  const { currentStep } = useAnimationPlayer();

  return (
    <section className="rounded-2xl border border-border bg-card p-3">
      <h2 className="text-xs font-semibold uppercase text-muted-foreground">
        Code / {definition.code.language}
      </h2>
      <ol className="mt-3 space-y-1 text-xs">
        {definition.code.lines.map((line, index) => (
          <li
            key={`${index}-${line}`}
            className={cn(
              "rounded-lg px-2 py-1 font-mono",
              currentStep.codeLine === index + 1 && "bg-accent text-accent-foreground",
            )}
          >
            <span className="mr-3 text-muted-foreground">{index + 1}</span>
            {line}
          </li>
        ))}
      </ol>
    </section>
  );
}
