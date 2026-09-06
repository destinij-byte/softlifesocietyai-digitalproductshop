import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, typeScale } from "../../theme";

interface LessonListItemProps {
  title: string;
  order: number;
  durationSeconds: number;
  isCompleted: boolean;
  isCurrent: boolean;
  onPress: () => void;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

export function LessonListItem({
  title,
  order,
  durationSeconds,
  isCompleted,
  isCurrent,
  onPress,
}: LessonListItemProps) {
  return (
    <Pressable
      style={[styles.row, isCurrent && styles.currentRow]}
      onPress={onPress}
    >
      <View style={[styles.badge, isCompleted && styles.badgeCompleted]}>
        <Text style={[styles.badgeText, isCompleted && styles.badgeTextCompleted]}>
          {isCompleted ? "✓" : order}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, isCompleted && styles.titleCompleted]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.duration}>{formatDuration(durationSeconds)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.ivory,
    borderRadius: 12,
    gap: 12,
  },
  currentRow: {
    backgroundColor: colors.blush,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cream,
  },
  badgeCompleted: {
    backgroundColor: colors.gold,
  },
  badgeText: {
    ...typeScale.label,
    color: colors.ink,
  },
  badgeTextCompleted: {
    color: colors.ivory,
  },
  info: {
    flex: 1,
  },
  title: {
    ...typeScale.body,
    color: colors.ink,
  },
  titleCompleted: {
    color: colors.gold,
  },
  duration: {
    ...typeScale.bodySmall,
    color: colors.ink,
    opacity: 0.6,
  },
});
