import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, View } from "react-native";

import { vaultApi, Bundle } from "../../api/vault";
import { BundleCard } from "../../components/vault/BundleCard";
import { colors, typeScale } from "../../theme";

export function BundlesScreen() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await vaultApi.listBundles();
      setBundles(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleBuy(bundle: Bundle) {
    setCheckingOut(bundle.id);
    try {
      const { checkout_url } = await vaultApi.checkout({ bundle_id: bundle.id });
      await Linking.openURL(checkout_url);
    } catch (err) {
      Alert.alert("Couldn't start checkout", err instanceof Error ? err.message : "Try again in a moment.");
    } finally {
      setCheckingOut(null);
    }
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
      <Text style={styles.header}>Upgrade Your Vault</Text>
      <Text style={styles.subhead}>The more you bundle, the more she saves.</Text>

      {bundles.map((bundle) => (
        <View key={bundle.id} style={styles.cardWrap}>
          <BundleCard
            name={bundle.name}
            description={bundle.description}
            price={bundle.price}
            individualTotal={bundle.individual_total}
            savings={bundle.savings}
            productCount={bundle.products.length}
            isFoundingMember={bundle.is_founding_member}
            onPress={() => handleBuy(bundle)}
          />
          {checkingOut === bundle.id && <ActivityIndicator color={colors.gold} style={styles.loader} />}
        </View>
      ))}
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
  subhead: {
    ...typeScale.body,
    color: colors.ink,
    opacity: 0.7,
    marginTop: -12,
  },
  cardWrap: {
    gap: 8,
  },
  loader: {
    marginTop: -8,
  },
});
