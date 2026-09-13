// Design tokens per the Soft Life Society AI build brief (v2). Exact hex
// values are locked by the brief - don't tweak these without checking the
// two Claude Artifact prototypes (interactive walkthrough + screens
// gallery), which are the source of truth for how they're actually used.

export interface Palette {
  background: string;
  card: string;
  cardSecondary: string;
  text: string;
  mutedText: string;
  blush: string;
  gold: string;
}

export const LIGHT_PALETTE: Palette = {
  background: "#FFF9F6", // cream
  card: "#FCEEF3", // soft pink
  cardSecondary: "#F6C8D8", // blush
  text: "#1A1A1A",
  mutedText: "#4A4038",
  blush: "#F6C8D8",
  gold: "#D4AF37",
};

export const DARK_PALETTE: Palette = {
  background: "#111111",
  card: "#1A1A1A",
  cardSecondary: "#242024",
  text: "#FFF9F6",
  mutedText: "#C9BEC3",
  blush: "#F6C8D8",
  gold: "#D4AF37",
};

// Used on primary CTA buttons, progress rings/bars, and accent details.
export const GOLD_GRADIENT_LIGHT: [string, string, string] = ["#F6E2A0", "#D4AF37", "#A87A1F"];
export const GOLD_GRADIENT_DARK: [string, string, string] = ["#F6E2A0", "#D4AF37", "#9C7A2E"];

export const FONTS = {
  display: "PlayfairDisplay_700Bold",
  displayRegular: "PlayfairDisplay_400Regular",
  body: "Poppins_400Regular",
  bodyMedium: "Poppins_500Medium",
  bodySemiBold: "Poppins_600SemiBold",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
};

export type ThemeMode = "light" | "dark" | "system";
