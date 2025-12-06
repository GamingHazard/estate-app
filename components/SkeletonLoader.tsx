import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated, Easing, Dimensions } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const SkeletonLoader = ({ style }: { style?: any }) => {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [animatedValue]);

  // Make the shimmer wider than the container so it visibly sweeps across
  const shimmerWidth = Math.max(120, width * 0.8);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-shimmerWidth, shimmerWidth],
  });

  // If theme uses identical card/border colors (dark theme), fall back to a muted color to provide contrast
  const gradientMiddle =
    colors.border !== colors.card
      ? colors.border
      : colors.muted || colors.background;
  const gradientColors = [colors.card, gradientMiddle, colors.card];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, position: "relative" },
        style,
      ]}
    >
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: -shimmerWidth / 2,
          width: shimmerWidth,
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});

export default SkeletonLoader;
