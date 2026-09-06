import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, typeScale } from "../../theme";
import { ProgressBar } from "./ProgressBar";

interface CourseCardProps {
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  percentComplete?: number;
  onPress: () => void;
}

export function CourseCard({
  title,
  description,
  price,
  thumbnailUrl,
  percentComplete,
  onPress,
}: CourseCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {thumbnailUrl ? (
        <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} resizeMode="cover" />
      ) : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.price}>${price.toFixed(0)}</Text>
        {percentComplete !== undefined && (
          <View style={styles.progressWrap}>
            <ProgressBar percentComplete={percentComplete} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cream,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  thumbnail: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    marginBottom: 4,
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
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  price: {
    ...typeScale.button,
    color: colors.gold,
  },
  progressWrap: {
    flex: 1,
    marginLeft: 16,
  },
});
