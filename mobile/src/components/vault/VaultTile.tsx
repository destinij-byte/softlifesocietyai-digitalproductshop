import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, typeScale } from "../../theme";

interface VaultTileProps {
  emoji: string;
  label: string;
  onPress: () => void;
}

export function VaultTile({ emoji, label, onPress }: VaultTileProps) {
  return (
    <Pressable style={styles.tile} onPress={onPress}>
      <View style={styles.emojiWrap}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: "31%",
    backgroundColor: colors.cream,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    gap: 8,
  },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.ivory,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 20,
  },
  label: {
    ...typeScale.label,
    color: colors.ink,
    textAlign: "center",
  },
});
