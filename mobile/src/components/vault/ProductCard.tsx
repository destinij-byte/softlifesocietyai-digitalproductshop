import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, typeScale } from "../../theme";

interface ProductCardProps {
  title: string;
  type: string;
  price: number;
  thumbnailUrl?: string;
  owned?: boolean;
  locked?: boolean;
  onPress: () => void;
}

export function ProductCard({ title, type, price, thumbnailUrl, owned, locked, onPress }: ProductCardProps) {
  return (
    <Pressable style={[styles.card, locked && styles.cardLocked]} onPress={onPress}>
      {thumbnailUrl ? (
        <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} resizeMode="cover" />
      ) : (
        <View style={styles.thumbnailPlaceholder}>
          <Text style={styles.thumbnailEmoji}>{locked ? "🔒" : "🎀"}</Text>
        </View>
      )}
      <Text style={styles.type}>{type}</Text>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <View style={styles.footer}>
        {owned ? (
          <Text style={styles.ownedLabel}>✨ In your Vault</Text>
        ) : locked ? (
          <Text style={styles.lockedLabel}>Vault members only</Text>
        ) : (
          <Text style={styles.price}>${price.toFixed(0)}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cream,
    borderRadius: 18,
    padding: 14,
    gap: 6,
    width: 160,
  },
  cardLocked: {
    opacity: 0.6,
  },
  thumbnail: {
    width: "100%",
    height: 110,
    borderRadius: 12,
    marginBottom: 4,
  },
  thumbnailPlaceholder: {
    width: "100%",
    height: 110,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: colors.blush,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnailEmoji: {
    fontSize: 32,
  },
  type: {
    ...typeScale.label,
    color: colors.gold,
    textTransform: "uppercase",
  },
  title: {
    ...typeScale.h3,
    fontSize: 16,
    lineHeight: 20,
    color: colors.ink,
  },
  footer: {
    marginTop: 4,
  },
  price: {
    ...typeScale.button,
    color: colors.gold,
  },
  ownedLabel: {
    ...typeScale.bodySmall,
    color: colors.ink,
    opacity: 0.7,
  },
  lockedLabel: {
    ...typeScale.bodySmall,
    color: colors.ink,
    opacity: 0.5,
  },
});
