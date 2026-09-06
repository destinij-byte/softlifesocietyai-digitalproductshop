import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, typeScale } from "../../theme";

interface RecommendedNextCardProps {
  title: string;
  description: string;
  onPress: () => void;
}

export function RecommendedNextCard({ title, description, onPress }: RecommendedNextCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Recommended Next</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cream,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.rose,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.rose,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 4,
  },
  badgeText: {
    ...typeScale.label,
    color: colors.ivory,
    textTransform: "uppercase",
  },
  title: {
    ...typeScale.h3,
    color: colors.ink,
  },
  description: {
    ...typeScale.bodySmall,
    color: colors.ink,
    opacity: 0.7,
  },
});
