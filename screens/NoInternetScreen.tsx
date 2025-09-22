import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useInternetConnection } from '../hooks/useInternetConnection';

const NoInternetScreen = () => {
  const { colors } = useTheme();
  const isConnected = useInternetConnection();

  const tryAgain = () => {
    // Force re-render to check connection again
    // The useInternetConnection hook will automatically update
  };

  if (isConnected) {
    return null; // Don't render anything if we have internet
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Ionicons name="cloud-offline-outline" size={100} color={colors.primary} />
      
      <Text style={[styles.title, { color: colors.text }]}>No Internet Connection</Text>
      
      <Text style={[styles.message, { color: colors.textMuted }]}>
        Please check your internet connection and try again.
      </Text>

      <View style={styles.infoContainer}>
        <Text style={[styles.infoText, { color: colors.textMuted }]}>
          • Check your Wi-Fi connection
        </Text>
        <Text style={[styles.infoText, { color: colors.textMuted }]}>
          • Check your mobile data
        </Text>
        <Text style={[styles.infoText, { color: colors.textMuted }]}>
          • Put your device in airplane mode and turn it off
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={tryAgain}
      >
        <Text style={styles.buttonText}>Try Again</Text>
        <Ionicons name="refresh" size={20} color="white" style={styles.buttonIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  infoContainer: {
    width: '100%',
    marginBottom: 40,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 5,
  },
});

export default NoInternetScreen;