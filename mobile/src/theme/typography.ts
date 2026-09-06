/**
 * Load these via @expo-google-fonts/cormorant-garamond and
 * @expo-google-fonts/dm-sans (or the app's existing font loader) before
 * using these family names.
 */
export const fonts = {
  display: "CormorantGaramond_600SemiBold",
  displayMedium: "CormorantGaramond_500Medium",
  body: "DMSans_400Regular",
  bodyMedium: "DMSans_500Medium",
  bodyBold: "DMSans_700Bold",
} as const;

export const typeScale = {
  h1: { fontFamily: fonts.display, fontSize: 32, lineHeight: 40 },
  h2: { fontFamily: fonts.display, fontSize: 24, lineHeight: 32 },
  h3: { fontFamily: fonts.displayMedium, fontSize: 20, lineHeight: 28 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodySmall: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  button: { fontFamily: fonts.bodyBold, fontSize: 15, lineHeight: 20 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16 },
} as const;
