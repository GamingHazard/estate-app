import React, { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "../shared/theme/ThemeContext";
import { AuthProvider, useAuth } from "../features/auth/AuthContext";
import { SavedPropertiesProvider } from "../features/properties/SavedPropertiesContext";
import { getErrorMessage, queryClient } from "../shared/queryClient";
import ThemedNavigation from "./navigation/ThemedNavigation";
import SplashScreen from "../shared/components/SplashScreen";
import { preloadImages } from "../shared/utils/imagePreloader";
import { parsePropertyListResponse } from "../data/property";
import {
  marketplaceDealsQueryOptions,
  marketplacePropertiesQueryOptions,
} from "../features/properties/marketplaceQueries";

const AppStatusBar = ({ isSplash = false }: { isSplash?: boolean }) => {
  const { colors, theme } = useTheme();

  return (
    <StatusBar
      barStyle={theme === "dark" ? "light-content" : "dark-content"}
      backgroundColor={
        isSplash ? (theme === "dark" ? "#1F2937" : "#FFFFFF") : colors.background
      }
      translucent={false}
    />
  );
};

const StartupGate = () => {
  const { isRestoringSession } = useAuth();
  const startupQueryClient = useQueryClient();
  const [propertiesStatus, setPropertiesStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [propertiesError, setPropertiesError] = useState("");
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [continueOffline, setContinueOffline] = useState(false);

  useEffect(() => {
    void preloadImages();
    void startupQueryClient
      .fetchQuery(marketplaceDealsQueryOptions())
      .catch((error) => {
        console.error("Unable to prefetch marketplace deals:", error);
      });
  }, [startupQueryClient]);

  useEffect(() => {
    let active = true;
    setPropertiesStatus("loading");
    setPropertiesError("");

    void startupQueryClient
      .fetchQuery(marketplacePropertiesQueryOptions())
      .then((response) => {
        parsePropertyListResponse(response);
        if (active) setPropertiesStatus("ready");
      })
      .catch((error) => {
        console.error("Unable to preload marketplace properties:", error);
        if (active) {
          setPropertiesError(getErrorMessage(error));
          setPropertiesStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [retryAttempt, startupQueryClient]);

  if (isRestoringSession) {
    return (
      <>
        <AppStatusBar isSplash />
        <SplashScreen statusMessage="Restoring your account..." />
      </>
    );
  }

  if (propertiesStatus === "loading") {
    return (
      <>
        <AppStatusBar isSplash />
        <SplashScreen statusMessage="Loading properties..." />
      </>
    );
  }

  if (propertiesStatus === "error" && !continueOffline) {
    return (
      <>
        <AppStatusBar isSplash />
        <SplashScreen
          errorMessage={`Could not load properties. ${propertiesError}`}
          onRetry={() => {
            setContinueOffline(false);
            setRetryAttempt((attempt) => attempt + 1);
          }}
          onContinueOffline={() => setContinueOffline(true)}
        />
      </>
    );
  }

  return (
    <>
      <ThemedNavigation />
      <AppStatusBar />
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SavedPropertiesProvider>
            <SafeAreaProvider>
              <NavigationContainer>
                <StartupGate />
              </NavigationContainer>
            </SafeAreaProvider>
          </SavedPropertiesProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
