 import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onLoadComplete }) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

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

    // Simulate loading time (you'll replace this with actual image preloading)
    const timer = setTimeout(() => {
      onLoadComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={{
          uri:
            'https://t4.ftcdn.net/jpg/04/73/72/11/360_F_473721132_I9LNMCvx7Du6EdJNH91EywcNHzgtEclz.jpg',
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.35)"]}
        style={styles.gradient}
      />
      
      {/* Main Content */}
      <View style={styles.content} pointerEvents="none">
        {/* Logo and Icon */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <MaterialCommunityIcons
            name="home-city"
            size={80}
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
          <Text style={styles.title}>Property Consultants</Text>
          <Text style={styles.subtitle}>Your Dream Property Awaits</Text>
        </Animated.View>
      </View>

      {/* Loading Indicator */}
      <View style={styles.loaderContainer} pointerEvents="none">
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Loading app settings...</Text>
      </View>

      {/* Background Design Elements */}
      <View style={styles.backgroundElements} pointerEvents="none">
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // fallback while image loads
  },
  backgroundImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    width: width,
    height: height,
    // slightly dim the image visually (gradient sits on top for stronger dim)
    opacity: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 10,
    fontSize: 14,
  },
  backgroundElements: {
    position: 'absolute',
    width: width,
    height: height,
    opacity: 0.12,
  },
  bgIcon1: {
    position: 'absolute',
    top: '15%',
    left: '10%',
  },
  bgIcon2: {
    position: 'absolute',
    top: '35%',
    right: '15%',
  },
  bgIcon3: {
    position: 'absolute',
    bottom: '25%',
    left: '20%',
  },
});

export default SplashScreen;
