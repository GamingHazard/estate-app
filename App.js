import { StatusBar } from "expo-status-bar";
import { StatusBar as RNStatusBar, useColorScheme, View } from "react-native";
import Navigation from "./components/Navigation";
import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

function ThemedNavigation() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Navigation />
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <ThemedNavigation />
        <StatusBar hidden={true} />
      </NavigationContainer>
    </ThemeProvider>
  );
}
