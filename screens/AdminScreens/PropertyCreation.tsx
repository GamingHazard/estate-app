import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

export function PropertyCreation() {
  const { colors } = useTheme();
  const [images, setImages] = useState<string[]>([]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    input: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    imageUploadContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    addImageButton: {
      width: 100,
      height: 100,
      backgroundColor: colors.card,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    submitButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    submitButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Property Title"
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            style={styles.input}
            placeholder="Price"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Location"
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Description"
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Bedrooms"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Bathrooms"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Area (sq ft)"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Images</Text>
          <View style={styles.imageUploadContainer}>
            <TouchableOpacity style={styles.addImageButton}>
              <MaterialIcons name="add-photo-alternate" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Create Property</Text>
        </TouchableOpacity>
      </ScrollView>
  );
}