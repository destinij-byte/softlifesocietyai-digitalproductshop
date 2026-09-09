import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { vaultApi, Drop } from "../../api/vault";
import { ProductCard } from "../../components/vault/ProductCard";
import { colors, typeScale } from "../../theme";
import type { VaultStackParamList } from "../../navigation/VaultNavigator";

type Nav = NativeStackNavigationProp<VaultStackParamList, "MonthlyDrops">;

function formatMonth(month: string): string {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(year, m - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function MonthlyDropsScreen() {
  const navigation = useNavigation<Nav>();
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vaultApi.getDrops();
      setDrops(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handlePress(productId: string, unlocked: boolean) {
    if (!unlocked) {
      navigation.navigate("Bundles");
      return;
    }
    const { download_url } = await vaultApi.getDownloadUrl(productId);
    await Linking.openURL(download_url);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Monthly Drops</Text>
      {drops.length === 0 ? (
        <Text style={styles.empty}>Nothing here yet — but she's about to have options.</Text>
      ) : (
        drops.map((drop) => (
          <View key={drop.month} style={styles.dropSection}>
            <View style={styles.dropHeaderRow}>
              <Text style={styles.dropMonth}>{formatMonth(drop.month)}</Text>
              {!drop.unlocked && <Text style={styles.lockedPill}>Vault members only</Text>}
            </View>
            <FlatList
              horizontal
              data={drop.products}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.row}
              renderItem={({ item }) => (
                <ProductCard
                  title={item.title}
                  type={item.type}
                  price={item.price}
                  thumbnailUrl={item.thumbnail_url}
                  locked={!drop.unlocked}
                  owned={drop.unlocked}
                  onPress={() => handlePress(item.id, drop.unlocked)}
                />
              )}
            />
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ivory,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
    gap: 20,
  },
  header: {
    ...typeScale.h1,
    color: colors.ink,
  },
  dropSection: {
    gap: 10,
  },
  dropHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropMonth: {
    ...typeScale.h3,
    color: colors.ink,
  },
  lockedPill: {
    ...typeScale.label,
    color: colors.ink,
    opacity: 0.6,
    backgroundColor: colors.cream,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  row: {
    gap: 14,
  },
  empty: {
    ...typeScale.body,
    color: colors.ink,
    opacity: 0.7,
  },
});
