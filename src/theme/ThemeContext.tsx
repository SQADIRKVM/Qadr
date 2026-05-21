import React, { createContext, useContext, useMemo } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';
import { getPalette, type ColorPalette, type AppearanceMode } from './palettes';

type ThemeContextValue = {
  colors: ColorPalette;
  appearance: AppearanceMode;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const appearance = useSettingsStore((s) => s.appearance);
  const value = useMemo(
    () => ({
      colors: getPalette(appearance),
      appearance,
    }),
    [appearance],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useColors(): ColorPalette {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useColors must be used within ThemeProvider');
  }
  return ctx.colors;
}

export function useThemeMode(): AppearanceMode {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return ctx.appearance;
}
