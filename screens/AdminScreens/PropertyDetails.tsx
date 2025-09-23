import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { AdminLayout } from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { mockProperties, Property } from '../../data/mockProperties';

export function PropertyDetails({ propertyId }: { propertyId: string }) {
  const { colors } = useTheme();
  const windowWidth = Dimensions.get('window').width;
  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    const foundProperty = mockProperties.find(p => p.id === propertyId);
    setProperty(foundProperty || null);
  }, [propertyId]);

  const updatePropertyStatus = async (newStatus: 'active' | 'pending' | 'rejected') => {
    try {
      // Simulate API call
      setProperty(prev => prev ? { ...prev, status: newStatus } : null);
      Alert.alert('Success', 'Property status has been updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update property status.');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      gap: 16,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    mainImage: {
      width: '100%',
      height: 200,
      borderRadius: 8,
    },
    propertyTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 16,
    },
    propertyLocation: {
      fontSize: 16,
      color: colors.textMuted,
      marginTop: 4,
    },
    badgeContainer: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    badgeText: {
      fontSize: 12,
      color: 'white',
    },
    detailsSection: {
      marginTop: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    detailsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    detailItem: {
      width: '50%',
      marginBottom: 16,
    },
    detailLabel: {
      fontSize: 14,
      color: colors.textMuted,
    },
    detailValue: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    agentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 8,
    },
    agentAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    agentInfo: {
      flex: 1,
    },
    agentName: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    agentEmail: {
      fontSize: 14,
      color: colors.textMuted,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 16,
    },
    button: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '500',
      color: 'white',
    },
    description: {
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 20,
    },
    imagesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    imageThumb: {
      width: (windowWidth - 48) / 2,
      height: (windowWidth - 48) / 2,
      borderRadius: 8,
    },
  });

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'active':
        return { backgroundColor: colors.primary };
      case 'pending':
        return { backgroundColor: colors.primary + '80' };
      default:
        return { backgroundColor: colors.destructive };
    }
  };

  if (!property) return null;

  return (
    <AdminLayout title="Property Details">
      <ScrollView style={styles.container}>
        {/* Property Overview */}
        <View style={styles.card}>
          <Image
            source={{ uri: property.mainImage }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <Text style={styles.propertyTitle}>{property.title}</Text>
          <Text style={styles.propertyLocation}>{property.location}</Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
              <Text style={styles.badgeText}>{property.type}</Text>
            </View>
            <View style={[styles.badge, getBadgeStyle(property.status)]}>
              <Text style={styles.badgeText}>{property.status}</Text>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Property Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Price</Text>
                <Text style={styles.detailValue}>${property.price}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Bedrooms</Text>
                <Text style={styles.detailValue}>{property.bedrooms}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Bathrooms</Text>
                <Text style={styles.detailValue}>{property.bathrooms}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Area</Text>
                <Text style={styles.detailValue}>{property.area} sq ft</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Listed By</Text>
            <View style={styles.agentContainer}>
              <Image
                source={{ uri: property.agent.avatar }}
                style={styles.agentAvatar}
              />
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>{property.agent.name}</Text>
                <Text style={styles.agentEmail}>{property.agent.email}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Admin Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => updatePropertyStatus('active')}
                disabled={property.status === 'active'}
              >
                <Text style={styles.buttonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.destructive }]}
                onPress={() => updatePropertyStatus('rejected')}
                disabled={property.status === 'rejected'}
              >
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.muted }]}
                onPress={() => updatePropertyStatus('pending')}
                disabled={property.status === 'pending'}
              >
                <Text style={styles.buttonText}>Set Pending</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Property Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Description</Text>
          <Text style={styles.description}>{property.description}</Text>
        </View>

        {/* Property Images */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Property Images</Text>
          <View style={styles.imagesGrid}>
            {property.images?.map((image: string, index: number) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.imageThumb}
                resizeMode="cover"
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </AdminLayout>
  );
}