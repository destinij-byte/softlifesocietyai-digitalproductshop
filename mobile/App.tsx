import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import { AcademyNavigator } from "./src/navigation/AcademyNavigator";

export default function App() {
  return (
    <NavigationContainer>
      <AcademyNavigator />
    </NavigationContainer>
  );
}
