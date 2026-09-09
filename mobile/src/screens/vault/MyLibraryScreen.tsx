import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";

import { vaultApi, LibraryItem } from "../../api/vault";
import { ProductCard } from "../../components/vault/ProductCard";
import { colors, typeScale } from "../../theme";
import type { VaultStackParamList } from "../../navigation/VaultNavigator";

type Rt = RouteProp<VaultStackParamList, "MyLibrary">;

export function MyLibraryScreen() {
  const { type: initialType } = useRoute<Rt>().params ?? {};
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [activeType, setActiveType] = useState<string | undefined>(initialType);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vaultApi.getLibrary();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function openProduct(item: LibraryItem) {
    const { download_url } = await vaultApi.getDownloadUrl(item.product.id);
    await Linking.openURL(download_url);
  }

  const types = useMemo(() => Array.from(new Set(items.map((item) => item.product.type))), [items]);
  const filtered = activeType ? items.filter((item) => item.product.type === activeType) : items;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>My Library</Text>

      {types.length > 1 && (
        <FlatList
          horizontal
          data={["All", ...types]}
          keyExtractor={(t) => t}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item: t }) => {
            const isActive = t === "All" ? activeType === undefined : activeType === t;
            return (
              <Pressable
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveType(t === "All" ? undefined : t)}
              >
                <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>{t}</Text>
              </Pressable>
            );
          }}
        />
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.product.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <Text style={styles.empty}>Nothing here yet — but she's about to have options.</Text>
        }
        renderItem={({ item }) => (
          <ProductCard
            title={item.product.title}
            type={item.product.type}
            price={item.product.price}
            thumbnailUrl={item.product.thumbnail_url}
            owned
            onPress={() => openProduct(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ivory,
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ivory,
  },
  header: {
    ...typeScale.h1,
    color: colors.ink,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterRow: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: colors.cream,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: colors.gold,
  },
  filterLabel: {
    ...typeScale.label,
    color: colors.ink,
  },
  filterLabelActive: {
    color: colors.ivory,
  },
  grid: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 14,
  },
  gridRow: {
    justifyContent: "space-between",
  },
  empty: {
    ...typeScale.body,
    color: colors.ink,
    opacity: 0.7,
    paddingHorizontal: 4,
  },
});
