"use client";

import { useEffect } from "react";

import { AnimationSvgRenderer } from "@/components/visualization/svg/animation-svg-renderer";
import type { AnimationDefinition } from "@/core/visualization/schema/animation-schema";

export function AnimationPlayer({ definition }: { definition: AnimationDefinition }) {
  const finalState = definition.steps[definition.steps.length - 1] ?? definition.steps[0]!;

  useEffect(() => {
    void fetch("/api/visualizations/usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animationId: definition.id, event: "opened", durationSeconds: 0 }),
    });
  }, [definition.id]);

  return (
    <section className="rounded-2xl border border-border bg-card p-3 shadow-sm">
      <AnimationSvgRenderer definition={definition} step={finalState} />
    </section>
  );
}
