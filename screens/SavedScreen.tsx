import React, { useState, useEffect } from "react";
import { useInternetConnection } from '../hooks/useInternetConnection';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { mockProperties } from "../data/mockData";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../types';
import SkeletonLoader from '../components/SkeletonLoader';

const SavedScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const isConnected = useInternetConnection();
  const savedProperties = mockProperties.filter(property => property.saved);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const noImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/624px-No-Image-Placeholder.svg.png';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.text }]}>Saved Properties</Text>
      </View>
      {!isConnected && (
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
          <Text style={{ color: 'red' }}>No internet connection detected. Some features may be unavailable.</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.content}>
          <SkeletonLoader style={{ width: '100%', height: 120, borderRadius: 10, marginBottom: 15 }} />
          <SkeletonLoader style={{ width: '100%', height: 120, borderRadius: 10, marginBottom: 15 }} />
          <SkeletonLoader style={{ width: '100%', height: 120, borderRadius: 10, marginBottom: 15 }} />
          <SkeletonLoader style={{ width: '100%', height: 120, borderRadius: 10, marginBottom: 15 }} />
        </View>
      ) : (
        <View style={styles.content}>
          {savedProperties.length > 0 ? (
            savedProperties.map(property => (
              <TouchableOpacity 
                key={property.id} 
                style={[styles.card, { backgroundColor: colors.card }]}
                onPress={() => navigation.navigate('PropertyDetails', { property })}
              >
                <Image source={{ uri: property.thumbnail || noImage }} style={styles.cardImage} />
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{property.title}</Text>
                  <Text style={[styles.cardLocation, { color: colors.textMuted }]}>{property.location}</Text>
                  <Text style={[styles.cardPrice, { color: colors.primary }]}>
                    {property.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>You haven't saved any properties yet.</Text>
            </View>
          )}
        </View>
      )}
       <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
  },
  cardImage: {
    width: 120,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardLocation: {
    fontSize: 14,
    color: 'gray',
    marginVertical: 5,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 50,
  },
});

export default SavedScreen;
