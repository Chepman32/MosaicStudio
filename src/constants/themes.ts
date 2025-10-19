export const COLOR_PALETTE = {
  primaryPurple: '#9B7FFF',
  deepPurple: '#6B4FE0',
  coral: '#FF6B9D',
  gold: '#FFD700',
  deepBackground: '#1A1625',
  deepSurface: '#2D1B3D',
  surfaceLight: '#3A2F4A',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.7)',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#FF5252',
} as const;

export const TYPOGRAPHY = {
  hero: 34,
  title1: 28,
  title2: 24,
  title3: 20,
  body: 16,
  subhead: 14,
  caption: 12,
  finePrint: 10,
} as const;

export const SHADOW_LEVELS = {
  level1: {
    offsetY: 2,
    blur: 4,
    opacity: 0.2,
  },
  level2: {
    offsetY: 4,
    blur: 8,
    opacity: 0.3,
  },
  level3: {
    offsetY: 8,
    blur: 16,
    opacity: 0.4,
  },
  level4: {
    offsetY: 12,
    blur: 24,
    opacity: 0.5,
  },
} as const;
