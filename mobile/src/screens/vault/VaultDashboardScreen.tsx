import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { vaultApi, Dashboard } from "../../api/vault";
import { ProductCard } from "../../components/vault/ProductCard";
import { MembershipBadge } from "../../components/vault/MembershipBadge";
import { VaultTile } from "../../components/vault/VaultTile";
import { colors, fonts, typeScale } from "../../theme";
import type { VaultStackParamList } from "../../navigation/VaultNavigator";

type Nav = NativeStackNavigationProp<VaultStackParamList, "VaultDashboard">;

const APP_DEEP_LINK = process.env.EXPO_PUBLIC_APP_DEEP_LINK ?? "softlifesociety://home";

export function VaultDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vaultApi.getDashboard();
      setDashboard(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !dashboard) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable style={styles.openAppButton} onPress={() => Linking.openURL(APP_DEEP_LINK)}>
        <Text style={styles.openAppLabel}>OPEN THE APP</Text>
      </Pressable>

      {dashboard.membership_badge ? <MembershipBadge badge={dashboard.membership_badge} /> : null}
      <Text style={styles.welcome}>{dashboard.welcome_message}</Text>

      <View style={styles.tileGrid}>
        <VaultTile emoji="📚" label="My Library" onPress={() => navigation.navigate("MyLibrary")} />
        <VaultTile emoji="🎀" label="My Purchases" onPress={() => navigation.navigate("Orders")} />
        <VaultTile emoji="🗂️" label="Downloads" onPress={() => navigation.navigate("MyLibrary")} />
        <VaultTile emoji="✨" label="Monthly Drops" onPress={() => navigation.navigate("MonthlyDrops")} />
        <VaultTile emoji="🤖" label="AI Resources" onPress={() => navigation.navigate("AiResources")} />
        <VaultTile emoji="🎁" label="Member Bonuses" onPress={() => navigation.navigate("Bundles")} />
      </View>

      {dashboard.new_this_month.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New This Month</Text>
          <FlatList
            horizontal
            data={dashboard.new_this_month}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
            renderItem={({ item }) => (
              <ProductCard
                title={item.title}
                type={item.type}
                price={item.price}
                thumbnailUrl={item.thumbnail_url}
                locked
                onPress={() => navigation.navigate("MonthlyDrops")}
              />
            )}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Continue Your Journey</Text>
        {dashboard.continue_your_journey.length === 0 ? (
          <Text style={styles.empty}>Nothing here yet — but she's about to have options.</Text>
        ) : (
          <FlatList
            horizontal
            data={dashboard.continue_your_journey}
            keyExtractor={(item) => item.product.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
            renderItem={({ item }) => (
              <ProductCard
                title={item.product.title}
                type={item.product.type}
                price={item.product.price}
                thumbnailUrl={item.product.thumbnail_url}
                owned
                onPress={() => navigation.navigate("MyLibrary")}
              />
            )}
          />
        )}
      </View>
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
    gap: 16,
  },
  openAppButton: {
    alignSelf: "flex-end",
    backgroundColor: colors.ink,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  openAppLabel: {
    ...typeScale.label,
    color: colors.ivory,
    letterSpacing: 1,
  },
  welcome: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 40,
    color: colors.ink,
  },
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginTop: 8,
  },
  section: {
    gap: 12,
    marginTop: 8,
  },
  sectionTitle: {
    ...typeScale.h2,
    color: colors.ink,
  },
  row: {
    gap: 14,
  },
  empty: {
    ...typeScale.body,
    color: colors.ink,
    opacity: 0.6,
  },
});
