"use client";

import { Maximize2, Pause, Play, RotateCcw, Settings2, SkipBack, SkipForward } from "lucide-react";
import { useState } from "react";

import { useAnimationPlayer } from "@/components/visualization/context/animation-player-context";
import { Button } from "@/components/ui/button";
import type { AnimationSpeed } from "@/core/visualization/schema/animation-schema";

const speeds: AnimationSpeed[] = [0.25, 0.5, 1, 2, 4];

export function AnimationControls() {
  const [showOptions, setShowOptions] = useState(false);
  const {
    currentStepIndex,
    totalSteps,
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
  } = useAnimationPlayer();

  return (
    <section className="rounded-2xl border border-border bg-card p-3" aria-label="Animation controls">
      <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Step {currentStepIndex + 1} / {totalSteps}</span>
        <span>{progress}%</span>
      </div>
      <input
        aria-label="Animation timeline"
        type="range"
        min={0}
        max={totalSteps - 1}
        value={currentStepIndex}
        onChange={(event) => jumpTo(Number(event.target.value))}
        className="w-full"
      />
      <div className="mt-3 flex items-center justify-center gap-2">
        <Button type="button" variant="outline" size="icon" className="rounded-full" onClick={previous} aria-label="Previous step">
          <SkipBack aria-hidden={true} size={14} />
        </Button>
        <Button type="button" size="sm" className="rounded-full px-4" onClick={isPlaying ? pause : play} aria-label={isPlaying ? "Pause animation" : "Play animation"}>
          {isPlaying ? <Pause aria-hidden={true} size={14} /> : <Play aria-hidden={true} size={14} />}
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button type="button" variant="outline" size="icon" className="rounded-full" onClick={next} aria-label="Next step">
          <SkipForward aria-hidden={true} size={14} />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => setShowOptions((value) => !value)}
          aria-label="Animation options"
          title="Animation options"
        >
          <Settings2 aria-hidden={true} size={14} />
        </Button>
      </div>

      {showOptions ? (
        <div className="mt-3 rounded-2xl border border-border bg-background p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-muted-foreground">Speed</span>
            {speeds.map((item) => (
              <Button
                key={item}
                type="button"
                variant={speed === item ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setSpeed(item)}
              >
                {item}x
              </Button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={reset}>
              <RotateCcw aria-hidden={true} size={14} />
              Reset
            </Button>
            <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={replay}>
              Replay
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => document.documentElement.requestFullscreen?.()}
            >
              <Maximize2 aria-hidden={true} size={14} />
              Fullscreen
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
