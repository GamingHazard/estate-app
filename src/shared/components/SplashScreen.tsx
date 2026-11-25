import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";

type SplashScreenProps = {
  statusMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  onContinueOffline?: () => void;
};

const SplashScreen = ({
  statusMessage = "Preparing your app...",
  errorMessage,
  onRetry,
  onContinueOffline,
}: SplashScreenProps) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const backgroundColor = theme === "dark" ? "#1F2937" : "#FFFFFF";
  const foregroundColor = theme === "dark" ? "#FFFFFF" : "#1F2937";
  const logoSource =
    theme === "dark"
      ? require("../../../assets/logo-dark.png")
      : require("../../../assets/logo-light.png");
  const logoSize = width < 360 ? 176 : 208;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.Image
        accessibilityLabel="Property Consultants logo"
        source={logoSource}
        resizeMode="contain"
        style={[
          styles.logo,
          {
            width: logoSize,
            height: logoSize,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />

      <View
        style={[styles.loaderContainer, { bottom: 40 + insets.bottom }]}
        pointerEvents={errorMessage ? "auto" : "none"}
      >
        {errorMessage ? (
          <>
            <Text style={[styles.errorText, { color: foregroundColor }]}>
              {errorMessage}
            </Text>
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={onRetry}
                style={[
                  styles.retryButton,
                  { backgroundColor: foregroundColor },
                ]}
              >
                <Text style={[styles.retryText, { color: backgroundColor }]}>
                  Retry
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={onContinueOffline}
                style={[styles.offlineButton, { borderColor: foregroundColor }]}
              >
                <Text style={[styles.offlineText, { color: foregroundColor }]}>
                  Continue offline
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color={foregroundColor} />
            <Text style={[styles.loadingText, { color: foregroundColor }]}>
              {statusMessage}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    alignSelf: "center",
  },
  loaderContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    width: "100%",
    maxWidth: 440,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 16,
  },
  actions: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },
  retryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    fontSize: 14,
    fontWeight: "700",
  },
  offlineButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  offlineText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default SplashScreen;
