import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

import { vaultApi, Order } from "../../api/vault";
import { colors, typeScale } from "../../theme";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vaultApi.getOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>My Purchases</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Nothing here yet — but she's about to have options.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.date}>{formatDate(item.created_at)}</Text>
              <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
            </View>
            {item.items.map((line, idx) => (
              <Text key={idx} style={styles.itemTitle}>
                {line.title}
              </Text>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ivory,
    paddingTop: 24,
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
    marginBottom: 16,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: colors.cream,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  date: {
    ...typeScale.bodySmall,
    color: colors.ink,
    opacity: 0.6,
  },
  amount: {
    ...typeScale.button,
    color: colors.gold,
  },
  itemTitle: {
    ...typeScale.body,
    color: colors.ink,
  },
  empty: {
    ...typeScale.body,
    color: colors.ink,
    opacity: 0.7,
    paddingHorizontal: 4,
  },
});
