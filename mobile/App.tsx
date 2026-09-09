import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import { AcademyNavigator } from "./src/navigation/AcademyNavigator";
import { VaultNavigator } from "./src/navigation/VaultNavigator";

// This Expo app builds two separate sites from one codebase - Academy
// (academy.softlifesocietyai.com) and the Vault (vault.softlifesocietyai.com).
// EXPO_PUBLIC_APP_MODULE picks which one a given build/run renders; it
// defaults to "academy" so the existing deployment is unaffected.
const APP_MODULE = process.env.EXPO_PUBLIC_APP_MODULE ?? "academy";

export default function App() {
  return (
    <NavigationContainer>
      {APP_MODULE === "vault" ? <VaultNavigator /> : <AcademyNavigator />}
    </NavigationContainer>
  );
}
