import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { vaultApi, LibraryItem } from "../../api/vault";
import { ProductCard } from "../../components/vault/ProductCard";
import { colors, typeScale } from "../../theme";
import type { VaultStackParamList } from "../../navigation/VaultNavigator";

type Nav = NativeStackNavigationProp<VaultStackParamList, "AiResources">;

export function AiResourcesScreen() {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vaultApi.getAiResources();
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>🤖 AI Resources</Text>
      <Text style={styles.subhead}>Your Soft Life AI prompt packs, all in one place.</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.empty}>This one's for Vault members only. Ready to upgrade?</Text>
            <Pressable style={styles.upgradeButton} onPress={() => navigation.navigate("Bundles")}>
              <Text style={styles.upgradeLabel}>See Bundles</Text>
            </Pressable>
          </View>
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
  },
  subhead: {
    ...typeScale.body,
    color: colors.ink,
    opacity: 0.7,
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 4,
  },
  grid: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 14,
  },
  gridRow: {
    justifyContent: "space-between",
  },
  emptyWrap: {
    gap: 12,
    paddingHorizontal: 4,
  },
  empty: {
    ...typeScale.body,
    color: colors.ink,
    opacity: 0.7,
  },
  upgradeButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  upgradeLabel: {
    ...typeScale.button,
    color: colors.ivory,
  },
});
