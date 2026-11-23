import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import {
  BillingPeriod,
  MarketplacePropertyRecord,
  PropertyImage,
  Property,
  PropertySpecification,
  PropertyUnit,
  getPublishedListing,
} from "../../../data/property";
import {
  AdminProperty,
  adminPropertyStore,
} from "../../../data/adminPropertyStore";
import {
  getErrorMessage,
  uploadRequest,
} from "../../../shared/queryClient";
import {
  getSpecificationsForType,
  normalizeCategory,
  normalizePropertyType,
  PROPERTY_CATEGORIES,
} from "../../../data/propertyTypes";

type PropertySource = "local" | "marketplace" | "server-marketplace";
type PropertySnapshot = Property | MarketplacePropertyRecord | AdminProperty;
type Props = {
  onClose?: () => void;
  route?: {
    params?: {
      mode?: "edit";
      propertyId?: string;
      propertySource?: PropertySource;
      propertySnapshot?: PropertySnapshot;
    };
  };
};
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
const CURRENCIES = [
  { label: "BIF - Burundian Franc", value: "BIF" },
  { label: "CDF - Congolese Franc", value: "CDF" },
  { label: "KES - Kenyan Shilling", value: "KES" },
  { label: "RWF - Rwandan Franc", value: "RWF" },
  { label: "SOS - Somali Shilling", value: "SOS" },
  { label: "SSP - South Sudanese Pound", value: "SSP" },
  { label: "TZS - Tanzanian Shilling", value: "TZS" },
  { label: "UGX - Ugandan Shilling", value: "UGX" },
  { label: "USD - US Dollar", value: "USD" },
  { label: "EUR - Euro", value: "EUR" },
  { label: "GBP - British Pound", value: "GBP" },
  { label: "INR - Indian Rupee", value: "INR" },
  { label: "CNY - Chinese Yuan", value: "CNY" },
];
const PROPERTY_IMAGE_PAGE_SIZE = 3;
const isLegacyAdminProperty = (
  property: PropertySnapshot | undefined,
  source: PropertySource | undefined,
): property is AdminProperty =>
  source === "local" &&
  property !== undefined &&
  "price_per_unit" in property;

const createInitialForm = (
  property?: PropertySnapshot,
  source?: PropertySource,
) => {
  const isLegacyProperty = isLegacyAdminProperty(property, source);
  const listing =
    property && !isLegacyProperty
      ? getPublishedListing(property)
      : undefined;
  const category = normalizeCategory(property?.category ?? "residential");
  const propertyType = normalizePropertyType(
    property?.propertyType ?? "apartment",
    category,
  );
  const predefinedSpecifications = getSpecificationsForType(propertyType);
  const specificationValues: Record<string, string> = {};
  const customSpecifications: PropertySpecification[] = [];

  for (const specification of property?.specifications ?? []) {
    const predefined = predefinedSpecifications.find(
      (item) =>
        item.key === specification.title ||
        item.label.toLowerCase() === specification.title.toLowerCase(),
    );
    if (predefined) {
      specificationValues[predefined.key] = specification.value;
    } else {
      customSpecifications.push({
        title: specification.title,
        value: specification.value,
      });
    }
  }

  const images = (property?.images ?? []).map((image) => ({
    title:
      "title" in image && image.title
        ? image.title
        : "Property photo",
    url: image.url,
    publicId:
      "publicId" in image
        ? image.publicId
        : "public_id" in image
          ? image.public_id
          : undefined,
  }));
  const legacyUnits = isLegacyProperty
    ? property.detailedUnits.map((unit, index) => ({
        id: `${property.id}-unit-${index}`,
        propertyId: property.id,
        unitNumber: unit.unitNumber,
        rent: unit.rent,
        unitType: unit.unitType,
        description: "",
        price: unit.rent,
        currency: "UGX",
        billingPeriod: "monthly" as const,
        isAvailable: true,
        specifications: unit.specifications.map((specification) => ({
          title: specification.label,
          value: specification.value,
        })),
        images: unit.images.map((image) => ({
          title: image.name,
          url: image.url,
          publicId: image.public_id,
        })),
      }))
    : [];
  const policies = isLegacyProperty
    ? {
        pets: {
          allowed: property.policies.petPolicy.allowed,
          details: property.policies.petPolicy.details,
        },
        parking: {
          allowed: property.policies.parkingPolicy.allowed,
          details: property.policies.parkingPolicy.details,
        },
        lease: property.policies.leasePolicy,
        other: property.policies.otherPolicies.map((item) => ({
          title: item.title,
          body: item.body,
        })),
      }
    : {
        pets: {
          allowed: property?.policies?.pets?.allowed ?? false,
          details: property?.policies?.pets?.details ?? "",
        },
        parking: {
          allowed: property?.policies?.parking?.allowed ?? false,
          details: property?.policies?.parking?.details ?? "",
        },
        lease: property?.policies?.lease ?? "",
        other: property?.policies?.other ?? [],
      };

  return {
    name: property?.name ?? "",
    purpose: listing?.purpose ?? "rent" as const,
    price: String(
      listing?.price ??
        (isLegacyProperty
          ? Number(property.price_per_unit)
          : property?.pricePerUnit ?? ""),
    ),
    currency: listing?.currency ?? "UGX",
    billingPeriod: listing?.billingPeriod ?? "monthly" as const,
    serviceFee: String(listing?.serviceFee ?? property?.serviceFee ?? ""),
    negotiable: listing?.negotiable ?? false,
    availableFrom: listing?.availableFrom ?? "",
    category,
    propertyType,
    description: property?.description ?? "",
    address: property?.address ?? "",
    estate: property?.estate ?? "",
    city: property?.city ?? "",
    country: property?.country ?? "",
    lat: String(property?.location?.lat ?? ""),
    lng: String(property?.location?.lng ?? ""),
    images,
    features:
      property?.features?.length ? [...property.features] : [""],
    specificationValues,
    customSpecifications,
    policies,
    units: isLegacyProperty ? legacyUnits : property?.units ?? [],
  };
};

export const MarketplacePropertyCreation = ({
  onClose,
  route,
}: Props) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const propertySource = route?.params?.propertySource;
  const propertySnapshot = route?.params?.propertySnapshot;
  const isEditing = route?.params?.mode === "edit";
  const propertyId = route?.params?.propertyId ?? propertySnapshot?.id;
  const editablePropertyId = propertyId ?? "";
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageGalleryPage, setImageGalleryPage] = useState(0);
  const [imageGalleryWidth, setImageGalleryWidth] = useState(0);
  const imageGalleryRef = useRef<ScrollView>(null);
  const [form, setForm] = useState(() =>
    createInitialForm(propertySnapshot, propertySource),
  );
  const imagePageCount = Math.max(
    1,
    Math.ceil(form.images.length / PROPERTY_IMAGE_PAGE_SIZE),
  );
  const displayedImagePage = Math.min(imageGalleryPage, imagePageCount - 1);
  const imagePages = Array.from({ length: imagePageCount }, (_, pageIndex) =>
    form.images.slice(
      pageIndex * PROPERTY_IMAGE_PAGE_SIZE,
      (pageIndex + 1) * PROPERTY_IMAGE_PAGE_SIZE,
    ),
  );
  const visibleImageStart =
    form.images.length === 0
      ? 0
      : displayedImagePage * PROPERTY_IMAGE_PAGE_SIZE + 1;
  const visibleImageEnd = Math.min(
    (displayedImagePage + 1) * PROPERTY_IMAGE_PAGE_SIZE,
    form.images.length,
  );

  useEffect(() => {
    const lastPage = imagePageCount - 1;
    const page = Math.min(imageGalleryPage, lastPage);
    if (page !== imageGalleryPage) setImageGalleryPage(page);
    if (imageGalleryWidth > 0) {
      imageGalleryRef.current?.scrollTo({
        x: page * imageGalleryWidth,
        animated: false,
      });
    }
  }, [imageGalleryWidth, imagePageCount]);

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
        imageGalleryViewport: {
          height: 100,
          overflow: "hidden",
          marginBottom: 8,
        },
        imagePage: { flexGrow: 0 },
        imagePageGrid: {
          flexDirection: "row",
          flexWrap: "wrap",
          alignContent: "flex-start",
          gap: 8,
          minHeight: 92,
          paddingVertical: 4,
        },
        imagePagination: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
        },
        imagePageButton: {
          flexDirection: "row",
          alignItems: "center",
          gap: 2,
          paddingVertical: 6,
          paddingHorizontal: 4,
        },
        imagePageButtonDisabled: { opacity: 0.4 },
        imagePageStatus: { alignItems: "center", flex: 1 },
        imagePageStatusText: {
          color: colors.text,
          fontSize: 12,
          fontWeight: "700",
          textAlign: "center",
        },
        imageScrollHint: {
          color: colors.textMuted,
          fontSize: 12,
          marginBottom: 8,
          textAlign: "center",
        },
        addPropertyImages: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          alignSelf: "flex-start",
          paddingVertical: 8,
          paddingHorizontal: 10,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          marginBottom: 12,
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
          paddingBottom: 70,
        },
        footerButton: {
          flex: 1,
          borderRadius: 8,
          padding: 14,
          alignItems: "center",
          borderWidth: 1,
          borderColor: colors.border,
        },
        disabledButton: { opacity: 0.6 },
        submittingContent: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
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
  ) => {
    if (key === "currency") {
      return (
        <View key={String(key)}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.picker}>
            <Picker
              selectedValue={form.currency}
              onValueChange={(value) => update("currency", value)}
            >
              {CURRENCIES.map((currency) => (
                <Picker.Item
                  key={currency.value}
                  label={currency.label}
                  value={currency.value}
                />
              ))}
            </Picker>
          </View>
        </View>
      );
    }

    return (
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
  };

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

  const goToImagePage = (page: number) => {
    const nextPage = Math.max(0, Math.min(page, imagePageCount - 1));
    setImageGalleryPage(nextPage);
    if (imageGalleryWidth > 0) {
      imageGalleryRef.current?.scrollTo({
        x: nextPage * imageGalleryWidth,
        animated: true,
      });
    }
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
    if (isSubmitting) return;
    if (
      isEditing &&
      (!editablePropertyId || !propertySource || !propertySnapshot)
    ) {
      setError("Unable to load this property for editing. Please reopen it.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const imageFiles: Array<{
        uri: string;
        fileName?: string | null;
      }> = [];
      const buildImageReference = (
        image: PropertyImage,
        index: number,
        prefix: string,
      ) => {
        const title = image.title || `${prefix} ${index + 1}`;
        if (/^https?:\/\//i.test(image.url)) {
          return {
            title,
            url: image.url,
            publicId: image.publicId,
          };
        }
        imageFiles.push({ uri: image.url, fileName: title });
        return { title, uploadIndex: imageFiles.length - 1 };
      };
      const propertyImages = form.images.map((image, index) =>
        buildImageReference(image, index, "Property photo"),
      );
      const units = form.units.map((unit, unitIndex) => ({
        ...unit,
        images: unit.images.map((image, imageIndex) =>
          buildImageReference(
            image,
            imageIndex,
            `Unit ${unitIndex + 1} photo`,
          ),
        ),
      }));
      const specifications = [
        ...typeSpecifications
          .map((specification) => ({
            title: specification.label,
            value: form.specificationValues[specification.key]?.trim() || "",
          }))
          .filter((specification) => specification.value),
        ...form.customSpecifications
          .filter(
            (specification) =>
              specification.title.trim() && specification.value.trim(),
          )
          .map((specification) => ({
            title: specification.title.trim(),
            value: specification.value.trim(),
          })),
      ];
      const listing = {
        purpose: form.purpose,
        price: Number(form.price),
        currency: form.currency,
        billingPeriod:
          form.purpose === "sale"
            ? ("one-time" as const)
            : form.billingPeriod,
        serviceFee: form.serviceFee ? Number(form.serviceFee) : null,
        negotiable: form.negotiable,
        availableFrom: form.availableFrom || null,
      };
      const payload = {
        name: form.name.trim(),
        category,
        propertyType,
        description: form.description.trim(),
        address: form.address.trim(),
        estate: form.estate.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
        location: { lat: Number(form.lat) || 0, lng: Number(form.lng) || 0 },
        images: propertyImages,
        features: form.features
          .map((feature) => feature.trim())
          .filter(Boolean),
        specifications,
        policies: form.policies,
        units,
        listing,
        listingId:
          propertySnapshot && "listings" in propertySnapshot
            ? getPublishedListing(propertySnapshot)?.id
            : undefined,
      };

      if (isEditing && propertySource === "local") {
        if (isLegacyAdminProperty(propertySnapshot, propertySource)) {
          const legacyUnits = form.units.map((unit) => ({
            unitNumber: unit.unitNumber,
            rent: unit.price ?? unit.rent,
            unitType: unit.unitType,
            specifications: unit.specifications.map((specification) => ({
              label: specification.title,
              value: specification.value,
            })),
            images: unit.images.map((image) => ({
              name: image.title || "Unit image",
              url: image.url,
              public_id: image.publicId || "",
            })),
          }));
          adminPropertyStore.update(editablePropertyId, {
            name: payload.name,
            category: payload.category,
            propertyType: payload.propertyType,
            description: payload.description,
            address: payload.address,
            estate: payload.estate,
            city: payload.city,
            country: payload.country,
            location: payload.location,
            price_per_unit: String(listing.price),
            images: form.images.map((image) => ({
              url: image.url,
              public_id: image.publicId || "",
            })),
            features: payload.features,
            specifications,
            policies: {
              petPolicy: form.policies.pets,
              parkingPolicy: form.policies.parking,
              leasePolicy: form.policies.lease,
              otherPolicies: form.policies.other.map((policy) => ({
                title: policy.title || "",
                body: policy.body || "",
              })),
            },
            serviceFee: listing.serviceFee ?? 0,
            units_available: form.units.filter((unit) => unit.isAvailable)
              .length,
            customizeUnits: form.units.length > 1,
            detailedUnits: legacyUnits,
            units: legacyUnits,
          });
        } else {
          throw new Error("The selected local property cannot be edited.");
        }
      } else if (isEditing && propertySource === "marketplace") {
        if (
          !propertySnapshot ||
          isLegacyAdminProperty(propertySnapshot, propertySource)
        ) {
          throw new Error("The selected marketplace property cannot be edited.");
        }
        const existingListing = propertySnapshot.listings.find(
          (item) => item.id === payload.listingId,
        );
        if (!existingListing) {
          throw new Error("This property has no listing to update.");
        }
        adminPropertyStore.updateMarketplace(editablePropertyId, {
          name: payload.name,
          category: payload.category,
          propertyType: payload.propertyType,
          description: payload.description,
          address: payload.address,
          estate: payload.estate,
          city: payload.city,
          country: payload.country,
          location: payload.location,
          images: form.images,
          features: payload.features,
          specifications,
          policies: form.policies,
          units: form.units,
          unitsAvailable: form.units.filter((unit) => unit.isAvailable).length,
          customizeUnits: form.units.length > 1,
          serviceFee: listing.serviceFee ?? undefined,
          pricePerUnit: listing.price,
          listings: propertySnapshot.listings.map((item) =>
            item.id === payload.listingId
              ? {
                  ...existingListing,
                  purpose: listing.purpose,
                  price: listing.price,
                  currency: listing.currency,
                  billingPeriod: listing.billingPeriod,
                  serviceFee: listing.serviceFee ?? undefined,
                  negotiable: listing.negotiable,
                  availableFrom: form.availableFrom || undefined,
                }
              : item,
          ),
        });
      } else {
        const formData = new FormData();
        imageFiles.forEach((asset, index) => {
          const extension = asset.uri
            .match(/\.([a-z0-9]+)(?:\?|$)/i)?.[1]
            ?.toLowerCase();
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
        formData.append("payload", JSON.stringify(payload));
        if (isEditing) {
          if (propertySource !== "server-marketplace") {
            throw new Error("Choose a valid property source to edit.");
          }
          if (!payload.listingId) {
            throw new Error("This property has no listing to update.");
          }
          await uploadRequest(
            "PATCH",
            `/properties/marketplace/${editablePropertyId}`,
            formData,
          );
        } else {
          await uploadRequest("POST", "/properties/marketplace", formData);
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["properties"] });
      await queryClient.invalidateQueries({
        queryKey: ["properties", "marketplace", "manage"],
      });
      Alert.alert(
        isEditing ? "Property updated" : "Submitted for review",
        isEditing
          ? "Your property changes have been saved."
          : "Your property is pending approval.",
        [{ text: "Done", onPress: onClose ?? (() => navigation.goBack()) }],
      );
    } catch (submitError) {
      setError(
        getErrorMessage(
          submitError,
          "Unable to submit this property. Please try again.",
        ),
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
        <View
          style={styles.imageGalleryViewport}
          onLayout={(event) =>
            setImageGalleryWidth(event.nativeEvent.layout.width)
          }
        >
          <ScrollView
            ref={imageGalleryRef}
            horizontal
            pagingEnabled
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              if (!imageGalleryWidth) return;
              const page = Math.round(
                event.nativeEvent.contentOffset.x / imageGalleryWidth,
              );
              setImageGalleryPage(
                Math.max(0, Math.min(page, imagePageCount - 1)),
              );
            }}
          >
            {imagePages.map((images, pageIndex) => (
              <View
                key={`property-image-page-${pageIndex}`}
                style={[
                  styles.imagePage,
                  { width: imageGalleryWidth || "100%" },
                ]}
              >
                <View style={styles.imagePageGrid}>
                  {images.map((image, imageIndex) => {
                    const index =
                      pageIndex * PROPERTY_IMAGE_PAGE_SIZE + imageIndex;
                    return (
                      <View
                        key={`${image.url}-${index}`}
                        style={styles.imageWrap}
                      >
                        <Image
                          source={{ uri: image.url }}
                          style={styles.image}
                        />
                        <Pressable
                          style={styles.removeButton}
                          onPress={() =>
                            update(
                              "images",
                              form.images.filter(
                                (_, currentIndex) => currentIndex !== index,
                              ),
                            )
                          }
                          accessibilityRole="button"
                          accessibilityLabel={`Remove property image ${index + 1}`}
                        >
                          <MaterialIcons
                            name="close"
                            size={14}
                            color="white"
                          />
                        </Pressable>
                      </View>
                    );
                  })}
                  {form.images.length === 0 && (
                    <Text style={{ color: colors.textMuted }}>
                      No property photos added yet.
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
          </View>
        <View style={styles.imagePagination}>
          <Pressable
            style={[
              styles.imagePageButton,
              displayedImagePage === 0 && styles.imagePageButtonDisabled,
            ]}
            onPress={() => goToImagePage(displayedImagePage - 1)}
            disabled={displayedImagePage === 0}
            accessibilityRole="button"
            accessibilityLabel="Previous property image page"
          >
            <MaterialIcons
              name="chevron-left"
              size={20}
              color={colors.primary}
            />
            <Text style={{ color: colors.primary }}>Previous</Text>
          </Pressable>
          <View style={styles.imagePageStatus}>
            <Text style={styles.imagePageStatusText}>
              {form.images.length === 0
                ? "0 photos"
                : `Photos ${visibleImageStart}–${visibleImageEnd} of ${form.images.length}`}
            </Text>
            <Text style={styles.imagePageStatusText}>
              Page {displayedImagePage + 1} of {imagePageCount}
            </Text>
          </View>
          <Pressable
            style={[
              styles.imagePageButton,
              displayedImagePage >= imagePageCount - 1 &&
                styles.imagePageButtonDisabled,
            ]}
            onPress={() => goToImagePage(displayedImagePage + 1)}
            disabled={displayedImagePage >= imagePageCount - 1}
            accessibilityRole="button"
            accessibilityLabel="Next property image page"
          >
            <Text style={{ color: colors.primary }}>Next</Text>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={colors.primary}
            />
          </Pressable>
        </View>
        {imagePageCount > 1 && (
          <Text style={styles.imageScrollHint}>
            {displayedImagePage < imagePageCount - 1
              ? `Swipe or tap Next to see ${form.images.length - visibleImageEnd} more photos.`
              : "This is the last page. Swipe back or tap Previous to view earlier photos."}
          </Text>
        )}
        {form.images.length < 10 && (
          <Pressable
            style={styles.addPropertyImages}
            onPress={addImages}
            accessibilityRole="button"
            accessibilityLabel={`Add property photos, ${form.images.length} of 10 selected`}
          >
            <MaterialIcons
              name="add-photo-alternate"
              size={20}
              color={colors.primary}
            />
            <Text style={{ color: colors.primary }}>
              Add photos ({form.images.length}/10)
            </Text>
          </Pressable>
        )}
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
          <Text style={styles.label}>Additional specifications</Text>
          {form.customSpecifications.map((specification, index) => (
            <View style={styles.card} key={`custom-specification-${index}`}>
              <TextInput
                style={styles.input}
                value={specification.title}
                onChangeText={(value) =>
                  update(
                    "customSpecifications",
                    form.customSpecifications.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, title: value } : item,
                    ),
                  )
                }
                placeholder="Specification name"
                placeholderTextColor={colors.textMuted}
              />
              <TextInput
                style={styles.input}
                value={specification.value}
                onChangeText={(value) =>
                  update(
                    "customSpecifications",
                    form.customSpecifications.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, value } : item,
                    ),
                  )
                }
                placeholder="Value"
                placeholderTextColor={colors.textMuted}
              />
              <Pressable
                onPress={() =>
                  update(
                    "customSpecifications",
                    form.customSpecifications.filter(
                      (_, itemIndex) => itemIndex !== index,
                    ),
                  )
                }
              >
                <Text style={{ color: colors.destructive }}>
                  Remove specification
                </Text>
              </Pressable>
            </View>
          ))}
          <Pressable
            onPress={() =>
              update("customSpecifications", [
                ...form.customSpecifications,
                { title: "", value: "" },
              ])
            }
          >
            <Text style={{ color: colors.primary }}>
              + Add custom specification
            </Text>
          </Pressable>
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
          <Text style={styles.label}>Pet policy details</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.policies.pets.details}
            onChangeText={(value) =>
              update("policies", {
                ...form.policies,
                pets: { ...form.policies.pets, details: value },
              })
            }
            multiline
            placeholder="Optional pet requirements"
            placeholderTextColor={colors.textMuted}
          />
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
          <Text style={styles.label}>Parking details</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.policies.parking.details}
            onChangeText={(value) =>
              update("policies", {
                ...form.policies,
                parking: { ...form.policies.parking, details: value },
              })
            }
            multiline
            placeholder="Optional parking information"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.label}>Other policies</Text>
          {form.policies.other.map((policy, index) => (
            <View style={styles.card} key={`other-policy-${index}`}>
              <TextInput
                style={styles.input}
                value={policy.title ?? ""}
                onChangeText={(value) =>
                  update("policies", {
                    ...form.policies,
                    other: form.policies.other.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, title: value } : item,
                    ),
                  })
                }
                placeholder="Policy title"
                placeholderTextColor={colors.textMuted}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={policy.body ?? ""}
                onChangeText={(value) =>
                  update("policies", {
                    ...form.policies,
                    other: form.policies.other.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, body: value } : item,
                    ),
                  })
                }
                multiline
                placeholder="Policy details"
                placeholderTextColor={colors.textMuted}
              />
              <Pressable
                onPress={() =>
                  update("policies", {
                    ...form.policies,
                    other: form.policies.other.filter(
                      (_, itemIndex) => itemIndex !== index,
                    ),
                  })
                }
              >
                <Text style={{ color: colors.destructive }}>Remove policy</Text>
              </Pressable>
            </View>
          ))}
          <Pressable
            onPress={() =>
              update("policies", {
                ...form.policies,
                other: [...form.policies.other, { title: "", body: "" }],
              })
            }
          >
            <Text style={{ color: colors.primary }}>+ Add policy</Text>
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
              <Text style={styles.label}>Unit specifications</Text>
              {unit.specifications.map((specification, specificationIndex) => (
                <View
                  style={styles.card}
                  key={`unit-${unit.id}-specification-${specificationIndex}`}
                >
                  <TextInput
                    style={styles.input}
                    value={specification.title}
                    onChangeText={(value) =>
                      updateUnit(
                        index,
                        "specifications",
                        unit.specifications.map((item, itemIndex) =>
                          itemIndex === specificationIndex
                            ? { ...item, title: value }
                            : item,
                        ),
                      )
                    }
                    placeholder="Specification name"
                    placeholderTextColor={colors.textMuted}
                  />
                  <TextInput
                    style={styles.input}
                    value={specification.value}
                    onChangeText={(value) =>
                      updateUnit(
                        index,
                        "specifications",
                        unit.specifications.map((item, itemIndex) =>
                          itemIndex === specificationIndex
                            ? { ...item, value }
                            : item,
                        ),
                      )
                    }
                    placeholder="Value"
                    placeholderTextColor={colors.textMuted}
                  />
                  <Pressable
                    onPress={() =>
                      updateUnit(
                        index,
                        "specifications",
                        unit.specifications.filter(
                          (_, itemIndex) => itemIndex !== specificationIndex,
                        ),
                      )
                    }
                  >
                    <Text style={{ color: colors.destructive }}>
                      Remove specification
                    </Text>
                  </Pressable>
                </View>
              ))}
              <Pressable
                onPress={() =>
                  updateUnit(index, "specifications", [
                    ...unit.specifications,
                    { title: "", value: "" },
                  ])
                }
              >
                <Text style={{ color: colors.primary }}>
                  + Add unit specification
                </Text>
              </Pressable>
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
        <Text style={styles.title}>
          {isEditing ? "Edit property profile" : "Add property listing"}
        </Text>
        <Pressable
          onPress={onClose ?? (() => navigation.goBack())}
          disabled={isSubmitting}
          style={isSubmitting && styles.disabledButton}
        >
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
            style={[
              styles.footerButton,
              isSubmitting && styles.disabledButton,
            ]}
            onPress={() => {
              setError("");
              setStepIndex((value) => value - 1);
            }}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>Back</Text>
          </Pressable>
        )}
        {stepIndex < STEPS.length - 1 ? (
          <Pressable
            style={[
              styles.footerButton,
              styles.primaryButton,
              isSubmitting && styles.disabledButton,
            ]}
            onPress={() => {
              const validationError = validate();
              if (validationError) {
                setError(validationError);
                return;
              }
              setError("");
              setStepIndex((value) => value + 1);
            }}
            disabled={isSubmitting}
          >
            <Text style={[styles.buttonText, styles.primaryText]}>
              Continue
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={[
              styles.footerButton,
              styles.primaryButton,
              isSubmitting && styles.disabledButton,
            ]}
            onPress={submit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <View style={styles.submittingContent}>
                <ActivityIndicator size="small" color="white" />
                <Text style={[styles.buttonText, styles.primaryText]}>
                  {isEditing ? "Saving changes..." : "Submitting..."}
                </Text>
              </View>
            ) : (
              <Text style={[styles.buttonText, styles.primaryText]}>
                {isEditing ? "Save changes" : "Submit for review"}
              </Text>
            )}
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
};

export default MarketplacePropertyCreation;
