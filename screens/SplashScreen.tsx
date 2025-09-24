import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
  Image,
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
      {/* Background Image
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80'
        }}
        style={styles.backgroundImage}
      />
       */}
      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
        style={styles.gradient}
      />
      
      {/* Main Content */}
      <View style={styles.content}>
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
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Loading amazing properties...</Text>
      </View>

      {/* Background Design Elements */}
      <View style={styles.backgroundElements}>
        <MaterialCommunityIcons
          name="office-building"
          size={40}
          color="rgba(255,255,255,0.1)"
          style={styles.bgIcon1}
        />
        <MaterialCommunityIcons
          name="home-modern"
          size={40}
          color="rgba(255,255,255,0.1)"
          style={styles.bgIcon2}
        />
        <MaterialCommunityIcons
          name="warehouse"
          size={40}
          color="rgba(255,255,255,0.1)"
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
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 30,
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
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 10,
    fontSize: 14,
  },
  backgroundElements: {
    position: 'absolute',
    width: width,
    height: height,
    opacity: 0.1,
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