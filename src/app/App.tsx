import React, { useState, useEffect } from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "../shared/theme/ThemeContext";
import { AuthProvider } from "../features/auth/AuthContext";
import { SavedPropertiesProvider } from "../features/properties/SavedPropertiesContext";
import { queryClient } from "../shared/queryClient";
import ThemedNavigation from "./navigation/ThemedNavigation";
import SplashScreen from "../shared/components/SplashScreen";
import { preloadImages } from "../shared/utils/imagePreloader";
// ...existing code...

const AppStatusBar = () => {
  const { colors, theme } = useTheme();

  return (
    <StatusBar
      barStyle={theme === "dark" ? "light-content" : "dark-content"}
      backgroundColor={colors.background}
      translucent={false}
    />
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      void preloadImages();
      await new Promise((resolve) => setTimeout(resolve, 1400));
    } catch (error) {
      console.error("Error during initialization:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SavedPropertiesProvider>
            <SafeAreaProvider>
              <NavigationContainer>
                {isLoading ? (
                  <SplashScreen />
                ) : (
                  <ThemedNavigation />
                )}
                <AppStatusBar />
              </NavigationContainer>
            </SafeAreaProvider>
          </SavedPropertiesProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
