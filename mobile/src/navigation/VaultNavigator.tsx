import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { colors, fonts } from "../theme";
import { VaultDashboardScreen } from "../screens/vault/VaultDashboardScreen";
import { MyLibraryScreen } from "../screens/vault/MyLibraryScreen";
import { MonthlyDropsScreen } from "../screens/vault/MonthlyDropsScreen";
import { AiResourcesScreen } from "../screens/vault/AiResourcesScreen";
import { BundlesScreen } from "../screens/vault/BundlesScreen";
import { OrdersScreen } from "../screens/vault/OrdersScreen";

export type VaultStackParamList = {
  VaultDashboard: undefined;
  MyLibrary: { type?: string } | undefined;
  MonthlyDrops: undefined;
  AiResources: undefined;
  Bundles: undefined;
  Orders: undefined;
};

const Stack = createNativeStackNavigator<VaultStackParamList>();

export function VaultNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.ivory },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontFamily: fonts.displayMedium },
        contentStyle: { backgroundColor: colors.ivory },
      }}
    >
      <Stack.Screen name="VaultDashboard" component={VaultDashboardScreen} options={{ title: "The Vault" }} />
      <Stack.Screen name="MyLibrary" component={MyLibraryScreen} options={{ title: "My Library" }} />
      <Stack.Screen name="MonthlyDrops" component={MonthlyDropsScreen} options={{ title: "Monthly Drops" }} />
      <Stack.Screen name="AiResources" component={AiResourcesScreen} options={{ title: "AI Resources" }} />
      <Stack.Screen name="Bundles" component={BundlesScreen} options={{ title: "Upgrade" }} />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: "My Purchases" }} />
    </Stack.Navigator>
  );
}
