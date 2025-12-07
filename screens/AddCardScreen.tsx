import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const AddCardScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const formatCardNumber = (text: any) => {
    // Remove any non-digit characters
    const cleaned = text.replace(/\D/g, "");
    // Add space after every 4 digits
    const formatted = cleaned.replace(/(\d{4})/g, "$1 ").trim();
    // Limit to 16 digits + spaces
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (text: any) => {
    // Remove any non-digit characters
    const cleaned = text.replace(/\D/g, "");
    // Add slash after 2 digits (MM/YY)
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleSaveCard = () => {
    // Validate card details
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      Alert.alert(
        "Invalid Card Number",
        "Please enter a valid 16-digit card number"
      );
      return;
    }
    if (cardHolderName.length < 3) {
      Alert.alert("Invalid Name", "Please enter the cardholder name");
      return;
    }
    if (expiryDate.length !== 5) {
      Alert.alert(
        "Invalid Expiry Date",
        "Please enter a valid expiry date (MM/YY)"
      );
      return;
    }
    if (cvv.length < 3) {
      Alert.alert("Invalid CVV", "Please enter a valid CVV");
      return;
    }

    // Here you would typically send the card details to your payment processor
    // For now, we'll just show a success message
    Alert.alert("Card Added", "Your card has been successfully added", [
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Add New Card
          </Text>
        </View>

        <View style={[styles.cardPreview, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="credit-card" size={32} color="white" />
          <Text style={styles.cardNumberPreview}>
            {cardNumber || "•••• •••• •••• ••••"}
          </Text>
          <View style={styles.cardPreviewBottom}>
            <Text style={styles.cardHolderPreview}>
              {cardHolderName || "CARD HOLDER NAME"}
            </Text>
            <Text style={styles.expiryPreview}>{expiryDate || "MM/YY"}</Text>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Card Number
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text },
              ]}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={colors.text + "80"}
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              keyboardType="numeric"
              maxLength={19}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Cardholder Name
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text },
              ]}
              placeholder="John Doe"
              placeholderTextColor={colors.text + "80"}
              value={cardHolderName}
              onChangeText={setCardHolderName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={[styles.label, { color: colors.text }]}>
                Expiry Date
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.card, color: colors.text },
                ]}
                placeholder="MM/YY"
                placeholderTextColor={colors.text + "80"}
                value={expiryDate}
                onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.text }]}>CVV</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.card, color: colors.text },
                ]}
                placeholder="123"
                placeholderTextColor={colors.text + "80"}
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={handleSaveCard}
      >
        <Text style={styles.saveButtonText}>Save Card</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  cardPreview: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cardNumberPreview: {
    color: "white",
    fontSize: 22,
    letterSpacing: 2,
    marginTop: 20,
    marginBottom: 20,
  },
  cardPreviewBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardHolderPreview: {
    color: "white",
    fontSize: 14,
  },
  expiryPreview: {
    color: "white",
    fontSize: 14,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },
  saveButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddCardScreen;
