import React, { PropsWithChildren, useMemo } from 'react';
import { ThemeContext, ThemeMode } from './ThemeContext';
import { buildTheme } from './themeBuilder';

interface ThemeProviderProps {
  colorScheme: 'light' | 'dark' | null;
}

export const ThemeProvider: React.FC<PropsWithChildren<ThemeProviderProps>> = ({
  colorScheme,
  children,
}) => {
  const mode: ThemeMode = colorScheme === 'dark' ? 'dark' : 'dark';
  // App is designed around a dark, premium aesthetic. For now we keep dark mode only.

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};
