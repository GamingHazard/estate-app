import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

interface ProfileEditFormProps {
  onClose: () => void;
  onSave: (profileData: ProfileData) => void;
}

interface ProfileData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  ninNumber: string;
  contact: string;
  email: string;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  onClose,
  onSave,
}) => {
  const { colors, theme } = useTheme();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    ninNumber: "",
    contact: "",
    email: "",
  });

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (event.type === "dismissed") {
      return;
    }
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString("en-GB"); // DD/MM/YYYY format
      setProfileData({ ...profileData, dateOfBirth: formattedDate });
    }
  };

  const handleSave = () => {
    onSave(profileData);
    onClose();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerText, { color: colors.text }]}>
          Edit Profile
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text },
            ]}
            value={profileData.fullName}
            onChangeText={(text) =>
              setProfileData({ ...profileData, fullName: text })
            }
            placeholder="Enter your full name"
            placeholderTextColor={colors.text + "80"}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Date of Birth
          </Text>
          <TouchableOpacity
            style={[
              styles.input,
              { backgroundColor: colors.card },
              styles.dateInput,
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={{
                color: profileData.dateOfBirth
                  ? colors.text
                  : colors.text + "80",
              }}
            >
              {profileData.dateOfBirth || "Select date of birth"}
            </Text>
            <Ionicons name="calendar" size={24} color={colors.text} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={
                profileData.dateOfBirth
                  ? new Date(
                      profileData.dateOfBirth.split("/").reverse().join("-")
                    )
                  : new Date()
              }
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Gender</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderOption,
                profileData.gender === "Male" && styles.selectedGender,
                { borderColor: colors.border },
              ]}
              onPress={() => setProfileData({ ...profileData, gender: "Male" })}
            >
              <View style={styles.radioOuter}>
                {profileData.gender === "Male" && (
                  <View
                    style={[
                      styles.radioInner,
                      {
                        backgroundColor: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                  />
                )}
              </View>
              <Text style={[styles.genderText, { color: colors.text }]}>
                Male
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderOption,
                profileData.gender === "Female" && styles.selectedGender,
                { borderColor: colors.border },
              ]}
              onPress={() =>
                setProfileData({ ...profileData, gender: "Female" })
              }
            >
              <View style={styles.radioOuter}>
                {profileData.gender === "Female" && (
                  <View
                    style={[
                      styles.radioInner,
                      {
                        backgroundColor: colors.text,
                      },
                    ]}
                  />
                )}
              </View>
              <Text style={[styles.genderText, { color: colors.text }]}>
                Female
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>NIN Number</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text },
            ]}
            value={profileData.ninNumber}
            onChangeText={(text) =>
              setProfileData({ ...profileData, ninNumber: text })
            }
            placeholder="Enter your NIN number"
            placeholderTextColor={colors.text + "80"}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Contact</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text },
            ]}
            value={profileData.contact}
            onChangeText={(text) =>
              setProfileData({ ...profileData, contact: text })
            }
            placeholder="Enter your contact number"
            placeholderTextColor={colors.text + "80"}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text },
            ]}
            value={profileData.email}
            onChangeText={(text) =>
              setProfileData({ ...profileData, email: text })
            }
            placeholder="Enter your email"
            placeholderTextColor={colors.text + "80"}
            keyboardType="email-address"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: colors.primary || "#007AFF" },
          ]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    width: "45%",
  },
  selectedGender: {
    borderWidth: 2,
  },
  radioOuter: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
  },
  genderText: {
    fontSize: 16,
    fontWeight: "500",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  saveButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: Platform.OS === "ios" ? 30 : 20,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProfileEditForm;
