import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

type AgentProfileScreenRouteProp = RouteProp<RootStackParamList, 'AgentProfile'>;

type Props = {
  route: AgentProfileScreenRouteProp;
};

const AgentProfileScreen = ({ route }: Props) => {
  const { colors } = useTheme();
  const { agent } = route.params;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Image source={{ uri: agent.avatar }} style={styles.avatar} />
        <Text style={[styles.agentName, { color: colors.text }]}>{agent.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={[styles.rating, { color: colors.text }]}>{agent.rating.toFixed(1)}</Text>
          <Text style={[styles.reviewCount, { color: colors.textMuted }]}>
            ({agent.totalReviews} reviews)
          </Text>
        </View>
      </View>

      <View style={[styles.bioContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Bio</Text>
        <Text style={[styles.bio, { color: colors.text }]}>{agent.bio}</Text>
      </View>

      <View style={[styles.contactContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
        <View style={styles.contactItem}>
          <Ionicons name="mail" size={16} color={colors.primary} />
          <Text style={[styles.contactText, { color: colors.text }]}>{agent.email}</Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="call" size={16} color={colors.primary} />
          <Text style={[styles.contactText, { color: colors.text }]}>{agent.phone}</Text>
        </View>
      </View>

      <View style={[styles.experienceContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Experience</Text>
        <Text style={[styles.experienceText, { color: colors.text }]}>
          {agent.experience} years in the real estate business
        </Text>
      </View>

      <View style={[styles.specializationsContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Specializations</Text>
        {agent.specializations.map((spec, index) => (
          <Text key={index} style={[styles.specializationText, { color: colors.text }]}>
            • {spec}
          </Text>
        ))}
      </View>

      <View style={[styles.languagesContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Languages Spoken</Text>
        {agent.languages.map((lang, index) => (
          <Text key={index} style={[styles.languageText, { color: colors.text }]}>
            • {lang}
          </Text>
        ))}
      </View>

      <View style={styles.propertiesContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Properties Listed</Text>
        {/* Here you can map through agent.properties if you want to show the properties listed by the agent */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  agentName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  rating: {
    marginLeft: 5,
    fontSize: 16,
  },
  reviewCount: {
    marginLeft: 5,
    fontSize: 14,
  },
  bioContainer: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
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
  contactContainer: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 16,
  },
  experienceContainer: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
  },
  experienceText: {
    fontSize: 16,
    lineHeight: 24,
  },
  specializationsContainer: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
  },
  specializationText: {
    fontSize: 16,
    lineHeight: 24,
  },
  languagesContainer: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
  },
  languageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  propertiesContainer: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
  },
});

export default AgentProfileScreen;