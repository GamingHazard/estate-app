import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { AuthUser } from "../../features/auth/authTypes";

interface ProfileEditFormProps {
  user: AuthUser;
  onClose: () => void;
  onSave: (profileData: ProfileData) => Promise<void>;
}

export interface ProfileData {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  nin?: string;
  phoneNumber: string;
  email: string;
  bio?: string;
  publicContact?: { showPhone: boolean; showEmail: boolean };
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  user,
  onClose,
  onSave,
}) => {
  const { colors, theme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const canEditNin =
    user.role === "landlord" || user.role === "propertyManager";
  const canEditListerProfile = canEditNin;
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    dob: user.dob || "",
    gender: user.gender || "",
    ...(canEditNin ? { nin: user.nin || "" } : {}),
    phoneNumber: user.phoneNumber || "",
    email: user.email || "",
    ...(canEditListerProfile
      ? {
          bio: user.bio || "",
          publicContact: {
            showPhone: user.publicContact?.showPhone ?? false,
            showEmail: user.publicContact?.showEmail ?? false,
          },
        }
      : {}),
  });

  useEffect(() => {
    setProfileData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      dob: user.dob || "",
      gender: user.gender || "",
      ...(canEditNin ? { nin: user.nin || "" } : {}),
      phoneNumber: user.phoneNumber || "",
      email: user.email || "",
      ...(canEditListerProfile
        ? {
            bio: user.bio || "",
            publicContact: {
              showPhone: user.publicContact?.showPhone ?? false,
              showEmail: user.publicContact?.showEmail ?? false,
            },
          }
        : {}),
    });
  }, [user, canEditNin, canEditListerProfile]);

  const handleSave = async () => {
    setSaveError("");
    setIsSaving(true);
    try {
      await onSave(profileData);
      onClose();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Unable to save profile",
      );
    } finally {
      setIsSaving(false);
    }
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
          <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text },
            ]}
            value={profileData.firstName}
            onChangeText={(text) =>
              setProfileData({ ...profileData, firstName: text })
            }
            placeholder="Enter your first name"
            placeholderTextColor={colors.text + "80"}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text },
            ]}
            value={profileData.lastName}
            onChangeText={(text) =>
              setProfileData({ ...profileData, lastName: text })
            }
            placeholder="Enter your last name"
            placeholderTextColor={colors.text + "80"}
          />
        </View>

        {canEditListerProfile && (
          <>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Public bio
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.bioInput,
                  { backgroundColor: colors.card, color: colors.text },
                ]}
                value={profileData.bio || ""}
                onChangeText={(text) =>
                  setProfileData({ ...profileData, bio: text.slice(0, 280) })
                }
                placeholder="Introduce yourself to people viewing your listings"
                placeholderTextColor={colors.text + "80"}
                multiline
                maxLength={280}
                textAlignVertical="top"
              />
              <Text
                style={[styles.characterCount, { color: colors.textMuted }]}
              >
                {(profileData.bio || "").length}/280
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Public contact details
              </Text>
              <View style={styles.visibilityRow}>
                <Text style={[styles.visibilityLabel, { color: colors.text }]}>
                  Show phone number
                </Text>
                <Switch
                  value={profileData.publicContact?.showPhone ?? false}
                  onValueChange={(showPhone) =>
                    setProfileData({
                      ...profileData,
                      publicContact: {
                        showPhone,
                        showEmail:
                          profileData.publicContact?.showEmail ?? false,
                      },
                    })
                  }
                  trackColor={{ true: colors.primary }}
                />
              </View>
              <View style={styles.visibilityRow}>
                <Text style={[styles.visibilityLabel, { color: colors.text }]}>
                  Show email address
                </Text>
                <Switch
                  value={profileData.publicContact?.showEmail ?? false}
                  onValueChange={(showEmail) =>
                    setProfileData({
                      ...profileData,
                      publicContact: {
                        showPhone:
                          profileData.publicContact?.showPhone ?? false,
                        showEmail,
                      },
                    })
                  }
                  trackColor={{ true: colors.primary }}
                />
              </View>
            </View>
          </>
        )}

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Date of Birth
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text },
            ]}
            value={profileData.dob}
            onChangeText={(text) =>
              setProfileData({ ...profileData, dob: text })
            }
            placeholder="DD/MM/YYYY"
            placeholderTextColor={colors.text + "80"}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Gender</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderOption,
                profileData.gender.toLowerCase() === "male" &&
                  styles.selectedGender,
                {
                  borderColor: colors.border,
                  width: "31%",
                  paddingHorizontal: 8,
                },
              ]}
              onPress={() => setProfileData({ ...profileData, gender: "male" })}
            >
              <View style={styles.radioOuter}>
                {profileData.gender.toLowerCase() === "male" && (
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
                profileData.gender.toLowerCase() === "female" &&
                  styles.selectedGender,
                {
                  borderColor: colors.border,
                  width: "31%",
                  paddingHorizontal: 8,
                },
              ]}
              onPress={() =>
                setProfileData({ ...profileData, gender: "female" })
              }
            >
              <View style={styles.radioOuter}>
                {profileData.gender.toLowerCase() === "female" && (
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

            <TouchableOpacity
              style={[
                styles.genderOption,
                profileData.gender.toLowerCase() === "other" &&
                  styles.selectedGender,
                {
                  borderColor: colors.border,
                  width: "31%",
                  paddingHorizontal: 8,
                },
              ]}
              onPress={() =>
                setProfileData({ ...profileData, gender: "other" })
              }
            >
              <Text style={[styles.genderText, { color: colors.text }]}>
                Other
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {canEditNin && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              NIN Number
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text },
              ]}
              value={profileData.nin || ""}
              onChangeText={(text) =>
                setProfileData({ ...profileData, nin: text })
              }
              placeholder="Enter your NIN number"
              placeholderTextColor={colors.text + "80"}
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Contact</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text },
            ]}
            value={profileData.phoneNumber}
            onChangeText={(text) =>
              setProfileData({ ...profileData, phoneNumber: text })
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
            autoCapitalize="none"
          />
        </View>

        {saveError ? (
          <Text style={{ color: colors.error }}>{saveError}</Text>
        ) : null}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: colors.primary || "#007AFF" },
          ]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
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
    width: "31%",
  },
  selectedGender: {
    borderWidth: 2,
  },
  bioInput: {
    minHeight: 104,
    paddingTop: 12,
  },
  characterCount: {
    alignSelf: "flex-end",
    fontSize: 12,
    marginTop: 4,
  },
  visibilityRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  visibilityLabel: {
    fontSize: 14,
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
    marginBottom: 20,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProfileEditForm;
