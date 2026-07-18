"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AnimationEngine } from "@/core/visualization/engine/animation-engine";
import { AnimationEventSystem } from "@/core/visualization/engine/animation-event-system";
import type { AnimationDefinition, AnimationSpeed } from "@/core/visualization/schema/animation-schema";

export function useAnimationController(definition: AnimationDefinition) {
  const engine = useMemo(() => new AnimationEngine(definition), [definition]);
  const events = useMemo(() => new AnimationEventSystem(), []);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<AnimationSpeed>(definition.defaultSpeed);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStep = engine.getStep(currentStepIndex);
  const progress = engine.getProgress(currentStepIndex);

  const pause = useCallback(() => {
    setIsPlaying(false);
    events.publish({ type: "pause" });
  }, [events]);

  const jumpTo = useCallback(
    (index: number) => {
      setCurrentStepIndex(Math.min(Math.max(index, 0), engine.totalSteps - 1));
      events.publish({ type: "step", index });
    },
    [engine.totalSteps, events],
  );

  const next = useCallback(() => {
    setCurrentStepIndex((index) => {
      const nextIndex = Math.min(index + 1, engine.totalSteps - 1);
      if (nextIndex === engine.totalSteps - 1) {
        setIsPlaying(false);
        events.publish({ type: "complete" });
      }
      return nextIndex;
    });
  }, [engine.totalSteps, events]);

  const previous = useCallback(() => jumpTo(currentStepIndex - 1), [currentStepIndex, jumpTo]);

  const play = useCallback(() => {
    setIsPlaying(true);
    events.publish({ type: "play" });
  }, [events]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    events.publish({ type: "reset" });
  }, [events]);

  const replay = useCallback(() => {
    setCurrentStepIndex(0);
    setIsPlaying(true);
    events.publish({ type: "play" });
  }, [events]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    timer.current = setTimeout(next, engine.getDuration(currentStepIndex, speed));
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [currentStepIndex, engine, isPlaying, next, speed]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === " ") {
        event.preventDefault();
        setIsPlaying((value) => !value);
      }
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
      if (event.key === "Home") jumpTo(0);
      if (event.key === "End") jumpTo(engine.totalSteps - 1);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [engine.totalSteps, jumpTo, next, previous]);

  return {
    currentStep,
    currentStepIndex,
    totalSteps: engine.totalSteps,
    progress,
    isPlaying,
    speed,
    setSpeed,
    play,
    pause,
    reset,
    replay,
    next,
    previous,
    jumpTo,
    events,
  };
}

