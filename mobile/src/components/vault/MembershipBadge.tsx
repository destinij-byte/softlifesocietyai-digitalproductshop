import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, typeScale } from "../../theme";

interface MembershipBadgeProps {
  badge: string;
}

export function MembershipBadge({ badge }: MembershipBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{badge}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  text: {
    ...typeScale.label,
    color: colors.ivory,
  },
});
