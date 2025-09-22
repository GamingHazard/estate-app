import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, RefreshControl } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { mockProperties } from "../data/mockData";
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../types';
import SkeletonLoader from '../components/SkeletonLoader';

const DealsScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const discountedProperties = mockProperties.filter(p => p.price < 300000);
  const hotDeals = mockProperties.filter(p => p.status === "For Rent");

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate a data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.text}
          titleColor={colors.text}
          title="Pull to refresh"
          progressBackgroundColor={colors.card}
        />
      }>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.text }]}>Deals and Discounts</Text>
      </View>

      {loading ? (
        <View style={styles.section}>
          <SkeletonLoader style={{ width: 150, height: 24, marginBottom: 15 }} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <SkeletonLoader style={{ width: 250, height: 200, borderRadius: 10, marginRight: 15 }} />
            <SkeletonLoader style={{ width: 250, height: 200, borderRadius: 10, marginRight: 15 }} />
          </ScrollView>
          <SkeletonLoader style={{ width: 200, height: 24, marginTop: 20, marginBottom: 15 }} />
          <SkeletonLoader style={{ width: '100%', height: 100, borderRadius: 10, marginBottom: 15 }} />
          <SkeletonLoader style={{ width: '100%', height: 100, borderRadius: 10, marginBottom: 15 }} />
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Hot Deals</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {hotDeals.map(property => {
                const oldPrice = property.price * 1.1; // Assume a 10% discount
                return (
                  <TouchableOpacity 
                    key={property.id} 
                    style={styles.card}
                    onPress={() => navigation.navigate('PropertyDetails', { property })}
                  >
                    <Image source={{ uri: property.thumbnail }} style={styles.cardImage} />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.gradient}
                    />
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{property.title}</Text>
                      <View style={styles.priceContainer}>
                        <Text style={[styles.oldPrice, { color: '#fff' }]}>
                          {oldPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </Text>
                        <Text style={styles.cardPrice}>
                          {property.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                          {property.type.includes('Apartment') || property.type.includes('Space') ? ' / month' : ''}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Discounted Properties</Text>
            {discountedProperties.map(property => {
              const oldPrice = property.price * 1.2; // Assume a 20% discount
              return (
                <TouchableOpacity 
                  key={property.id} 
                  style={[styles.listItem, { backgroundColor: colors.card }]}
                  onPress={() => navigation.navigate('PropertyDetails', { property })}
                >
                  <Image source={{ uri: property.thumbnail }} style={styles.listItemImage} />
                  <View style={styles.listItemContent}>
                    <Text style={[styles.listItemTitle, { color: colors.text }]}>{property.title}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.oldPrice, { color: colors.text }]}>
                        {oldPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </Text>
                      <Text style={[styles.listItemPrice, { color: colors.primary }]}>
                        {property.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        </>
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
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  card: {
    width: 250,
    height: 200,
    borderRadius: 10,
    marginRight: 15,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardPrice: {
    color: '#fff',
    fontSize: 14,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  listItemImage: {
    width: 100,
    height: 100,
  },
  listItemContent: {
    padding: 10,
    justifyContent: 'center',
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listItemPrice: {
    fontSize: 14,
    marginTop: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  oldPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
});

export default DealsScreen;
