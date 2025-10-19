import { Theme, ThemeMode } from './ThemeContext';

const spacingUnit = 4;

const colorsDark: Theme['colors'] = {
  background: '#1A1625',
  surface: '#2D1B3D',
  surfaceAlt: '#3A2F4A',
  accent: '#9B7FFF',
  accentSecondary: '#FF6B9D',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.7)',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#FF5252',
  overlay: 'rgba(0,0,0,0.4)',
};

const colorsLight: Theme['colors'] = {
  background: '#F5F1FF',
  surface: '#FFFFFF',
  surfaceAlt: '#F2ECFF',
  accent: '#6B4FE0',
  accentSecondary: '#FF6B9D',
  textPrimary: '#1A1625',
  textSecondary: 'rgba(26,22,37,0.7)',
  success: '#388E3C',
  warning: '#F9A825',
  error: '#D32F2F',
  overlay: 'rgba(0,0,0,0.3)',
};

export const buildTheme = (mode: ThemeMode): Theme => {
  const colors = mode === 'light' ? colorsLight : colorsDark;

  return {
    mode,
    colors,
    spacing: (multiplier = 1) => spacingUnit * multiplier,
    radius: {
      xs: 4,
      s: 8,
      m: 12,
      l: 16,
      xl: 20,
      xxl: 24,
      pill: 999,
    },
    shadows: {
      level1: '0px 2px 4px rgba(0,0,0,0.2)',
      level2: '0px 4px 8px rgba(0,0,0,0.3)',
      level3: '0px 8px 16px rgba(0,0,0,0.4)',
      level4: '0px 12px 24px rgba(0,0,0,0.5)',
    },
  };
};
