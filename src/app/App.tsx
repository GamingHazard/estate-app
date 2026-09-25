import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "../shared/theme/ThemeContext";
import { AuthProvider } from "../features/auth/AuthContext";
import { SavedPropertiesProvider } from "../features/properties/SavedPropertiesContext";
import { queryClient } from "../shared/queryClient";
import ThemedNavigation from "./navigation/ThemedNavigation";
import SplashScreen from "../shared/components/SplashScreen";
import { preloadImages } from "../shared/utils/imagePreloader";
// ...existing code...

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await preloadImages();
    } catch (error) {
      console.error("Error during initialization:", error);
    }
  };

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SavedPropertiesProvider>
            <NavigationContainer>
              {isLoading ? (
                <SplashScreen onLoadComplete={handleLoadComplete} />
              ) : (
                <ThemedNavigation />
              )}
              <StatusBar style="light" />
            </NavigationContainer>
          </SavedPropertiesProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
