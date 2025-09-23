import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { AdminLayout } from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { mockProperties, propertyStats, Property } from '../../data/mockProperties';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export function PropertiesManagement() {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [properties] = useState<Property[]>(mockProperties);
  const [isLoading] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    statsCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContent: {
      paddingBottom: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    statsValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    statsDescription: {
      fontSize: 12,
      color: colors.textMuted,
    },
    propertiesList: {
      marginTop: 16,
    },
    propertyCard: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    propertyHeader: {
      flexDirection: 'row',
      gap: 12,
    },
    propertyImage: {
      width: 64,
      height: 64,
      borderRadius: 4,
    },
    propertyInfo: {
      flex: 1,
    },
    propertyTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    propertyLocation: {
      fontSize: 14,
      color: colors.textMuted,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginTop: 4,
    },
    badgeText: {
      fontSize: 12,
      color: 'white',
    },
    agentInfo: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 4,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    button: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonText: {
      fontSize: 14,
      color: colors.text,
    },
  });

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'active':
        return { backgroundColor: colors.primary };
      case 'pending':
        return { backgroundColor: colors.warning };
      default:
        return { backgroundColor: colors.error };
    }
  };

  const renderPropertyItem = ({ item: property }: { item: any }) => (
    <View style={styles.propertyCard}>
      <View style={styles.propertyHeader}>
        <Image
          source={{ uri: property.thumbnailUrl }}
          style={styles.propertyImage}
        />
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle}>{property.title}</Text>
          <Text style={styles.propertyLocation}>{property.location}</Text>
          <View style={[styles.badge, getBadgeStyle(property.status)]}>
            <Text style={styles.badgeText}>{property.status}</Text>
          </View>
          <Text style={styles.agentInfo}>
            Listed by: {property.agent.name}
          </Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { padding: 8 }]}>
          <MaterialIcons name="more-vert" size={16} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Total Properties</Text>
            <MaterialIcons name="home" size={16} color={colors.textMuted} />
          </View>
          <Text style={styles.statsValue}>{propertyStats.total}</Text>
          <Text style={styles.statsDescription}>Active listings in the system</Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Pending Review</Text>
            <MaterialIcons name="assessment" size={16} color={colors.textMuted} />
          </View>
          <Text style={styles.statsValue}>{propertyStats.pending}</Text>
          <Text style={styles.statsDescription}>Properties awaiting review</Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Reported</Text>
            <MaterialIcons name="flag" size={16} color={colors.textMuted} />
          </View>
          <Text style={styles.statsValue}>{propertyStats.reported}</Text>
          <Text style={styles.statsDescription}>Properties with active reports</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={properties}
          renderItem={renderPropertyItem}
          keyExtractor={(item) => item.id}
          style={styles.propertiesList}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}