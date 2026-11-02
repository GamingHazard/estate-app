import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import { uploadRequest } from "../queryClient";

export const useAvatarUpload = () => {
  const { user, openAuth, updateUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!user) {
      openAuth();
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", {
        uri: asset.uri,
        name: asset.fileName || "profile-image.jpg",
        type: asset.mimeType || "image/jpeg",
      } as any);

      const result = await uploadRequest(
        "PATCH",
        "/users/me/avatar",
        formData,
      );
      if (!result?.success || !result.user) {
        throw new Error(result?.message || "Unable to save profile image");
      }

      await updateUser(result.user);
      Alert.alert("Image updated", "Your profile image was saved.");
    } catch (error) {
      Alert.alert(
        "Upload failed",
        error instanceof Error ? error.message : "Unable to upload image.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const chooseSource = () => {
    Alert.alert("Change profile image", "Choose an option", [
      {
        text: "Take Photo",
        onPress: async () => {
          const permission =
            await ImagePicker.requestCameraPermissionsAsync();
          if (permission.status !== "granted") {
            Alert.alert(
              "Camera permission required",
              "Allow camera access to take a profile image.",
            );
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
          });
          if (!result.canceled) await uploadImage(result.assets[0]);
        },
      },
      {
        text: "Choose from Gallery",
        onPress: async () => {
          const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (permission.status !== "granted") {
            Alert.alert(
              "Photo library permission required",
              "Allow photo library access to choose a profile image.",
            );
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
          });
          if (!result.canceled) await uploadImage(result.assets[0]);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return { chooseSource, isUploading };
};
