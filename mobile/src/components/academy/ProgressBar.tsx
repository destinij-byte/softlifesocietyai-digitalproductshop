import React from "react";
import { StyleSheet, View } from "react-native";

import { colors } from "../../theme";

interface ProgressBarProps {
  percentComplete: number; // 0-100
}

export function ProgressBar({ percentComplete }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percentComplete));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.cream,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.blush,
  },
});
