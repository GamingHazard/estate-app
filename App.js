import { StatusBar } from "expo-status-bar";
import { StatusBar as RNStatusBar, useColorScheme } from "react-native";
import Navigation from "./components/Navigation";
import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Navigation />
        <RNStatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        />
      </NavigationContainer>
    </ThemeProvider>
  );
}

// Removed unnecessary styles for navigation
