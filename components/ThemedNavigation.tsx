import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Navigation from './Navigation';

const ThemedNavigation = () => {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Navigation />
    </View>
  );
};

export default ThemedNavigation;