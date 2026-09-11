import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../theme/ThemeContext";
import { FONTS, SPACING } from "../theme/tokens";

interface PlaceholderScreenProps {
  emoji: string;
  title: string;
  note: string;
}

// Real layout for each screen is intentionally deferred until the prototype
// screenshots (interactive walkthrough + screens gallery) are shared - see
// the build brief. This just proves navigation + theming work end to end.
export function PlaceholderScreen({ emoji, title, note }: PlaceholderScreenProps) {
  const { palette } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.title, { color: palette.gold, fontFamily: FONTS.display }]}>{title}</Text>
      <Text style={[styles.note, { color: palette.mutedText, fontFamily: FONTS.body }]}>{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  emoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  note: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 280,
  },
});
