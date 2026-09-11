import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { DARK_PALETTE, GOLD_GRADIENT_DARK, GOLD_GRADIENT_LIGHT, LIGHT_PALETTE, Palette, ThemeMode } from "./tokens";

const STORAGE_KEY = "luna_theme_mode";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedScheme: "light" | "dark";
  palette: Palette;
  goldGradient: [string, string, string];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme() ?? "light");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") setModeState(stored);
    });
  }, []);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setSystemScheme(colorScheme ?? "light"));
    return () => sub.remove();
  }, []);

  function setMode(next: ThemeMode) {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }

  const resolvedScheme = mode === "system" ? systemScheme : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      setMode,
      resolvedScheme,
      palette: resolvedScheme === "dark" ? DARK_PALETTE : LIGHT_PALETTE,
      goldGradient: resolvedScheme === "dark" ? GOLD_GRADIENT_DARK : GOLD_GRADIENT_LIGHT,
    }),
    [mode, resolvedScheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
