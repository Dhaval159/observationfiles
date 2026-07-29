import { animationConfig } from "@/config/animations";

export type AnimationSpeed = "fast" | "normal" | "slow";
export type AnimationEase = "default" | "in" | "out";

export function getAnimationDuration(type: AnimationSpeed): number {
  return animationConfig.duration[type];
}

export function getAnimationEase(type: AnimationEase): number[] {
  return [...animationConfig.ease[type]] as number[];
}

export function staggerDelay(index: number, baseDelay: number = 0.05): number {
  return index * baseDelay;
}

export function shouldReduceMotion(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function getTransition(
  duration: AnimationSpeed = "normal",
  ease: AnimationEase = "default",
): { duration: number; ease: number[] } {
  return {
    duration: animationConfig.duration[duration],
    ease: [...animationConfig.ease[ease]],
  };
}

export function getFadeInVariants(delay: number = 0): Record<string, unknown> {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay, duration: animationConfig.duration.normal },
    },
  };
}

export function getSlideUpVariants(delay: number = 0): Record<string, unknown> {
  return {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay, duration: animationConfig.duration.normal },
    },
  };
}

export function getSlideInVariants(
  direction: "left" | "right" = "left",
  delay: number = 0,
): Record<string, unknown> {
  const x = direction === "left" ? -20 : 20;
  return {
    hidden: { opacity: 0, x },
    visible: {
      opacity: 1,
      x: 0,
      transition: { delay, duration: animationConfig.duration.normal },
    },
  };
}

export function getScaleVariants(delay: number = 0): Record<string, unknown> {
  return {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay, duration: animationConfig.duration.normal },
    },
  };
}

export function createListVariants(staggerChildren: number = 0.05): {
  container: Record<string, unknown>;
  item: Record<string, unknown>;
} {
  return {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren },
      },
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: animationConfig.duration.normal },
      },
    },
  };
}
