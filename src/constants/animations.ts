export const ANIMATION_TIMING = {
  instant: 0,
  quick: 200,
  standard: 350,
  slow: 550,
  extraSlow: 850,
} as const;

export const SPRING_PRESETS = {
  gesture: { damping: 10, stiffness: 100, mass: 0.8 },
  ui: { damping: 15, stiffness: 150, mass: 0.9 },
  celebration: { damping: 12, stiffness: 90, mass: 0.6 },
} as const;

export const EASING = {
  easeOutCubic: [0.215, 0.61, 0.355, 1],
  easeInOutCubic: [0.645, 0.045, 0.355, 1],
  linear: [0, 0, 1, 1],
} as const;
