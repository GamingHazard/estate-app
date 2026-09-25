import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../shared/theme/ThemeContext";
import {
  AdminProperty,
  adminPropertyStore,
} from "../../../data/adminPropertyStore";

export function PropertyDetails({ propertyId }: { propertyId?: string }) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const properties = adminPropertyStore.getSnapshot();
  const property = propertyId
    ? properties.find((item) => item.id === propertyId)
    : undefined;
  const [draft, setDraft] = useState<AdminProperty | null>(property ?? null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setDraft(property ?? null);
    setIsEditing(false);
  }, [propertyId, properties.length]);

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: colors.background },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      position: "relative",
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      marginTop: 14,
    },
    subtitle: { color: colors.textMuted, marginTop: 4 },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 12,
    },
    mainImage: { width: "100%", height: 220, borderRadius: 12 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    item: { minWidth: "45%", flex: 1, marginBottom: 8 },
    label: { color: colors.textMuted, fontSize: 12 },
    value: { color: colors.text, fontSize: 15, marginTop: 3 },
    badge: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      marginTop: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    badgeText: { color: "white", fontWeight: "700", fontSize: 12 },
    actionRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    action: {
      flex: 1,
      minWidth: 100,
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    actionText: { color: "white", fontWeight: "700" },
    images: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    thumb: { width: 88, height: 88, borderRadius: 10 },
    list: { color: colors.text, lineHeight: 22 },
    field: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 10,
      color: colors.text,
      marginBottom: 12,
    },
    fieldLabel: {
      color: colors.text,
      fontWeight: "600",
      marginBottom: 6,
      fontSize: 13,
    },
    imageButton: {
      width: 88,
      height: 88,
      borderRadius: 10,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    imageRemove: {
      position: "absolute",
      right: -4,
      top: -4,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.destructive,
      justifyContent: "center",
      alignItems: "center",
    },
    row: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      marginBottom: 12,
    },
    rowInput: { flex: 1 },
    textArea: { minHeight: 90, textAlignVertical: "top" },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },
  });

  if (!property || !draft)
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Property not found</Text>
          <Text style={styles.subtitle}>
            This property may have been removed or is no longer available.
          </Text>
        </View>
      </View>
    );

  const updateField = <K extends keyof AdminProperty>(
    key: K,
    value: AdminProperty[K],
  ) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const saveChanges = () => {
    adminPropertyStore.update(draft.id, {
      ...draft,
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
    Alert.alert("Property updated", "The property details have been saved.");
  };

  const deleteProperty = () => {
    Alert.alert(
      "Delete property",
      "This action cannot be undone. Delete this listing?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            adminPropertyStore.remove(draft.id);
            navigation.goBack?.();
          },
        },
      ],
    );
  };

  const addImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, 10 - draft.images.length),
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    const nextImages = [
      ...draft.images,
      ...result.assets.map((asset) => ({
        url: asset.uri,
        public_id: asset.fileName || `img-${Date.now()}`,
      })),
    ].slice(0, 10);

    updateField("images", nextImages);
  };

  const removeImage = (index: number) => {
    updateField(
      "images",
      draft.images.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  const display = (value: unknown) => {
    if (value === undefined || value === null || value === "")
      return "Not provided";
    if (Array.isArray(value))
      return value.filter(Boolean).join(", ") || "Not provided";
    return String(value);
  };

  const renderField = (
    label: string,
    value: string,
    onChange: (text: string) => void,
    multiline = false,
    keyboardType: "default" | "numeric" = "default",
  ) => (
    <View key={label}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.field, multiline && styles.textArea]}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        keyboardType={keyboardType}
        placeholder={label}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {draft.images[0] && (
          <Image
            source={{ uri: draft.images[0].url }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.summaryRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {isEditing ? "Edit property" : draft.name}
            </Text>
            <Text style={styles.subtitle}>
              {[draft.address, draft.city, draft.country]
                .filter(Boolean)
                .join(", ")}
            </Text>
          </View>
          {/* <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  draft.status === "active"
                    ? colors.primary
                    : draft.status === "pending"
                      ? colors.warning
                      : colors.destructive,
              },
            ]}
          >
            <Text style={styles.badgeText}>{draft.status}</Text>
          </View> */}
          <TouchableOpacity
            style={[
              styles.badge,
              {
                backgroundColor: "transparent",
                borderWidth: 0.5,
                borderColor: colors.border,
                // elevation: 2,
                borderRadius: 8,
              },
            ]}
          >
            <FontAwesome5
              name="edit"
              size={20}
              style={{ color: colors.text }}
            />
            <Text style={{ color: colors.text }}>Edit Property</Text>
          </TouchableOpacity>
        </View>
        <Ionicons
          name="trash-outline"
          style={{ position: "absolute", bottom: 10, right: 10 }}
          size={20}
          color={colors.destructive}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Basic details</Text>
        {isEditing ? (
          <>
            {renderField("Property name", draft.name, (value) =>
              updateField("name", value),
            )}
            {renderField("Address", draft.address, (value) =>
              updateField("address", value),
            )}
            {renderField("City", draft.city, (value) =>
              updateField("city", value),
            )}
            {renderField("Country", draft.country, (value) =>
              updateField("country", value),
            )}
            {renderField("Estate", draft.estate, (value) =>
              updateField("estate", value),
            )}
            {renderField("Geography", draft.geography, (value) =>
              updateField("geography", value),
            )}
            {renderField(
              "Price per unit",
              String(draft.price_per_unit),
              (value) => updateField("price_per_unit", value),
            )}
            {renderField("Property type", draft.propertyType, (value) =>
              updateField("propertyType", value),
            )}
            {renderField("Category", draft.category, (value) =>
              updateField("category", value),
            )}
            {renderField("Zoning", draft.zoning, (value) =>
              updateField("zoning", value),
            )}
          </>
        ) : (
          <View style={styles.grid}>
            {[
              ["Property name", draft.name],
              ["Address", draft.address],
              ["City", draft.city],
              ["Country", draft.country],
              ["Estate", draft.estate],
              ["Geography", draft.geography],
              ["Category", draft.category],
              ["Property type", draft.propertyType],
              ["Zoning", draft.zoning],
              ["Price per unit", draft.price_per_unit],
            ].map(([label, value]) => (
              <View style={styles.item} key={String(label)}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{display(value)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Description</Text>
        {isEditing ? (
          renderField(
            "Description",
            draft.description,
            (value) => updateField("description", value),
            true,
          )
        ) : (
          <Text style={styles.value}>{display(draft.description)}</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Features and specifications</Text>
        {isEditing ? (
          <>
            {draft.features.map((feature, index) => (
              <View style={styles.row} key={`feature-${index}`}>
                <TextInput
                  style={[styles.field, styles.rowInput]}
                  value={feature}
                  onChangeText={(value) => {
                    const nextFeatures = [...draft.features];
                    nextFeatures[index] = value;
                    updateField("features", nextFeatures);
                  }}
                  placeholder="Feature"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            ))}
            <Pressable
              onPress={() => updateField("features", [...draft.features, ""])}
            >
              <Text style={{ color: colors.primary }}>+ Add feature</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.list}>
              {draft.features.length
                ? draft.features.join(" • ")
                : "No features added"}
            </Text>
            {draft.specifications.length > 0 && (
              <View style={{ marginTop: 12 }}>
                {draft.specifications.map((item) => (
                  <Text
                    style={styles.value}
                    key={`${item.title}-${item.value}`}
                  >
                    {item.title}: {item.value}
                  </Text>
                ))}
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Financial details</Text>
        {isEditing ? (
          <>
            {renderField(
              "Annual property taxes",
              String(draft.annualPropertyTaxes),
              (value) => updateField("annualPropertyTaxes", Number(value || 0)),
              false,
              "numeric",
            )}
            {renderField(
              "Annual insurance",
              String(draft.annualInsurance),
              (value) => updateField("annualInsurance", Number(value || 0)),
              false,
              "numeric",
            )}
            {renderField(
              "Appraised value",
              String(draft.appraisedValue),
              (value) => updateField("appraisedValue", Number(value || 0)),
              false,
              "numeric",
            )}
            {renderField(
              "NOI",
              String(draft.noi),
              (value) => updateField("noi", Number(value || 0)),
              false,
              "numeric",
            )}
            {renderField(
              "Cap rate",
              String(draft.capRate),
              (value) => updateField("capRate", Number(value || 0)),
              false,
              "numeric",
            )}
            {renderField(
              "Last appraisal date",
              draft.lastAppraisalDate,
              (value) => updateField("lastAppraisalDate", value),
            )}
            {renderField(
              "Service fee",
              String(draft.serviceFee),
              (value) => updateField("serviceFee", Number(value || 0)),
              false,
              "numeric",
            )}
          </>
        ) : (
          <View style={styles.grid}>
            {[
              ["Annual property taxes", draft.annualPropertyTaxes],
              ["Annual insurance", draft.annualInsurance],
              ["Appraised value", draft.appraisedValue],
              ["NOI", draft.noi],
              ["Cap rate", `${draft.capRate}%`],
              ["Last appraisal date", draft.lastAppraisalDate?.slice(0, 10)],
              ["Service fee", draft.serviceFee],
            ].map(([label, value]) => (
              <View style={styles.item} key={String(label)}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{display(value)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Location and units</Text>
        {isEditing ? (
          <>
            {renderField(
              "Latitude",
              String(draft.location.lat),
              (value) =>
                updateField("location", {
                  ...draft.location,
                  lat: Number(value || 0),
                }),
              false,
              "numeric",
            )}
            {renderField(
              "Longitude",
              String(draft.location.lng),
              (value) =>
                updateField("location", {
                  ...draft.location,
                  lng: Number(value || 0),
                }),
              false,
              "numeric",
            )}
            {renderField(
              "Number of units",
              String(draft.units_available),
              (value) => updateField("units_available", Number(value || 0)),
              false,
              "numeric",
            )}
            {renderField(
              "Permitted uses",
              draft.permittedUses.join(", "),
              (value) =>
                updateField(
                  "permittedUses",
                  value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                ),
            )}
          </>
        ) : (
          <>
            <Text style={styles.value}>
              Latitude: {draft.location.lat} | Longitude: {draft.location.lng}
            </Text>
            <Text style={[styles.list, { marginTop: 8 }]}>
              Units:{" "}
              {display(
                draft.units.map((unit) =>
                  typeof unit === "string" ? unit : unit.unitNumber,
                ),
              )}
            </Text>
            <Text style={[styles.list, { marginTop: 8 }]}>
              Permitted uses: {display(draft.permittedUses)}
            </Text>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Policies</Text>
        {isEditing ? (
          <>
            {renderField(
              "Pet policy details",
              draft.policies.petPolicy.details,
              (value) =>
                updateField("policies", {
                  ...draft.policies,
                  petPolicy: { ...draft.policies.petPolicy, details: value },
                }),
            )}
            {renderField(
              "Parking policy details",
              draft.policies.parkingPolicy.details,
              (value) =>
                updateField("policies", {
                  ...draft.policies,
                  parkingPolicy: {
                    ...draft.policies.parkingPolicy,
                    details: value,
                  },
                }),
            )}
            {renderField("Lease policy", draft.policies.leasePolicy, (value) =>
              updateField("policies", {
                ...draft.policies,
                leasePolicy: value,
              }),
            )}
          </>
        ) : (
          <>
            <Text style={styles.value}>
              Pet policy:{" "}
              {draft.policies.petPolicy.allowed ? "Allowed" : "Not allowed"} —{" "}
              {display(draft.policies.petPolicy.details)}
            </Text>
            <Text style={styles.value}>
              Parking policy:{" "}
              {draft.policies.parkingPolicy.allowed ? "Allowed" : "Not allowed"}{" "}
              — {display(draft.policies.parkingPolicy.details)}
            </Text>
            <Text style={styles.value}>
              Lease policy: {display(draft.policies.leasePolicy)}
            </Text>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Images</Text>
        <View style={styles.images}>
          {draft.images.map((image, index) => (
            <View
              key={`${image.url}-${index}`}
              style={{ position: "relative" }}
            >
              <Image source={{ uri: image.url }} style={styles.thumb} />
              {isEditing && (
                <Pressable
                  style={styles.imageRemove}
                  onPress={() => removeImage(index)}
                >
                  <MaterialIcons name="close" size={14} color="white" />
                </Pressable>
              )}
            </View>
          ))}
          {isEditing && (
            <Pressable style={styles.imageButton} onPress={addImages}>
              <MaterialIcons
                name="add-photo-alternate"
                size={24}
                color={colors.textMuted}
              />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Admin actions</Text>
        <View style={styles.actionRow}>
          {!isEditing ? (
            <>
              <Pressable
                style={[styles.action, { backgroundColor: colors.primary }]}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.actionText}>Edit</Text>
              </Pressable>
              <Pressable
                style={[styles.action, { backgroundColor: colors.destructive }]}
                onPress={deleteProperty}
              >
                <Text style={styles.actionText}>Delete</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                style={[styles.action, { backgroundColor: colors.primary }]}
                onPress={saveChanges}
              >
                <Text style={styles.actionText}>Save</Text>
              </Pressable>
              <Pressable
                style={[styles.action, { backgroundColor: colors.muted }]}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.actionText}>Cancel</Text>
              </Pressable>
            </>
          )}
          <Pressable
            style={[styles.action, { backgroundColor: colors.warning }]}
            onPress={() => adminPropertyStore.updateStatus(draft.id, "pending")}
          >
            <Text style={styles.actionText}>Set Pending</Text>
          </Pressable>
        </View>
      </View>
      <View style={{ width: "100%", height: 70 }} />
    </ScrollView>
  );
}
