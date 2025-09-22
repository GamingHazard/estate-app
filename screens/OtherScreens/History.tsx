import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from "../../context/ThemeContext";

interface HistoryProps {
  // Add props here if needed
}

const mockSearched = [
  { id: '1', title: 'Luxury Villa in Beverly Hills' },
  { id: '2', title: 'Downtown Apartment' },
  { id: '3', title: 'Cozy Cottage by the Lake' },
];
const mockVisited = [
  { id: '4', title: 'Modern Loft in City Center' },
  { id: '5', title: 'Spacious Family Home' },
];

const History: React.FC<HistoryProps> = () => {
  const { colors, theme } = useTheme();
  const [searched, setSearched] = useState(mockSearched);
  const [visited, setVisited] = useState(mockVisited);

  const clearHistory = () => {
    setSearched([]);
    setVisited([]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}> 
       

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recently Searched Properties</Text>
        {searched.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="magnify" size={32} color={colors.card} />
            <Text style={{ color: colors.text, marginTop: 8 }}>No recent searches.</Text>
          </View>
        ) : (
          searched.map(item => (
            <View key={item.id} style={styles.card}>
              <MaterialCommunityIcons name="magnify" size={24} color={colors.primary} style={{ marginRight: 10 }} />
              <Text style={styles.item}>{item.title}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recently Visited Properties</Text>
        {visited.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="home-search" size={32} color={colors.card} />
            <Text style={{ color: colors.text, marginTop: 8 }}>No recently visited properties.</Text>
          </View>
        ) : (
          visited.map(item => (
            <View key={item.id} style={styles.card}>
              <MaterialCommunityIcons name="home-search" size={24} color={colors.primary} style={{ marginRight: 10 }} />
              <Text style={styles.item}>{item.title}</Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={[styles.clearBtn, { backgroundColor: colors.primary }]} onPress={clearHistory}>
        <MaterialCommunityIcons name="delete" size={20} color="#fff" style={{ marginRight: 6 }} />
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Clear History</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  item: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  clearBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
});

export default History;
