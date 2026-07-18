"use client";

import { createContext, useContext } from "react";

import type { useAnimationController } from "@/hooks/use-animation-controller";

type AnimationController = ReturnType<typeof useAnimationController>;

const AnimationPlayerContext = createContext<AnimationController | null>(null);

export function AnimationPlayerProvider({
  value,
  children,
}: {
  value: AnimationController;
  children: React.ReactNode;
}) {
  return <AnimationPlayerContext.Provider value={value}>{children}</AnimationPlayerContext.Provider>;
}

export function useAnimationPlayer() {
  const value = useContext(AnimationPlayerContext);
  if (!value) {
    throw new Error("useAnimationPlayer must be used inside AnimationPlayerProvider");
  }
  return value;
}

