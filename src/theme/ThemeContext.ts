import React from 'react';

export type ThemeMode = 'dark' | 'light';

export interface Theme {
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    accent: string;
    accentSecondary: string;
    textPrimary: string;
    textSecondary: string;
    success: string;
    warning: string;
    error: string;
    overlay: string;
  };
  spacing: (multiplier?: number) => number;
  radius: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
    pill: number;
  };
  shadows: {
    level1: string;
    level2: string;
    level3: string;
    level4: string;
  };
}

export const ThemeContext = React.createContext<Theme | undefined>(undefined);

export const useTheme = (): Theme => {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error('ThemeContext value is missing');
  }
  return ctx;
};
