import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  ImageBackground,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const SplashScreen = () => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const logoSize = width < 360 ? 72 : 80;

  useEffect(() => {
    // Start animations
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

  }, []);

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={{
          uri: "https://t4.ftcdn.net/jpg/04/73/72/11/360_F_473721132_I9LNMCvx7Du6EdJNH91EywcNHzgtEclz.jpg",
        }}
        style={[styles.backgroundImage, { width, height }]}
        resizeMode="cover"
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.35)"]}
        style={[styles.gradient, { height }]}
      />

      {/* Main Content */}
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
        ]}
        pointerEvents="none"
      >
        {/* Logo and Icon */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              width: logoSize + 40,
              height: logoSize + 40,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <MaterialCommunityIcons
            name="home-city"
            size={logoSize}
            color="white"
          />
        </Animated.View>

        {/* App Name and Tagline */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          <Text style={[styles.title, { fontSize: width < 360 ? 26 : 32 }]}>
            Property Consultants
          </Text>
          <Text style={[styles.subtitle, { fontSize: width < 360 ? 16 : 18 }]}>
            Your Dream Property Awaits
          </Text>
        </Animated.View>
      </View>

      {/* Loading Indicator */}
      <View
        style={[styles.loaderContainer, { bottom: 88 + insets.bottom }]}
        pointerEvents="none"
      >
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Loading app settings...</Text>
      </View>

      {/* Background Design Elements */}
      <View
        style={[styles.backgroundElements, { width, height }]}
        pointerEvents="none"
      >
        <MaterialCommunityIcons
          name="office-building"
          size={40}
          color="rgba(255,255,255,0.08)"
          style={styles.bgIcon1}
        />
        <MaterialCommunityIcons
          name="home-modern"
          size={40}
          color="rgba(255,255,255,0.08)"
          style={styles.bgIcon2}
        />
        <MaterialCommunityIcons
          name="warehouse"
          size={40}
          color="rgba(255,255,255,0.08)"
          style={styles.bgIcon3}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000", // fallback while image loads
  },
  backgroundImage: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    // slightly dim the image visually (gradient sits on top for stronger dim)
    opacity: 1,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
  content: {
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    alignSelf: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  textContainer: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  loaderContainer: {
    position: "absolute",
    bottom: 100,
    alignItems: "center",
  },
  loadingText: {
    color: "rgba(255,255,255,0.9)",
    marginTop: 10,
    fontSize: 14,
  },
  backgroundElements: {
    position: "absolute",
    opacity: 0.12,
  },
  bgIcon1: {
    position: "absolute",
    top: "15%",
    left: "10%",
  },
  bgIcon2: {
    position: "absolute",
    top: "35%",
    right: "15%",
  },
  bgIcon3: {
    position: "absolute",
    bottom: "25%",
    left: "20%",
  },
});

export default SplashScreen;
