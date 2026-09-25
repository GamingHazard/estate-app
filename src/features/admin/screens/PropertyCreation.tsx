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
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../shared/theme/ThemeContext";
import {
  adminPropertyStore,
  PropertyDraft,
  PropertyImage,
  PropertyPolicies,
  PropertyUnit,
  PropertySpecification,
  UnitImage,
} from "../../../data/adminPropertyStore";
import {
  getCategoryForType,
  getSpecificationsForType,
  normalizeCategory,
  normalizePropertyType,
  PROPERTY_CATEGORIES,
} from "../../../data/propertyTypes";

type FormState = {
  name: string;
  address: string;
  city: string;
  country: string;
  category: string;
  estate: string;
  price_per_unit: string;
  propertyType: string;
  geography: string;
  description: string;
  images: PropertyImage[];
  features: string[];
  specificationValues: Record<string, string>;
  customSpecifications: PropertySpecification[];
  lat: string;
  lng: string;
  zoning: string;
  annualPropertyTaxes: string;
  annualInsurance: string;
  appraisedValue: string;
  noi: string;
  capRate: string;
  lastAppraisalDate: string;
  permittedUses: string[];
  serviceFee: string;
  policies: PropertyPolicies;
  units_available: string;
  customizeUnits: boolean;
  autoGenerateUnitNumbers: boolean;
  customUnitNumbers: string;
  detailedUnits: PropertyUnit[];
  units: string[];
};

const initialForm: FormState = {
  name: "",
  address: "",
  city: "",
  country: "",
  category: "Residential",
  estate: "",
  price_per_unit: "",
  propertyType: "Apartment",
  geography: "",
  description: "",
  images: [],
  features: [""],
  specificationValues: {},
  customSpecifications: [{ title: "", value: "" }],
  lat: "",
  lng: "",
  zoning: "",
  annualPropertyTaxes: "0",
  annualInsurance: "0",
  appraisedValue: "",
  noi: "0",
  capRate: "0",
  lastAppraisalDate: new Date().toISOString().slice(0, 10),
  permittedUses: [""],
  serviceFee: "0",
  policies: {
    petPolicy: { allowed: false, details: "" },
    parkingPolicy: { allowed: false, details: "" },
    leasePolicy: "",
    otherPolicies: [],
  },
  units_available: "1",
  customizeUnits: false,
  autoGenerateUnitNumbers: true,
  customUnitNumbers: "",
  detailedUnits: [],
  units: [""],
};

const steps = ["Identity", "Attributes", "Finance", "Location", "Review"];

type PropertyCreationProps = {
  onClose?: () => void;
};

export function PropertyCreation({ onClose }: PropertyCreationProps) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState("");

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          padding: 16,
          backgroundColor: colors.background,
          paddingBottom: 20,
        },
        header: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        },
        title: { fontSize: 22, fontWeight: "700", color: colors.text },
        closeButton: { padding: 6 },
        progress: { flexDirection: "row", gap: 5, marginBottom: 20 },
        progressItem: {
          flex: 1,
          height: 5,
          borderRadius: 3,
          backgroundColor: colors.border,
        },
        activeProgress: { backgroundColor: colors.primary },
        stepLabel: { color: colors.textMuted, fontSize: 13, marginBottom: 16 },
        sectionTitle: {
          fontSize: 18,
          fontWeight: "700",
          color: colors.text,
          marginBottom: 14,
        },
        label: {
          color: colors.text,
          fontSize: 13,
          fontWeight: "600",
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
        iconButton: {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        },
        imageGrid: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 14,
        },
        imageWrap: { position: "relative" },
        image: { width: 84, height: 84, borderRadius: 8 },
        imageRemove: {
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
        imageButton: {
          height: 84,
          width: 84,
          borderRadius: 8,
          borderWidth: 1,
          borderStyle: "dashed",
          borderColor: colors.border,
          alignItems: "center",
          justifyContent: "center",
        },
        error: { color: colors.destructive, marginBottom: 12 },
        review: {
          backgroundColor: colors.card,
          borderRadius: 8,
          padding: 14,
          marginBottom: 10,
        },
        reviewLabel: { color: colors.textMuted, fontSize: 12 },
        reviewValue: { color: colors.text, fontSize: 15, marginTop: 3 },
        footer: {
          flexDirection: "row",
          gap: 10,
          marginTop: 18,
          paddingBottom: 20,
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
        buttonText: { color: colors.text, fontWeight: "700" },
        primaryText: { color: "white" },
      }),
    [colors],
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const numberValue = (value: string) =>
    value.trim() === "" ? 0 : Number(value);

  const propertyCategory = normalizeCategory(form.category);
  const propertyType = normalizePropertyType(
    form.propertyType,
    propertyCategory,
  );
  const typeSpecifications = getSpecificationsForType(propertyType);

  const updateSpecificationValue = (key: string, value: string) => {
    setForm((current) => ({
      ...current,
      specificationValues: {
        ...current.specificationValues,
        [key]: value,
      },
    }));
  };

  const updateCustomSpecification = (
    index: number,
    field: keyof PropertySpecification,
    value: string,
  ) => {
    setForm((current) => {
      const customSpecifications = [...current.customSpecifications];
      customSpecifications[index] = {
        ...customSpecifications[index],
        [field]: value,
      };
      return { ...current, customSpecifications };
    });
  };

  const addCustomSpecification = () =>
    setForm((current) => ({
      ...current,
      customSpecifications: [
        ...current.customSpecifications,
        { title: "", value: "" },
      ],
    }));

  const removeCustomSpecification = (index: number) =>
    setForm((current) => ({
      ...current,
      customSpecifications: current.customSpecifications.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));

  const updatePolicy = <K extends keyof PropertyPolicies>(
    key: K,
    value: PropertyPolicies[K],
  ) =>
    setForm((current) => ({
      ...current,
      policies: { ...current.policies, [key]: value },
    }));

  const addOtherPolicy = () =>
    updatePolicy("otherPolicies", [
      ...form.policies.otherPolicies,
      { title: "", body: "" },
    ]);

  const updateOtherPolicy = (
    index: number,
    field: "title" | "body",
    value: string,
  ) => {
    updatePolicy(
      "otherPolicies",
      form.policies.otherPolicies.map((policy, policyIndex) =>
        policyIndex === index ? { ...policy, [field]: value } : policy,
      ),
    );
  };

  const removeOtherPolicy = (index: number) =>
    updatePolicy(
      "otherPolicies",
      form.policies.otherPolicies.filter(
        (_, policyIndex) => policyIndex !== index,
      ),
    );

  const updateDetailedUnit = (
    index: number,
    field: keyof PropertyUnit,
    value: string | number,
  ) => {
    setForm((current) => {
      const detailedUnits = [...current.detailedUnits];
      detailedUnits[index] = { ...detailedUnits[index], [field]: value };
      return { ...current, detailedUnits };
    });
  };

  const addDetailedUnit = () =>
    setForm((current) => ({
      ...current,
      detailedUnits: [
        ...current.detailedUnits,
        {
          unitNumber: "",
          rent: numberValue(current.price_per_unit),
          unitType: "",
          specifications: [],
          images: [],
        },
      ],
    }));

  const removeDetailedUnit = (index: number) =>
    setForm((current) => ({
      ...current,
      detailedUnits: current.detailedUnits.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));

  const addUnitImages = async (unitIndex: number) => {
    const unit = form.detailedUnits[unitIndex];
    const remainingSlots = 5 - unit.images.length;
    if (remainingSlots <= 0) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    const selectedImages: UnitImage[] = result.assets
      .slice(0, remainingSlots)
      .map((asset, imageIndex) => ({
        name: asset.fileName || `unit-${unitIndex + 1}-image-${imageIndex + 1}`,
        url: asset.uri,
        public_id: "",
      }));

    setForm((current) => {
      const detailedUnits = [...current.detailedUnits];
      const currentUnit = detailedUnits[unitIndex];
      detailedUnits[unitIndex] = {
        ...currentUnit,
        images: [...currentUnit.images, ...selectedImages].slice(0, 5),
      };
      return { ...current, detailedUnits };
    });
  };

  const removeUnitImage = (unitIndex: number, imageIndex: number) => {
    setForm((current) => {
      const detailedUnits = [...current.detailedUnits];
      const currentUnit = detailedUnits[unitIndex];
      detailedUnits[unitIndex] = {
        ...currentUnit,
        images: currentUnit.images.filter(
          (_, currentImageIndex) => currentImageIndex !== imageIndex,
        ),
      };
      return { ...current, detailedUnits };
    });
  };

  const updateUnitSpecification = (
    unitIndex: number,
    specificationIndex: number,
    field: "label" | "value",
    value: string,
  ) => {
    setForm((current) => {
      const detailedUnits = [...current.detailedUnits];
      const unit = detailedUnits[unitIndex];
      const specifications = [...unit.specifications];
      specifications[specificationIndex] = {
        ...specifications[specificationIndex],
        [field]: value,
      };
      detailedUnits[unitIndex] = { ...unit, specifications };
      return { ...current, detailedUnits };
    });
  };

  const addUnitSpecification = (unitIndex: number) => {
    setForm((current) => {
      const detailedUnits = [...current.detailedUnits];
      const unit = detailedUnits[unitIndex];
      detailedUnits[unitIndex] = {
        ...unit,
        specifications: [...unit.specifications, { label: "", value: "" }],
      };
      return { ...current, detailedUnits };
    });
  };

  const removeUnitSpecification = (
    unitIndex: number,
    specificationIndex: number,
  ) => {
    setForm((current) => {
      const detailedUnits = [...current.detailedUnits];
      const unit = detailedUnits[unitIndex];
      detailedUnits[unitIndex] = {
        ...unit,
        specifications: unit.specifications.filter(
          (_, itemIndex) => itemIndex !== specificationIndex,
        ),
      };
      return { ...current, detailedUnits };
    });
  };

  const generateUnitNumbers = () => {
    const prefix =
      `${form.name.trim().charAt(0) || "P"}${form.city.trim().charAt(0) || "C"}${form.country.trim().charAt(0) || "X"}`.toUpperCase();
    const count = Math.max(0, numberValue(form.units_available));
    return Array.from(
      { length: count },
      (_, index) => `${prefix}-${index + 1}`,
    );
  };

  const validateStep = () => {
    if (step === 0) {
      const required = [
        form.name,
        form.address,
        form.city,
        form.country,
        form.estate,
        form.geography,
      ];
      if (required.some((value) => !value.trim()))
        return "Complete all identity and address fields.";
      if (
        !form.price_per_unit.trim() ||
        Number.isNaN(numberValue(form.price_per_unit))
      )
        return "Enter a valid price per unit.";
    }
    if (
      step === 1 &&
      (!form.description.trim() || form.features.some((value) => !value.trim()))
    )
      return "Add a description and complete each feature.";
    if (step === 2) {
      const financialValues = [
        form.annualPropertyTaxes,
        form.annualInsurance,
        form.appraisedValue,
        form.noi,
        form.capRate,
      ];
      if (
        financialValues.some(
          (value) => Number.isNaN(numberValue(value)) || numberValue(value) < 0,
        )
      )
        return "Financial values must be positive numbers.";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(form.lastAppraisalDate))
        return "Use the date format YYYY-MM-DD.";
    }
    if (step === 3) {
      const lat = numberValue(form.lat);
      const lng = numberValue(form.lng);
      if (
        Number.isNaN(lat) ||
        lat < -90 ||
        lat > 90 ||
        Number.isNaN(lng) ||
        lng < -180 ||
        lng > 180
      )
        return "Enter valid latitude and longitude values.";
      if (form.units.some((value) => !value.trim()))
        return "Complete each unit or remove empty rows.";
    }
    if (
      step === 1 &&
      form.customSpecifications.some(
        (item) =>
          (item.title.trim() && !item.value.trim()) ||
          (!item.title.trim() && item.value.trim()),
      )
    )
      return "Complete each custom specification or remove empty rows.";
    if (step === 3) {
      const unitCount = numberValue(form.units_available);
      if (!Number.isInteger(unitCount) || unitCount < 1) {
        return "Enter a valid positive unit count.";
      }
      if (form.customizeUnits && !form.autoGenerateUnitNumbers) {
        const customNumbers = form.customUnitNumbers
          .split(/[\n,]/)
          .map((value) => value.trim())
          .filter(Boolean);
        if (customNumbers.length !== unitCount) {
          return "Enter one custom unit number for each unit.";
        }
        if (new Set(customNumbers).size !== customNumbers.length) {
          return "Custom unit numbers must be unique.";
        }
      }
      if (form.detailedUnits.length > unitCount) {
        return "Detailed units cannot exceed the unit count.";
      }
      if (
        form.detailedUnits.some(
          (unit) => unit.rent < 0 || !unit.unitNumber.trim(),
        )
      ) {
        return "Complete each detailed unit with a valid number and rent.";
      }
    }
    return "";
  };

  const addImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 10 - form.images.length,
      quality: 1,
    });
    if (!result.canceled)
      update("images", [
        ...form.images,
        ...result.assets
          .slice(0, 10 - form.images.length)
          .map((asset) => ({ url: asset.uri, public_id: "" })),
      ]);
  };

  const createProperty = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    const normalizedUnits = form.customizeUnits
      ? form.autoGenerateUnitNumbers
        ? generateUnitNumbers()
        : form.customUnitNumbers
            .split(/[\n,]/)
            .map((value) => value.trim())
            .filter(Boolean)
      : form.units.filter((value) => value.trim());
    const draft: PropertyDraft = {
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      category: propertyCategory,
      estate: form.estate.trim(),
      price_per_unit: form.price_per_unit.trim(),
      propertyType,
      geography: form.geography.trim(),
      description: form.description.trim(),
      images: form.images,
      features: form.features.filter(Boolean),
      specifications: [
        ...typeSpecifications
          .map((specification) => ({
            title: specification.label,
            value: form.specificationValues[specification.key]?.trim() || "",
          }))
          .filter((item) => item.value),
        ...form.customSpecifications.filter(
          (item) => item.title.trim() && item.value.trim(),
        ),
      ],
      location: { lat: numberValue(form.lat), lng: numberValue(form.lng) },
      zoning: form.zoning.trim(),
      annualPropertyTaxes: numberValue(form.annualPropertyTaxes),
      annualInsurance: numberValue(form.annualInsurance),
      appraisedValue: numberValue(form.appraisedValue),
      noi: numberValue(form.noi),
      capRate: numberValue(form.capRate),
      lastAppraisalDate: new Date(form.lastAppraisalDate).toISOString(),
      units_available: numberValue(form.units_available),
      customizeUnits: form.customizeUnits,
      autoGenerateUnitNumbers: form.autoGenerateUnitNumbers,
      customUnitNumbers: form.customUnitNumbers.trim(),
      detailedUnits: form.detailedUnits,
      permittedUses: form.permittedUses
        .map((value) => value.trim())
        .filter(Boolean),
      serviceFee: numberValue(form.serviceFee),
      policies: form.policies,
      tenants: [],
      payments: [],
      units: normalizedUnits,
      owner: undefined,
    };
    adminPropertyStore.create(draft);
    Alert.alert("Property created", "The property is now pending review.", [
      { text: "Done", onPress: onClose ?? (() => navigation.goBack()) },
    ]);
  };

  const field = (
    label: string,
    key: keyof FormState,
    keyboardType: "default" | "numeric" = "default",
  ) => (
    <View key={String(key)}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={String(form[key])}
        onChangeText={(value) => update(key, value as never)}
        keyboardType={keyboardType}
      />
    </View>
  );
  const renderStep = () => {
    if (step === 0)
      return (
        <>
          <Text style={styles.sectionTitle}>Identity and address</Text>
          {field("Property name", "name")}
          {field("Address", "address")}
          {field("City", "city")}
          {field("Country", "country")}
          {field("Estate", "estate")}
          {field("Geography", "geography")}
          {field("Price per unit", "price_per_unit", "numeric")}
          <Text style={styles.label}>Category</Text>
          <View style={styles.picker}>
            <Picker
              selectedValue={propertyCategory}
              onValueChange={(value) => {
                const nextCategory = normalizeCategory(value);
                const nextType = Object.keys(
                  PROPERTY_CATEGORIES[nextCategory].types,
                )[0];
                setForm((current) => ({
                  ...current,
                  category: nextCategory,
                  propertyType: nextType,
                  specificationValues: {},
                }));
              }}
            >
              {Object.entries(PROPERTY_CATEGORIES).map(([value, category]) => (
                <Picker.Item key={value} label={category.label} value={value} />
              ))}
            </Picker>
          </View>
          <Text style={styles.label}>Property type</Text>
          <View style={styles.picker}>
            <Picker
              selectedValue={propertyType}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  propertyType: value,
                  specificationValues: {},
                }))
              }
            >
              {Object.entries(PROPERTY_CATEGORIES[propertyCategory].types).map(
                ([value, label]) => (
                  <Picker.Item key={value} label={label} value={value} />
                ),
              )}
            </Picker>
          </View>
          {field("Zoning", "zoning")}
        </>
      );
    if (step === 1)
      return (
        <>
          <Text style={styles.sectionTitle}>Description and attributes</Text>
          <Text style={styles.label}>Type-specific fields</Text>
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
                  updateSpecificationValue(specification.key, value)
                }
                placeholder={specification.placeholder}
                keyboardType={
                  specification.type === "number" ? "numeric" : "default"
                }
                multiline={specification.type === "textarea"}
              />
            </View>
          ))}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={(value) => update("description", value)}
            multiline
          />
          <Text style={styles.label}>Features</Text>
          {form.features.map((value, index) => (
            <View style={styles.row} key={`feature-${index}`}>
              <TextInput
                style={[styles.input, styles.rowInput]}
                value={value}
                onChangeText={(next) =>
                  update(
                    "features",
                    form.features.map((item, itemIndex) =>
                      itemIndex === index ? next : item,
                    ),
                  )
                }
                placeholder="Feature"
              />
              <Pressable
                style={styles.iconButton}
                onPress={() =>
                  update(
                    "features",
                    form.features.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                <MaterialIcons
                  name="remove"
                  size={18}
                  color={colors.destructive}
                />
              </Pressable>
            </View>
          ))}
          <Pressable onPress={() => update("features", [...form.features, ""])}>
            <Text style={{ color: colors.primary, marginBottom: 16 }}>
              + Add feature
            </Text>
          </Pressable>
          <Text style={styles.label}>Custom specifications</Text>
          {form.customSpecifications.map((item, index) => (
            <View style={styles.row} key={`spec-${index}`}>
              <TextInput
                style={[styles.input, styles.rowInput]}
                value={item.title}
                onChangeText={(value) =>
                  updateCustomSpecification(index, "title", value)
                }
                placeholder="Title"
              />
              <TextInput
                style={[styles.input, styles.rowInput]}
                value={item.value}
                onChangeText={(value) =>
                  updateCustomSpecification(index, "value", value)
                }
                placeholder="Value"
              />
              <Pressable
                style={styles.iconButton}
                onPress={() => removeCustomSpecification(index)}
              >
                <MaterialIcons
                  name="remove"
                  size={18}
                  color={colors.destructive}
                />
              </Pressable>
            </View>
          ))}
          <Pressable onPress={addCustomSpecification}>
            <Text style={{ color: colors.primary }}>
              + Add custom specification
            </Text>
          </Pressable>
        </>
      );
    if (step === 2)
      return (
        <>
          <Text style={styles.sectionTitle}>Financial details</Text>
          <Text style={styles.label}>Permitted uses</Text>
          {form.permittedUses.map((value, index) => (
            <View style={styles.row} key={`use-${index}`}>
              <TextInput
                style={[styles.input, styles.rowInput]}
                value={value}
                onChangeText={(next) =>
                  update(
                    "permittedUses",
                    form.permittedUses.map((item, itemIndex) =>
                      itemIndex === index ? next : item,
                    ),
                  )
                }
                placeholder="Permitted use"
              />
              <Pressable
                style={styles.iconButton}
                onPress={() =>
                  update(
                    "permittedUses",
                    form.permittedUses.filter(
                      (_, itemIndex) => itemIndex !== index,
                    ),
                  )
                }
              >
                <MaterialIcons
                  name="remove"
                  size={18}
                  color={colors.destructive}
                />
              </Pressable>
            </View>
          ))}
          <Pressable
            onPress={() => update("permittedUses", [...form.permittedUses, ""])}
          >
            <Text style={{ color: colors.primary, marginBottom: 14 }}>
              + Add permitted use
            </Text>
          </Pressable>
          {field("Annual property taxes", "annualPropertyTaxes", "numeric")}
          {field("Annual insurance", "annualInsurance", "numeric")}
          {field("Appraised value", "appraisedValue", "numeric")}
          {field("Net operating income", "noi", "numeric")}
          {field("Cap rate (%)", "capRate", "numeric")}
          {field("Last appraisal date (YYYY-MM-DD)", "lastAppraisalDate")}
          {field("Monthly service fee", "serviceFee", "numeric")}
          <Text style={styles.label}>Pet policy</Text>
          <Pressable
            style={styles.row}
            onPress={() =>
              updatePolicy("petPolicy", {
                ...form.policies.petPolicy,
                allowed: !form.policies.petPolicy.allowed,
              })
            }
          >
            <MaterialIcons
              name={
                form.policies.petPolicy.allowed
                  ? "check-box"
                  : "check-box-outline-blank"
              }
              size={22}
              color={colors.primary}
            />
            <Text style={{ color: colors.text }}>Pets allowed</Text>
          </Pressable>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.policies.petPolicy.details}
            onChangeText={(value) =>
              updatePolicy("petPolicy", {
                ...form.policies.petPolicy,
                details: value,
              })
            }
            placeholder="Pet policy details"
            multiline
          />
          <Text style={styles.label}>Parking policy</Text>
          <Pressable
            style={styles.row}
            onPress={() =>
              updatePolicy("parkingPolicy", {
                ...form.policies.parkingPolicy,
                allowed: !form.policies.parkingPolicy.allowed,
              })
            }
          >
            <MaterialIcons
              name={
                form.policies.parkingPolicy.allowed
                  ? "check-box"
                  : "check-box-outline-blank"
              }
              size={22}
              color={colors.primary}
            />
            <Text style={{ color: colors.text }}>Parking allowed</Text>
          </Pressable>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.policies.parkingPolicy.details}
            onChangeText={(value) =>
              updatePolicy("parkingPolicy", {
                ...form.policies.parkingPolicy,
                details: value,
              })
            }
            placeholder="Parking policy details"
            multiline
          />
          <Text style={styles.label}>Lease policy</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.policies.leasePolicy}
            onChangeText={(value) => updatePolicy("leasePolicy", value)}
            placeholder="Lease policy"
            multiline
          />
          <Text style={styles.label}>Other policies</Text>
          {form.policies.otherPolicies.map((policy, index) => (
            <View style={styles.review} key={`policy-${index}`}>
              <TextInput
                style={styles.input}
                value={policy.title}
                onChangeText={(value) =>
                  updateOtherPolicy(index, "title", value)
                }
                placeholder="Policy title"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={policy.body}
                onChangeText={(value) =>
                  updateOtherPolicy(index, "body", value)
                }
                placeholder="Policy details"
                multiline
              />
              <Pressable onPress={() => removeOtherPolicy(index)}>
                <Text style={{ color: colors.destructive }}>Remove policy</Text>
              </Pressable>
            </View>
          ))}
          <Pressable onPress={addOtherPolicy}>
            <Text style={{ color: colors.primary, marginBottom: 14 }}>
              + Add policy
            </Text>
          </Pressable>
        </>
      );
    if (step === 3)
      return (
        <>
          <Text style={styles.sectionTitle}>Location and units</Text>
          {field("Latitude", "lat", "numeric")}
          {field("Longitude", "lng", "numeric")}
          {field("Number of units", "units_available", "numeric")}
          <Text style={styles.label}>Unit numbering</Text>
          <Pressable
            style={styles.row}
            onPress={() => update("customizeUnits", !form.customizeUnits)}
          >
            <MaterialIcons
              name={
                form.customizeUnits ? "check-box" : "check-box-outline-blank"
              }
              size={22}
              color={colors.primary}
            />
            <Text style={{ color: colors.text }}>Customize units</Text>
          </Pressable>
          {form.customizeUnits && (
            <>
              <Pressable
                style={styles.row}
                onPress={() =>
                  update(
                    "autoGenerateUnitNumbers",
                    !form.autoGenerateUnitNumbers,
                  )
                }
              >
                <MaterialIcons
                  name={
                    form.autoGenerateUnitNumbers
                      ? "check-box"
                      : "check-box-outline-blank"
                  }
                  size={22}
                  color={colors.primary}
                />
                <Text style={{ color: colors.text }}>
                  Auto-generate unit numbers
                </Text>
              </Pressable>
              {!form.autoGenerateUnitNumbers && (
                <>
                  <Text style={styles.label}>Custom unit numbers</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={form.customUnitNumbers}
                    onChangeText={(value) => update("customUnitNumbers", value)}
                    placeholder="A-101\nA-102\nB-201"
                    multiline
                  />
                </>
              )}
              <Text style={styles.label}>Detailed units</Text>
              {form.detailedUnits.map((unit, index) => (
                <View style={styles.review} key={`detailed-unit-${index}`}>
                  <View style={styles.row}>
                    <TextInput
                      style={[styles.input, styles.rowInput]}
                      value={unit.unitNumber}
                      onChangeText={(value) =>
                        updateDetailedUnit(index, "unitNumber", value)
                      }
                      placeholder="Unit number"
                    />
                    <TextInput
                      style={[styles.input, styles.rowInput]}
                      value={String(unit.rent)}
                      onChangeText={(value) =>
                        updateDetailedUnit(index, "rent", numberValue(value))
                      }
                      placeholder="Rent"
                      keyboardType="numeric"
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    value={unit.unitType}
                    onChangeText={(value) =>
                      updateDetailedUnit(index, "unitType", value)
                    }
                    placeholder="Unit type"
                  />
                  <Text style={styles.label}>Unit images</Text>
                  <View style={styles.imageGrid}>
                    {unit.images.map((image, imageIndex) => (
                      <View
                        style={styles.imageWrap}
                        key={`${image.url}-${imageIndex}`}
                      >
                        <Image
                          source={{ uri: image.url }}
                          style={styles.image}
                        />
                        <Pressable
                          style={styles.imageRemove}
                          onPress={() => removeUnitImage(index, imageIndex)}
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
                  <Text style={styles.stepLabel}>
                    {unit.images.length}/5 unit images selected
                  </Text>
                  {unit.specifications.map(
                    (specification, specificationIndex) => (
                      <View
                        style={styles.row}
                        key={`unit-spec-${index}-${specificationIndex}`}
                      >
                        <TextInput
                          style={[styles.input, styles.rowInput]}
                          value={specification.label}
                          onChangeText={(value) =>
                            updateUnitSpecification(
                              index,
                              specificationIndex,
                              "label",
                              value,
                            )
                          }
                          placeholder="Label"
                        />
                        <TextInput
                          style={[styles.input, styles.rowInput]}
                          value={specification.value}
                          onChangeText={(value) =>
                            updateUnitSpecification(
                              index,
                              specificationIndex,
                              "value",
                              value,
                            )
                          }
                          placeholder="Value"
                        />
                        <Pressable
                          style={styles.iconButton}
                          onPress={() =>
                            removeUnitSpecification(index, specificationIndex)
                          }
                        >
                          <MaterialIcons
                            name="remove"
                            size={18}
                            color={colors.destructive}
                          />
                        </Pressable>
                      </View>
                    ),
                  )}
                  <View style={styles.row}>
                    <Pressable onPress={() => addUnitSpecification(index)}>
                      <Text style={{ color: colors.primary }}>
                        + Add unit spec
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => removeDetailedUnit(index)}>
                      <Text style={{ color: colors.destructive }}>
                        Remove unit
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))}
              <Pressable onPress={addDetailedUnit}>
                <Text style={{ color: colors.primary, marginBottom: 14 }}>
                  + Add detailed unit
                </Text>
              </Pressable>
            </>
          )}
          <Text style={styles.label}>Unit identifiers</Text>
          {form.units.map((value, index) => (
            <View style={styles.row} key={`unit-${index}`}>
              <TextInput
                style={[styles.input, styles.rowInput]}
                value={value}
                onChangeText={(next) =>
                  update(
                    "units",
                    form.units.map((item, itemIndex) =>
                      itemIndex === index ? next : item,
                    ),
                  )
                }
                placeholder="Unit identifier"
              />
              <Pressable
                style={styles.iconButton}
                onPress={() =>
                  update(
                    "units",
                    form.units.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                <MaterialIcons
                  name="remove"
                  size={18}
                  color={colors.destructive}
                />
              </Pressable>
            </View>
          ))}
          <Pressable onPress={() => update("units", [...form.units, ""])}>
            <Text style={{ color: colors.primary }}>+ Add unit</Text>
          </Pressable>
          {form.customizeUnits && form.autoGenerateUnitNumbers && (
            <Text style={{ color: colors.textMuted, marginTop: 12 }}>
              Generated preview: {generateUnitNumbers().join(", ") || "None"}
            </Text>
          )}
        </>
      );
    return (
      <>
        <Text style={styles.sectionTitle}>Images and review</Text>
        <View style={styles.imageGrid}>
          {form.images.map((image, index) => (
            <View style={styles.imageWrap} key={`${image.url}-${index}`}>
              <Image source={{ uri: image.url }} style={styles.image} />
              <Pressable
                style={styles.imageRemove}
                onPress={() =>
                  update(
                    "images",
                    form.images.filter((_, imageIndex) => imageIndex !== index),
                  )
                }
              >
                <MaterialIcons name="close" size={14} color="white" />
              </Pressable>
            </View>
          ))}
          {form.images.length < 10 && (
            <Pressable style={styles.imageButton} onPress={addImage}>
              <MaterialIcons
                name="add-photo-alternate"
                size={24}
                color={colors.textMuted}
              />
            </Pressable>
          )}
        </View>
        <Text style={styles.stepLabel}>
          {form.images.length}/10 images selected
        </Text>
        {[
          ["Name", form.name],
          ["Address", `${form.address}, ${form.city}, ${form.country}`],
          [
            "Category",
            `${PROPERTY_CATEGORIES[propertyCategory].label} / ${propertyType}`,
          ],
          ["Description", form.description],
          ["Units", form.units_available],
          [
            "Unit configuration",
            form.customizeUnits
              ? form.autoGenerateUnitNumbers
                ? "Customized, auto-generated numbers"
                : "Customized, manual numbers"
              : "Base unit configuration",
          ],
          ["Detailed units", String(form.detailedUnits.length)],
          ["Permitted uses", form.permittedUses.filter(Boolean).join(", ")],
          ["Service fee", form.serviceFee],
          [
            "Policies",
            `${form.policies.petPolicy.allowed ? "Pets" : "No pets"}, ${form.policies.parkingPolicy.allowed ? "Parking" : "No parking"}`,
          ],
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
        <Text style={styles.title}>Add Property</Text>
        <Pressable
          style={styles.closeButton}
          onPress={onClose ?? (() => navigation.goBack())}
        >
          <MaterialIcons name="close" size={24} color={colors.text} />
        </Pressable>
      </View>
      <View style={styles.progress}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressItem,
              index <= step && styles.activeProgress,
            ]}
          />
        ))}
      </View>
      <Text style={styles.stepLabel}>
        Step {step + 1} of {steps.length}: {steps[step]}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {renderStep()}
      <View style={styles.footer}>
        {step > 0 && (
          <Pressable
            style={styles.footerButton}
            onPress={() => {
              setError("");
              setStep((current) => current - 1);
            }}
          >
            <Text style={styles.buttonText}>Back</Text>
          </Pressable>
        )}
        {step < steps.length - 1 ? (
          <Pressable
            style={[styles.footerButton, styles.primaryButton]}
            onPress={() => {
              const validationError = validateStep();
              if (validationError) setError(validationError);
              else {
                setError("");
                setStep((current) => current + 1);
              }
            }}
          >
            <Text style={[styles.buttonText, styles.primaryText]}>Next</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.footerButton, styles.primaryButton]}
            onPress={createProperty}
          >
            <Text style={[styles.buttonText, styles.primaryText]}>
              Create Property
            </Text>
          </Pressable>
        )}
      </View>
      <View style={{ height: 70, width: "100%" }} />
    </ScrollView>
  );
}
