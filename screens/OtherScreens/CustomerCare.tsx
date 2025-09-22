import React, { useState } from "react";
import { useInternetConnection } from '../../hooks/useInternetConnection';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from "../../context/ThemeContext";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";


const faqs = [
  {
    question: "How do I reset my password?",
    answer: "Go to Account Settings > Account Recovery and follow the instructions to reset your password."
  },
  {
    question: "How can I contact customer support?",
    answer: "You can reach us via email at support@estateapp.com or call our hotline at 1-800-ESTATE."
  },
  {
    question: "How do I update my profile information?",
    answer: "Navigate to Profile > Edit Profile and update your information as needed."
  },
  {
    question: "Where can I find my saved properties?",
    answer: "Go to the Saved tab from the main navigation to view all your saved properties."
  },
  {
    question: "How do I enable notifications?",
    answer: "Visit Application Settings and toggle the notifications switch to enable or disable notifications."
  }
];

const CustomerCare: React.FC = () => {
  const isConnected = useInternetConnection();
  const { colors } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!subject || !description) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    // Here you would send the data to your backend or support system
    Alert.alert("Submitted", "Your issue has been reported. Our team will contact you soon.");
    setSubject("");
    setDescription("");
    setImages([]);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled && result.assets) {
      const selected = result.assets.map((asset: any) => asset.uri);
      setImages([...images, ...selected]);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}> 
      {!isConnected && (
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
          <Text style={{ color: 'red' }}>No internet connection detected. Some features may be unavailable.</Text>
        </View>
      )}
      <Text style={[styles.header, { color: colors.primary }]}>Customer Care Services</Text>
      <Text style={[styles.subHeader, { color: colors.text }]}>We're here to help you with any questions or issues.</Text>

      

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Report an Issue</Text>
        <View style={styles.formGroup}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            placeholder="Subject"
            placeholderTextColor={colors.textMuted}
            value={subject}
            onChangeText={setSubject}
          />
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text }]}
            placeholder="Describe your issue"
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          {/* Image Upload Btn */}
          <TouchableOpacity style={[styles.attachButton, { borderColor: colors.border }]} onPress={pickImage}>
            <Text style={{ color: colors.text, fontWeight: 'bold' }}>Attach Images/Screenshots <MaterialCommunityIcons name="camera-outline" color={colors.textMuted} size={20}/></Text>
          </TouchableOpacity>
          <View style={styles.imagePreviewContainer}>
            {images.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.imagePreview} />
            ))}
          </View>
          <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.bg }]} onPress={handleSubmit}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
        {faqs.map((faq, idx) => (
          <View key={idx} style={styles.faqItem}>
            <TouchableOpacity onPress={() => setExpandedIndex(expandedIndex === idx ? null : idx)}>
              <Text style={[styles.faqQuestion, { color: colors.primary }]}>{faq.question}</Text>
            </TouchableOpacity>
            {expandedIndex === idx && (
              <Text style={[styles.faqAnswer, { color: colors.text }]}>{faq.answer}</Text>
            )}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text,alignSelf:'center' }]}>Contact Us</Text>
        <View style={{gap:10, alignItems:'center', justifyContent:'center', flexDirection:"row",flexWrap:'wrap'}}>
            <View style={{ flexDirection:'row',justifyContent:'center',alignItems:'center',gap:4}} >
          <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted }}>support@estateapp.com</Text>
        </View>
        <View style={{ flexDirection:'row',justifyContent:'center',alignItems:'center',gap:4}} >
          <Ionicons name="call-outline" size={20} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted }}> +256 7xx-xxx-xxx</Text>
        </View>
        <View style={{ flexDirection:'row',justifyContent:'center',alignItems:'center',gap:4}} >
          <MaterialCommunityIcons name="whatsapp" size={20} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted }}> +256 7xx-xxx-xxx</Text>
        </View>
      </View>
      </View>

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
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  input: {
    
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    marginBottom: 12,
     
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  attachButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 10,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  faqItem: {
    marginBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    paddingBottom: 8,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "500",
  },
  faqAnswer: {
    fontSize: 14,
    marginTop: 6,
  },
});

export default CustomerCare;
