import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useInternetConnection } from '../hooks/useInternetConnection';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

type AgentProfileScreenRouteProp = RouteProp<RootStackParamList, 'AgentProfile'>;

type Props = {
  route: AgentProfileScreenRouteProp;
};

const AgentProfileScreen = ({ route }: Props,) => {
  const { colors } = useTheme();
  const { agent } = route.params;
  const isConnected = useInternetConnection();
  const { width } = Dimensions.get("window");
  const navigation = useNavigation();

  const handleContact = (method: 'email' | 'phone') => {
    if (!isConnected) {
      return;
    }
    if (method === 'email') {
      Linking.openURL(`mailto:${agent.email}`);
    } else {
      Linking.openURL(`tel:${agent.phone}`);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: agent.avatar }} style={styles.avatar} />
          {agent.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
          )}
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{agent.name}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{agent.totalProperties}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Properties</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{agent.experience}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Years Exp.</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{agent.rating}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Rating</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        <Text style={[styles.bio, { color: colors.text }]}>{agent.bio}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Specializations</Text>
        <View style={styles.tagsContainer}>
          {agent.specializations.map((spec, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: colors.card }]}>
              <Text style={[styles.tagText, { color: colors.text }]}>{spec}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Languages</Text>
        <View style={styles.tagsContainer}>
          {agent.languages.map((language, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: colors.card }]}>
              <Text style={[styles.tagText, { color: colors.text }]}>{language}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Agent's Properties</Text>
        {agent.properties && agent.properties.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.propertiesContainer}
          >
            {agent.properties.map((property) => (
              <TouchableOpacity 
                key={property.id} 
                style={[styles.propertyCard, { backgroundColor: colors.card, width: width * 0.7 }]}
                onPress={() => navigation.navigate('PropertyDetails', { property })}
              >
                <Image source={{ uri: property.thumbnail }} style={styles.propertyImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.9)']}
                  style={styles.propertyGradient}
                />
                <Text style={styles.propertyStatus}>{property.status}</Text>
                <View style={styles.propertyInfo}>
                  <Text style={styles.propertyTitle}>{property.title}</Text>
                  <Text style={styles.propertyLocation}>
                    <Ionicons name="location-sharp" size={12} color="#fff" />
                    {property.location}
                  </Text>
                  <Text style={styles.propertyPrice}>
                    {property.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    {property.type === 'Apartment' || property.type === 'Co-working Space' || property.type === 'Office Space' ? ' / month' : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Text style={[styles.noProperties, { color: colors.textMuted }]}>
            No properties listed by this agent.
          </Text>
        )}
      </View>

      <View style={[styles.contactContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={[styles.contactButton, { backgroundColor: colors.primary }]}
          onPress={() => handleContact('phone')}
          disabled={!isConnected}
        >
          <Ionicons name="call" size={20} color="white" />
          <Text style={styles.contactButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.contactButton, { backgroundColor: colors.primary }]}
          onPress={() => handleContact('email')}
          disabled={!isConnected}
        >
          <MaterialCommunityIcons name="email" size={20} color="white" />
          <Text style={styles.contactButtonText}>Email</Text>
        </TouchableOpacity>
      </View>

      {!isConnected && (
        <View style={styles.offlineWarning}>
          <Text style={{ color: 'red' }}>No internet connection. Contact features unavailable.</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
  },
  propertiesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  propertyCard: {
    height: 200,
    marginRight: 15,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  propertyGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    borderRadius: 8,
  },
  propertyStatus: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    zIndex: 1,
  },
  propertyInfo: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  contactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    elevation: 2,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 25,
    width: '45%',
    gap: 8,
  },
  contactButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  offlineWarning: {
    alignItems: 'center',
    marginBottom: 20,
  },
  noProperties: {
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
  },
});

export default AgentProfileScreen;
