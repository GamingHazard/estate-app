import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { useAuth } from "../../auth/AuthContext";
import {
  BillingPeriod,
  MarketplacePropertyDraft,
  PropertyImage,
  PropertyPolicies,
  PropertySpecification,
  PropertyUnit,
} from "../../../data/property";
import { adminPropertyStore } from "../../../data/adminPropertyStore";
import { apiRequest } from "../../../shared/queryClient";
import {
  getSpecificationsForType,
  normalizeCategory,
  normalizePropertyType,
  PROPERTY_CATEGORIES,
} from "../../../data/propertyTypes";

type Props = { onClose?: () => void };
type Step =
  | "listing"
  | "property"
  | "location"
  | "details"
  | "units"
  | "review";

const STEPS: Step[] = [
  "listing",
  "property",
  "location",
  "details",
  "units",
  "review",
];
const STEP_LABELS = [
  "Listing",
  "Property",
  "Location",
  "Details",
  "Units",
  "Review",
];
const EMPTY_POLICIES: PropertyPolicies = {
  pets: { allowed: false, details: "" },
  parking: { allowed: false, details: "" },
  lease: "",
  other: [],
};

export const MarketplacePropertyCreation = ({ onClose }: Props) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    purpose: "rent" as "rent" | "sale",
    price: "",
    currency: "USD",
    billingPeriod: "monthly" as BillingPeriod,
    serviceFee: "",
    negotiable: false,
    availableFrom: "",
    category: "residential",
    propertyType: "apartment",
    description: "",
    address: "",
    estate: "",
    city: "",
    country: "",
    lat: "",
    lng: "",
    images: [] as PropertyImage[],
    features: [""],
    specificationValues: {} as Record<string, string>,
    customSpecifications: [] as PropertySpecification[],
    policies: EMPTY_POLICIES,
    units: [] as PropertyUnit[],
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, padding: 16, backgroundColor: colors.background },
        header: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        },
        title: { color: colors.text, fontSize: 22, fontWeight: "800" },
        progress: { flexDirection: "row", gap: 5, marginBottom: 20 },
        progressItem: {
          flex: 1,
          height: 5,
          borderRadius: 3,
          backgroundColor: colors.border,
        },
        activeProgress: { backgroundColor: colors.primary },
        stepLabel: { color: colors.textMuted, fontSize: 13, marginBottom: 18 },
        sectionTitle: {
          color: colors.text,
          fontSize: 18,
          fontWeight: "800",
          marginBottom: 14,
        },
        label: {
          color: colors.text,
          fontSize: 13,
          fontWeight: "700",
          marginBottom: 6,
        },
        input: {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 8,
          color: colors.text,
          padding: 12,
          marginBottom: 14,
        },
        textArea: { minHeight: 100, textAlignVertical: "top" },
        picker: {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 14,
        },
        row: { flexDirection: "row", gap: 8, alignItems: "center" },
        rowInput: { flex: 1 },
        card: {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 10,
          padding: 14,
          marginBottom: 14,
        },
        imageGrid: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 10,
        },
        imageWrap: { position: "relative" },
        image: { width: 84, height: 84, borderRadius: 8 },
        imageButton: {
          width: 84,
          height: 84,
          borderRadius: 8,
          borderWidth: 1,
          borderStyle: "dashed",
          borderColor: colors.border,
          alignItems: "center",
          justifyContent: "center",
        },
        removeButton: {
          position: "absolute",
          right: -5,
          top: -5,
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: colors.destructive,
          alignItems: "center",
          justifyContent: "center",
        },
        chipRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
        chip: {
          flex: 1,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          paddingVertical: 12,
          alignItems: "center",
        },
        selectedChip: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        chipText: { fontWeight: "700" },
        footer: {
          flexDirection: "row",
          gap: 10,
          marginTop: 12,
          paddingBottom: 24,
        },
        footerButton: {
          flex: 1,
          borderRadius: 8,
          padding: 14,
          alignItems: "center",
          borderWidth: 1,
          borderColor: colors.border,
        },
        primaryButton: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        buttonText: { color: colors.text, fontWeight: "800" },
        primaryText: { color: "white" },
        error: { color: colors.destructive, marginBottom: 12 },
        review: {
          backgroundColor: colors.card,
          borderRadius: 8,
          padding: 14,
          marginBottom: 10,
        },
        reviewLabel: { color: colors.textMuted, fontSize: 12 },
        reviewValue: { color: colors.text, fontSize: 15, marginTop: 4 },
      }),
    [colors],
  );

  const category = normalizeCategory(form.category);
  const propertyType = normalizePropertyType(form.propertyType, category);
  const typeSpecifications = getSpecificationsForType(propertyType);
  const currentStep = STEPS[stepIndex];
  const update = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => setForm((current) => ({ ...current, [key]: value }));
  const field = (
    label: string,
    key: keyof typeof form,
    keyboardType: "default" | "numeric" = "default",
  ) => (
    <View key={String(key)}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={String(form[key])}
        onChangeText={(value) => update(key, value as never)}
        keyboardType={keyboardType}
        placeholder={label}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );

  const addImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, 10 - form.images.length),
      quality: 1,
    });
    if (result.canceled) return;
    update("images", [
      ...form.images,
      ...result.assets
        .slice(0, 10 - form.images.length)
        .map((asset, index) => ({
          title:
            asset.fileName ||
            `Property photo ${form.images.length + index + 1}`,
          url: asset.uri,
          publicId: asset.fileName || undefined,
        })),
    ]);
  };

  const addUnit = () => {
    const unit: PropertyUnit = {
      id: `draft-unit-${Date.now()}`,
      propertyId: "",
      unitNumber: `Unit ${form.units.length + 1}`,
      rent: Number(form.price) || 0,
      unitType: propertyType,
      description: "",
      price: Number(form.price) || 0,
      currency: form.currency,
      billingPeriod: form.billingPeriod,
      isAvailable: true,
      specifications: [],
      images: [],
    };
    update("units", [...form.units, unit]);
  };

  const updateUnit = <K extends keyof PropertyUnit>(
    index: number,
    key: K,
    value: PropertyUnit[K],
  ) => {
    const units = [...form.units];
    units[index] = { ...units[index], [key]: value };
    update("units", units);
  };

  const addUnitImages = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 5 - form.units[index].images.length,
      quality: 1,
    });
    if (result.canceled) return;
    const images = result.assets.map((asset, imageIndex) => ({
      title: asset.fileName || `Unit photo ${imageIndex + 1}`,
      url: asset.uri,
      publicId: asset.fileName || undefined,
    }));
    updateUnit(
      index,
      "images",
      [...form.units[index].images, ...images].slice(0, 5),
    );
  };

  const validate = () => {
    if (
      currentStep === "listing" &&
      (!form.price.trim() || Number.isNaN(Number(form.price)))
    )
      return "Enter a valid listing price.";
    if (
      currentStep === "property" &&
      (!form.name.trim() || !form.description.trim())
    )
      return "Add a property name and description.";
    if (
      currentStep === "location" &&
      (!form.address.trim() || !form.city.trim() || !form.country.trim())
    )
      return "Complete the address, city, and country.";
    if (
      currentStep === "details" &&
      form.features.some((feature) => !feature.trim())
    )
      return "Complete each feature or remove empty rows.";
    if (
      currentStep === "units" &&
      form.units.some(
        (unit) => !unit.unitNumber.trim() || !unit.unitType.trim(),
      )
    )
      return "Complete each unit number and type.";
    return "";
  };

  const submit = async () => {
    setIsSubmitting(true);
    setError("");
    const formData = new FormData();
    const imageFiles: Array<{
      uri: string;
      fileName?: string | null;
      mimeType?: string | null;
    }> = [];
    const propertyImages = form.images.map((image, index) => {
      imageFiles.push({ uri: image.url, fileName: image.title });
      return { title: image.title, uploadIndex: imageFiles.length - 1 };
    });
    const units = form.units.map((unit) => ({
      ...unit,
      images: unit.images.map((image) => {
        imageFiles.push({ uri: image.url, fileName: image.title });
        return { title: image.title, uploadIndex: imageFiles.length - 1 };
      }),
    }));
    imageFiles.forEach((asset, index) => {
      const extension = asset.uri.match(/\.([a-z0-9]+)(?:\?|$)/i)?.[1]?.toLowerCase();
      const imageType =
        extension === "png"
          ? "image/png"
          : extension === "webp"
            ? "image/webp"
            : "image/jpeg";
      const fileExtension = imageType.split("/")[1];
      formData.append("images", {
        uri: asset.uri,
        name: asset.fileName?.includes(".")
          ? asset.fileName
          : `property-image-${index}.${fileExtension}`,
        type: imageType,
      } as any);
    });
    formData.append(
      "payload",
      JSON.stringify({
        name: form.name.trim(),
        purpose: form.purpose,
        category,
        propertyType,
        description: form.description.trim(),
        address: form.address.trim(),
        estate: form.estate.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
        location: { lat: Number(form.lat) || 0, lng: Number(form.lng) || 0 },
        images: propertyImages,
        features: form.features.map((feature) => feature.trim()).filter(Boolean),
        specifications: [
          ...typeSpecifications
            .map((specification) => ({
              title: specification.label,
              value: form.specificationValues[specification.key]?.trim() || "",
            }))
            .filter((specification) => specification.value),
          ...form.customSpecifications.filter(
            (specification) =>
              specification.title.trim() && specification.value.trim(),
          ),
        ],
        policies: form.policies,
        units,
        listing: {
      purpose: form.purpose,
      price: Number(form.price),
      currency: form.currency,
      billingPeriod:
        form.purpose === "sale" ? ("one-time" as const) : form.billingPeriod,
      serviceFee: form.serviceFee ? Number(form.serviceFee) : undefined,
      negotiable: form.negotiable,
      availableFrom: form.availableFrom || undefined,
        },
      }),
    );

    try {
      await apiRequest("POST", "/properties/marketplace", formData);
      await queryClient.invalidateQueries({ queryKey: ["properties"] });
      await queryClient.invalidateQueries({
        queryKey: ["properties", "marketplace", "manage"],
      });
      Alert.alert("Submitted for review", "Your property is pending approval.", [
        { text: "Done", onPress: onClose ?? (() => navigation.goBack()) },
      ]);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit this property.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    if (currentStep === "listing")
      return (
        <>
          <Text style={styles.sectionTitle}>
            How is this property being offered?
          </Text>
          <View style={styles.chipRow}>
            {(["rent", "sale"] as const).map((purpose) => (
              <Pressable
                key={purpose}
                onPress={() => update("purpose", purpose)}
                style={[
                  styles.chip,
                  form.purpose === purpose && styles.selectedChip,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: form.purpose === purpose ? "white" : colors.text },
                  ]}
                >
                  {purpose === "rent" ? "For rent" : "For sale"}
                </Text>
              </Pressable>
            ))}
          </View>
          {field("Price", "price", "numeric")}
          {field("Currency", "currency")}
          {form.purpose === "rent" && (
            <>
              <Text style={styles.label}>Billing period</Text>
              <View style={styles.picker}>
                <Picker
                  selectedValue={form.billingPeriod}
                  onValueChange={(value) => update("billingPeriod", value)}
                >
                  <Picker.Item label="Monthly" value="monthly" />
                  <Picker.Item label="Yearly" value="yearly" />
                  <Picker.Item label="Weekly" value="weekly" />
                </Picker>
              </View>
            </>
          )}
          {field("Service fee (optional)", "serviceFee", "numeric")}
          {field("Available from (optional)", "availableFrom")}
          <Pressable
            style={styles.row}
            onPress={() => update("negotiable", !form.negotiable)}
          >
            <MaterialIcons
              name={form.negotiable ? "check-box" : "check-box-outline-blank"}
              size={22}
              color={colors.primary}
            />
            <Text style={{ color: colors.text }}>Price is negotiable</Text>
          </Pressable>
        </>
      );
    if (currentStep === "property")
      return (
        <>
          <Text style={styles.sectionTitle}>Property identity</Text>
          {field("Property name", "name")}
          <Text style={styles.label}>Category</Text>
          <View style={styles.picker}>
            <Picker
              selectedValue={category}
              onValueChange={(value) => {
                const next = normalizeCategory(value);
                update("category", next);
                update(
                  "propertyType",
                  Object.keys(PROPERTY_CATEGORIES[next].types)[0],
                );
              }}
            >
              {Object.entries(PROPERTY_CATEGORIES).map(([value, item]) => (
                <Picker.Item key={value} label={item.label} value={value} />
              ))}
            </Picker>
          </View>
          <Text style={styles.label}>Property type</Text>
          <View style={styles.picker}>
            <Picker
              selectedValue={propertyType}
              onValueChange={(value) => update("propertyType", value)}
            >
              {Object.entries(PROPERTY_CATEGORIES[category].types).map(
                ([value, label]) => (
                  <Picker.Item key={value} label={label} value={value} />
                ),
              )}
            </Picker>
          </View>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={(value) => update("description", value)}
            multiline
            placeholder="Describe the property"
            placeholderTextColor={colors.textMuted}
          />
        </>
      );
    if (currentStep === "location")
      return (
        <>
          <Text style={styles.sectionTitle}>Location</Text>
          {field("Address", "address")}
          {field("Estate or neighborhood", "estate")}
          {field("City", "city")}
          {field("Country", "country")}
          {field("Latitude (optional)", "lat", "numeric")}
          {field("Longitude (optional)", "lng", "numeric")}
        </>
      );
    if (currentStep === "details")
      return (
        <>
          <Text style={styles.sectionTitle}>Details and media</Text>
          <Text style={styles.label}>Property images</Text>
          <View style={styles.imageGrid}>
            {form.images.map((image, index) => (
              <View key={`${image.url}-${index}`} style={styles.imageWrap}>
                <Image source={{ uri: image.url }} style={styles.image} />
                <Pressable
                  style={styles.removeButton}
                  onPress={() =>
                    update(
                      "images",
                      form.images.filter(
                        (_, imageIndex) => imageIndex !== index,
                      ),
                    )
                  }
                >
                  <MaterialIcons name="close" size={14} color="white" />
                </Pressable>
              </View>
            ))}
            {form.images.length < 10 && (
              <Pressable style={styles.imageButton} onPress={addImages}>
                <MaterialIcons
                  name="add-photo-alternate"
                  size={24}
                  color={colors.textMuted}
                />
              </Pressable>
            )}
          </View>
          {typeSpecifications.map((specification) => (
            <View key={specification.key}>
              <Text style={styles.label}>{specification.label}</Text>
              <TextInput
                style={[
                  styles.input,
                  specification.type === "textarea" && styles.textArea,
                ]}
                value={form.specificationValues[specification.key] || ""}
                onChangeText={(value) =>
                  update("specificationValues", {
                    ...form.specificationValues,
                    [specification.key]: value,
                  })
                }
                placeholder={specification.placeholder}
                placeholderTextColor={colors.textMuted}
                multiline={specification.type === "textarea"}
                keyboardType={
                  specification.type === "number" ? "numeric" : "default"
                }
              />
            </View>
          ))}
          <Text style={styles.label}>Features</Text>
          {form.features.map((feature, index) => (
            <View style={styles.row} key={`feature-${index}`}>
              <TextInput
                style={[styles.input, styles.rowInput]}
                value={feature}
                onChangeText={(value) =>
                  update(
                    "features",
                    form.features.map((item, itemIndex) =>
                      itemIndex === index ? value : item,
                    ),
                  )
                }
                placeholder="Feature"
                placeholderTextColor={colors.textMuted}
              />
              <Pressable
                onPress={() =>
                  update(
                    "features",
                    form.features.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                <MaterialIcons
                  name="remove"
                  size={20}
                  color={colors.destructive}
                />
              </Pressable>
            </View>
          ))}
          <Pressable onPress={() => update("features", [...form.features, ""])}>
            <Text style={{ color: colors.primary }}>+ Add feature</Text>
          </Pressable>
          <Text style={[styles.label, { marginTop: 16 }]}>
            Lease policy (optional)
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.policies.lease}
            onChangeText={(value) =>
              update("policies", { ...form.policies, lease: value })
            }
            multiline
            placeholder="Lease terms"
            placeholderTextColor={colors.textMuted}
          />
          <Pressable
            style={styles.row}
            onPress={() =>
              update("policies", {
                ...form.policies,
                pets: {
                  ...form.policies.pets,
                  allowed: !form.policies.pets?.allowed,
                },
              })
            }
          >
            <MaterialIcons
              name={
                form.policies.pets?.allowed
                  ? "check-box"
                  : "check-box-outline-blank"
              }
              size={22}
              color={colors.primary}
            />
            <Text style={{ color: colors.text }}>Pets allowed</Text>
          </Pressable>
          <Pressable
            style={styles.row}
            onPress={() =>
              update("policies", {
                ...form.policies,
                parking: {
                  ...form.policies.parking,
                  allowed: !form.policies.parking?.allowed,
                },
              })
            }
          >
            <MaterialIcons
              name={
                form.policies.parking?.allowed
                  ? "check-box"
                  : "check-box-outline-blank"
              }
              size={22}
              color={colors.primary}
            />
            <Text style={{ color: colors.text }}>Parking available</Text>
          </Pressable>
        </>
      );
    if (currentStep === "units")
      return (
        <>
          <Text style={styles.sectionTitle}>Units</Text>
          <Text style={styles.stepLabel}>
            Add units only when the property contains separately offered spaces.
          </Text>
          {form.units.map((unit, index) => (
            <View style={styles.card} key={unit.id}>
              <Text style={styles.label}>Unit {index + 1}</Text>
              {(["unitNumber", "unitType"] as const).map((key) => (
                <TextInput
                  key={key}
                  style={styles.input}
                  value={String(unit[key])}
                  onChangeText={(value) => updateUnit(index, key, value)}
                  placeholder={
                    key === "unitNumber" ? "Unit number" : "Unit type"
                  }
                  placeholderTextColor={colors.textMuted}
                />
              ))}
              <TextInput
                style={[styles.input, styles.textArea]}
                value={unit.description}
                onChangeText={(value) =>
                  updateUnit(index, "description", value)
                }
                placeholder="Unit description and suitable uses"
                placeholderTextColor={colors.textMuted}
                multiline
              />
              <TextInput
                style={styles.input}
                value={String(unit.price ?? "")}
                onChangeText={(value) =>
                  updateUnit(index, "price", Number(value) || 0)
                }
                placeholder="Unit price override"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
              <View style={styles.imageGrid}>
                {unit.images.map((image, imageIndex) => (
                  <View
                    key={`${image.url}-${imageIndex}`}
                    style={styles.imageWrap}
                  >
                    <Image source={{ uri: image.url }} style={styles.image} />
                    <Pressable
                      style={styles.removeButton}
                      onPress={() =>
                        updateUnit(
                          index,
                          "images",
                          unit.images.filter(
                            (_, currentIndex) => currentIndex !== imageIndex,
                          ),
                        )
                      }
                    >
                      <MaterialIcons name="close" size={14} color="white" />
                    </Pressable>
                  </View>
                ))}
                {unit.images.length < 5 && (
                  <Pressable
                    style={styles.imageButton}
                    onPress={() => addUnitImages(index)}
                  >
                    <MaterialIcons
                      name="add-photo-alternate"
                      size={24}
                      color={colors.textMuted}
                    />
                  </Pressable>
                )}
              </View>
              <Pressable
                style={styles.row}
                onPress={() =>
                  updateUnit(index, "isAvailable", !unit.isAvailable)
                }
              >
                <MaterialIcons
                  name={
                    unit.isAvailable ? "check-box" : "check-box-outline-blank"
                  }
                  size={22}
                  color={colors.primary}
                />
                <Text style={{ color: colors.text }}>Available</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  update(
                    "units",
                    form.units.filter(
                      (_, currentIndex) => currentIndex !== index,
                    ),
                  )
                }
              >
                <Text style={{ color: colors.destructive }}>Remove unit</Text>
              </Pressable>
            </View>
          ))}
          <Pressable onPress={addUnit}>
            <Text style={{ color: colors.primary }}>+ Add unit</Text>
          </Pressable>
        </>
      );
    return (
      <>
        <Text style={styles.sectionTitle}>Review listing</Text>
        {[
          ["Purpose", form.purpose === "rent" ? "For rent" : "For sale"],
          ["Price", `${form.currency} ${form.price}`],
          ["Property", form.name],
          ["Type", `${category} / ${propertyType}`],
          [
            "Location",
            [form.address, form.city, form.country].filter(Boolean).join(", "),
          ],
          ["Images", String(form.images.length)],
          ["Units", String(form.units.length)],
          ["Features", String(form.features.filter(Boolean).length)],
        ].map(([label, value]) => (
          <View style={styles.review} key={label}>
            <Text style={styles.reviewLabel}>{label}</Text>
            <Text style={styles.reviewValue}>{value || "Not provided"}</Text>
          </View>
        ))}
      </>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Add property listing</Text>
        <Pressable onPress={onClose ?? (() => navigation.goBack())}>
          <Ionicons name="close" size={25} color={colors.text} />
        </Pressable>
      </View>
      <View style={styles.progress}>
        {STEPS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressItem,
              index <= stepIndex && styles.activeProgress,
            ]}
          />
        ))}
      </View>
      <Text style={styles.stepLabel}>
        {STEP_LABELS[stepIndex]} · Step {stepIndex + 1} of {STEPS.length}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {renderStep()}
      <View style={styles.footer}>
        {stepIndex > 0 && (
          <Pressable
            style={styles.footerButton}
            onPress={() => {
              setError("");
              setStepIndex((value) => value - 1);
            }}
          >
            <Text style={styles.buttonText}>Back</Text>
          </Pressable>
        )}
        {stepIndex < STEPS.length - 1 ? (
          <Pressable
            style={[styles.footerButton, styles.primaryButton]}
            onPress={() => {
              const validationError = validate();
              if (validationError) {
                setError(validationError);
                return;
              }
              setError("");
              setStepIndex((value) => value + 1);
            }}
          >
            <Text style={[styles.buttonText, styles.primaryText]}>
              Continue
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.footerButton, styles.primaryButton]}
            onPress={submit}
            disabled={isSubmitting}
          >
            <Text style={[styles.buttonText, styles.primaryText]}>
              {isSubmitting ? "Submitting..." : "Submit for review"}
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
};

export default MarketplacePropertyCreation;
