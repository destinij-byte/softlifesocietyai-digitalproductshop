import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, typeScale } from "../../theme";

interface BundleCardProps {
  name: string;
  description: string;
  price: number;
  individualTotal: number;
  savings: number;
  productCount: number;
  isFoundingMember?: boolean;
  onPress: () => void;
}

export function BundleCard({
  name,
  description,
  price,
  individualTotal,
  savings,
  productCount,
  isFoundingMember,
  onPress,
}: BundleCardProps) {
  return (
    <Pressable style={[styles.card, isFoundingMember && styles.cardFounding]} onPress={onPress}>
      {isFoundingMember ? <Text style={styles.crown}>👑</Text> : null}
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.count}>{productCount} products</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>${price.toFixed(0)}</Text>
        <Text style={styles.strike}>${individualTotal.toFixed(0)}</Text>
      </View>
      <View style={styles.savingsPill}>
        <Text style={styles.savingsText}>Save ${savings.toFixed(0)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cream,
    borderRadius: 20,
    padding: 20,
    gap: 6,
  },
  cardFounding: {
    backgroundColor: colors.ink,
  },
  crown: {
    fontSize: 22,
    marginBottom: 2,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.ink,
  },
  description: {
    ...typeScale.body,
    color: colors.ink,
    opacity: 0.75,
  },
  count: {
    ...typeScale.bodySmall,
    color: colors.ink,
    opacity: 0.5,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
    marginTop: 8,
  },
  price: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.gold,
  },
  strike: {
    ...typeScale.body,
    color: colors.ink,
    opacity: 0.4,
    textDecorationLine: "line-through",
  },
  savingsPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.rose,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 4,
  },
  savingsText: {
    ...typeScale.label,
    color: colors.ivory,
  },
});
