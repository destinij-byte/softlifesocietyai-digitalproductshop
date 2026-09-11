import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { useTheme } from "../theme/ThemeContext";
import { HomeScreen } from "../screens/HomeScreen";
import { YourAIScreen } from "../screens/YourAIScreen";
import { NourishAIScreen } from "../screens/NourishAIScreen";
import { GoalsScreen } from "../screens/GoalsScreen";
import { RoutinesScreen } from "../screens/RoutinesScreen";
import { ChallengesScreen } from "../screens/ChallengesScreen";
import { MeScreen } from "../screens/MeScreen";

const Tab = createBottomTabNavigator();

// Tab bar layout (7 tabs) is a placeholder - the prototype may group these
// differently (e.g. a "More" tab, or Challenges nested under Home). Swap
// this out once the screenshots are shared.
export function RootNavigator() {
  const { palette } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.text,
        tabBarStyle: { backgroundColor: palette.card, borderTopColor: palette.cardSecondary },
        tabBarActiveTintColor: palette.gold,
        tabBarInactiveTintColor: palette.mutedText,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "✨ Home" }} />
      <Tab.Screen name="YourAI" component={YourAIScreen} options={{ title: "Your AI", tabBarLabel: "🌙 Your AI" }} />
      <Tab.Screen name="NourishAI" component={NourishAIScreen} options={{ title: "Nourish AI", tabBarLabel: "🍽️ Nourish" }} />
      <Tab.Screen name="Goals" component={GoalsScreen} options={{ tabBarLabel: "🎯 Goals" }} />
      <Tab.Screen name="Routines" component={RoutinesScreen} options={{ tabBarLabel: "☀️ Routines" }} />
      <Tab.Screen name="Challenges" component={ChallengesScreen} options={{ tabBarLabel: "🔥 Challenges" }} />
      <Tab.Screen name="Me" component={MeScreen} options={{ tabBarLabel: "👤 Me" }} />
    </Tab.Navigator>
  );
}
