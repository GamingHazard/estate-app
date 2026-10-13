import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
} from "react-native";
import { useTheme } from "../../shared/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList, NavigationProp } from "../../shared/types";
import {
  formatPropertyPrice,
  getListingPriceLabel,
  getPublishedListing,
  getPropertyDisplayLocation,
  PropertyListing,
} from "../../data/property";
import { useAuth } from "../auth/AuthContext";
import { useSavedProperties } from "./SavedPropertiesContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NO_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/624px-No-Image-Placeholder.svg.png";

const QUICK_SPECIFICATION_PRIORITY = [
  "bedrooms",
  "beds",
  "bathrooms",
  "baths",
  "sqft",
  "square feet",
  "area",
  "lot size",
];

type PropertyDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  "PropertyDetails"
>;

type Props = {
  route: PropertyDetailsScreenRouteProp;
};

type PolicyDetail = {
  title: string;
  value?: string;
  details?: string;
};

const PropertyDetailsScreen = ({ route }: Props) => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const { user, openAuth } = useAuth();
  const { isSaved, toggleSaved } = useSavedProperties();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { property } = route.params;
  const galleryRef = useRef<ScrollView | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(
    property.units[0]?.id ?? property.units[0]?.unitNumber ?? null,
  );
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const selectedUnit =
    property.units.find(
      (unit) => (unit.id ?? unit.unitNumber) === selectedUnitId,
    ) ?? null;
  const publishedListing = getPublishedListing(property);
  const displayListing: PropertyListing | undefined = publishedListing
    ? {
        ...publishedListing,
        price:
          selectedUnit?.price ?? selectedUnit?.rent ?? publishedListing.price,
        billingPeriod:
          selectedUnit?.billingPeriod ?? publishedListing.billingPeriod,
      }
    : undefined;
  const galleryImages = useMemo(() => {
    const images = selectedUnit?.images.length
      ? selectedUnit.images
      : property.images;
    const sourceImages = images.length ? images : [{ url: NO_IMAGE }];

    return sourceImages.map((image, index) => ({
      url: image.url || NO_IMAGE,
      name: image.title || `Photo ${index + 1}`,
    }));
  }, [property.images, selectedUnit]);
  const specifications = useMemo(() => {
    const byTitle = new Map(
      property.specifications.map((specification) => [
        specification.title.trim().toLowerCase(),
        specification,
      ]),
    );

    selectedUnit?.specifications.forEach((specification) => {
      byTitle.set(specification.title.trim().toLowerCase(), specification);
    });

    return Array.from(byTitle.values());
  }, [property.specifications, selectedUnit]);
  const quickSpecifications = useMemo(() => {
    const prioritized = QUICK_SPECIFICATION_PRIORITY.map((title) =>
      specifications.find(
        (specification) => specification.title.trim().toLowerCase() === title,
      ),
    ).filter((specification) => specification && specification.value.trim());
    const selected = [...prioritized];

    for (const specification of specifications) {
      if (selected.length >= 4) break;
      if (
        specification.value.trim() &&
        !selected.some(
          (item) =>
            item?.title.trim().toLowerCase() ===
            specification.title.trim().toLowerCase(),
        )
      ) {
        selected.push(specification);
      }
    }

    return selected.slice(0, 4);
  }, [specifications]);
  const detailedSpecifications = specifications.filter(
    (specification) =>
      !quickSpecifications.some(
        (quickSpecification) =>
          quickSpecification?.title.trim().toLowerCase() ===
          specification.title.trim().toLowerCase(),
      ),
  );
  const policyDetails: PolicyDetail[] = [];
  const petPolicy = property.policies?.pets ?? property.policies?.petPolicy;
  const parkingPolicy =
    property.policies?.parking ?? property.policies?.parkingPolicy;

  if (petPolicy) {
    policyDetails.push({
      title: "Pets",
      value:
        petPolicy.allowed === undefined
          ? undefined
          : petPolicy.allowed
            ? "Allowed"
            : "Not allowed",
      details: petPolicy.details,
    });
  }
  if (parkingPolicy) {
    policyDetails.push({
      title: "Parking",
      value:
        parkingPolicy.allowed === undefined
          ? undefined
          : parkingPolicy.allowed
            ? "Allowed"
            : "Not allowed",
      details: parkingPolicy.details,
    });
  }
  const leasePolicy =
    property.policies?.lease ?? property.policies?.leasePolicy;
  if (leasePolicy) {
    policyDetails.push({
      title: "Lease",
      value: leasePolicy,
    });
  }
  const otherPolicies =
    property.policies?.other ?? property.policies?.otherPolicies;
  otherPolicies?.forEach((policy) => {
    policyDetails.push({
      title: policy.title || "Other",
      value: policy.body,
    });
  });
  const visiblePolicies = policyDetails.filter((policy) =>
    Boolean(policy.value?.trim() || policy.details?.trim()),
  );
  const hasLongDescription = property.description.trim().length > 180;

  const openImageModal = (image: { url: string; name: string }) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const closeImageModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  const handleToggleSaved = () => {
    if (!user) {
      openAuth();
      return;
    }
    toggleSaved(property.id);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = width;
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideSize);
    setCurrentImageIndex(index);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.galleryContainer}>
          <ScrollView
            ref={galleryRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={[styles.gallery, { width }]}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {galleryImages.map((image, index) => (
              <TouchableOpacity
                key={`${image.url}-${index}`}
                activeOpacity={0.95}
                onPress={() => openImageModal(image)}
                accessibilityLabel={`Open ${image.name}`}
              >
                <View style={[styles.galleryImageContainer, { width }]}>
                  <Image
                    source={{ uri: image.url }}
                    style={[styles.galleryImage, { width }]}
                    resizeMode="cover"
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.galleryControl,
              styles.backButton,
              { top: insets.top + 12 },
            ]}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.galleryControl,
              styles.bookmarkButton,
              { top: insets.top + 12 },
            ]}
            onPress={handleToggleSaved}
            accessibilityRole="button"
            accessibilityLabel={
              isSaved(property.id) ? "Remove saved property" : "Save property"
            }
          >
            <Ionicons
              name={isSaved(property.id) ? "bookmark" : "bookmark-outline"}
              size={22}
              color="white"
            />
          </TouchableOpacity>
          <View style={styles.galleryCaption}>
            <Text style={styles.imageName}>
              {galleryImages[currentImageIndex]?.name}
            </Text>
            <Text style={styles.photoCount}>
              {currentImageIndex + 1} / {galleryImages.length}
            </Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryTitleContainer}>
              <Text style={[styles.eyebrow, { color: colors.primary }]}>
                {publishedListing?.purpose === "sale" ? "For sale" : "For rent"}{" "}
                · {property.propertyType}
              </Text>
              <Text style={[styles.title, { color: colors.text }]}>
                {property.name}
              </Text>
            </View>
            {property.unitsAvailable > 0 && (
              <View
                style={[
                  styles.availabilityBadge,
                  { backgroundColor: colors.card },
                ]}
              >
                <View
                  style={[
                    styles.availabilityDot,
                    { backgroundColor: colors.primary },
                  ]}
                />
                <Text style={[styles.availabilityText, { color: colors.text }]}>
                  {property.unitsAvailable} available
                </Text>
              </View>
            )}
          </View>

          <View style={styles.locationRow}>
            <Ionicons
              name="location-sharp"
              size={17}
              color={colors.textMuted}
            />
            <Text style={[styles.location, { color: colors.textMuted }]}>
              {getPropertyDisplayLocation(property)}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.primary }]}>
              {displayListing
                ? getListingPriceLabel(displayListing)
                : `${formatPropertyPrice(selectedUnit?.rent ?? property.pricePerUnit)} / unit`}
            </Text>
          </View>
          {(displayListing?.serviceFee ?? property.serviceFee ?? 0) > 0 && (
            <Text style={[styles.serviceFee, { color: colors.textMuted }]}>
              Service fee:{" "}
              {formatPropertyPrice(
                displayListing?.serviceFee ?? property.serviceFee ?? 0,
              )}
            </Text>
          )}

          {property.units.length > 1 && (
            <View style={styles.unitSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Select a unit
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.unitTabsContent}
              >
                {property.units.map((unit) => {
                  const unitId = unit.id ?? unit.unitNumber;
                  const isSelected = selectedUnitId === unitId;

                  return (
                    <TouchableOpacity
                      key={unitId}
                      onPress={() => {
                        setSelectedUnitId(unitId);
                        setCurrentImageIndex(0);
                        galleryRef.current?.scrollTo({ x: 0, animated: false });
                      }}
                      style={[
                        styles.unitTab,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : colors.card,
                          borderColor: isSelected
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`Select unit ${unit.unitNumber}, ${unit.unitType}`}
                    >
                      <Text
                        style={{ color: isSelected ? "#fff" : colors.text }}
                      >
                        {unit.unitNumber} · {unit.unitType}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {quickSpecifications.length > 0 && (
            <View style={[styles.quickFacts, { borderColor: colors.border }]}>
              {quickSpecifications.map((specification) => (
                <View key={specification!.title} style={styles.quickFact}>
                  <Text
                    style={[styles.quickFactValue, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {specification!.value}
                  </Text>
                  <Text
                    style={[styles.quickFactLabel, { color: colors.textMuted }]}
                    numberOfLines={1}
                  >
                    {specification!.title}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {!!selectedUnit?.description?.trim() && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                About this unit
              </Text>
              <Text style={[styles.bodyText, { color: colors.text }]}>
                {selectedUnit.description}
              </Text>
            </View>
          )}

          {!!property.description.trim() && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                About this property
              </Text>
              <Text
                style={[styles.bodyText, { color: colors.text }]}
                numberOfLines={
                  hasLongDescription && !descriptionExpanded ? 4 : undefined
                }
              >
                {property.description}
              </Text>
              {hasLongDescription && (
                <TouchableOpacity
                  onPress={() =>
                    setDescriptionExpanded((expanded) => !expanded)
                  }
                  style={styles.inlineAction}
                  accessibilityRole="button"
                >
                  <Text
                    style={[styles.inlineActionText, { color: colors.primary }]}
                  >
                    {descriptionExpanded ? "Show less" : "Read more"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {property.features.length > 0 && (
            <View
              style={[
                styles.section,
                styles.dividedSection,
                { borderColor: colors.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Features
              </Text>
              <View style={styles.featureGrid}>
                {property.features.map((feature, index) => (
                  <View
                    key={`${feature}-${index}`}
                    style={[
                      styles.featureItem,
                      { backgroundColor: colors.card },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={17}
                      color={colors.primary}
                    />
                    <Text style={[styles.featureText, { color: colors.text }]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View
            style={[
              styles.section,
              styles.dividedSection,
              { borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Location
            </Text>
            <Text style={[styles.bodyText, { color: colors.textMuted }]}>
              {getPropertyDisplayLocation(property)}
            </Text>
            {Number.isFinite(property.location.lat) &&
              Number.isFinite(property.location.lng) &&
              (property.location.lat !== 0 || property.location.lng !== 0) && (
                <TouchableOpacity
                  style={[styles.mapButton, { borderColor: colors.border }]}
                  onPress={() =>
                    Linking.openURL(
                      `https://www.google.com/maps/search/?api=1&query=${property.location.lat},${property.location.lng}`,
                    )
                  }
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="map-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.inlineActionText, { color: colors.primary }]}
                  >
                    Open map
                  </Text>
                </TouchableOpacity>
              )}
          </View>

          {detailedSpecifications.length > 0 && (
            <View
              style={[
                styles.section,
                styles.dividedSection,
                { borderColor: colors.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {selectedUnit && property.units.length > 1
                  ? "Unit details"
                  : "Property details"}
              </Text>
              <View style={styles.specificationList}>
                {detailedSpecifications.map((specification) => (
                  <View
                    key={specification.id ?? specification.title}
                    style={[
                      styles.specificationRow,
                      { borderColor: colors.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.specificationLabel,
                        { color: colors.textMuted },
                      ]}
                    >
                      {specification.title}
                    </Text>
                    <Text
                      style={[
                        styles.specificationValue,
                        { color: colors.text },
                      ]}
                    >
                      {specification.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {visiblePolicies.length > 0 && (
            <View
              style={[
                styles.section,
                styles.dividedSection,
                { borderColor: colors.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Policies
              </Text>
              <View style={styles.specificationList}>
                {visiblePolicies.map((policy, index) => (
                  <View
                    key={`${policy!.title}-${index}`}
                    style={[
                      styles.specificationRow,
                      { borderColor: colors.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.specificationLabel,
                        { color: colors.textMuted },
                      ]}
                    >
                      {policy!.title}
                    </Text>
                    <Text
                      style={[
                        styles.specificationValue,
                        { color: colors.text },
                      ]}
                    >
                      {[policy!.value, policy!.details]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View
        style={[
          styles.actionBar,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        {property.ownerId ? (
          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: colors.primary }]}
            onPress={() =>
              navigation.navigate("Lister Profile", {
                userId: String(property.ownerId),
              })
            }
            accessibilityRole="button"
          >
            <Ionicons name="person-circle-outline" size={21} color="white" />
            <Text style={styles.contactButtonText}>View lister</Text>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </TouchableOpacity>
        ) : (
          <View
            style={[
              styles.contactUnavailable,
              { backgroundColor: colors.card },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.textMuted}
            />
            <Text
              style={[
                styles.contactUnavailableText,
                { color: colors.textMuted },
              ]}
            >
              Lister profile unavailable
            </Text>
          </View>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={[styles.closeButton, { top: insets.top + 16 }]}
            onPress={closeImageModal}
            accessibilityRole="button"
            accessibilityLabel="Close image"
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          {selectedImage && (
            <View style={styles.modalContent}>
              <Image
                source={{ uri: selectedImage.url || NO_IMAGE }}
                style={styles.modalImage}
              />
              <Text style={styles.modalImageName}>{selectedImage.name}</Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gallery: {
    height: 300,
  },
  galleryImageContainer: {
    height: 300,
  },
  galleryImage: {
    height: 300,
  },
  imageName: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 28,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  galleryContainer: {
    position: "relative",
    height: 300,
  },
  galleryControl: {
    position: "absolute",
    zIndex: 2,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    left: 16,
  },
  bookmarkButton: {
    right: 16,
  },
  galleryCaption: {
    position: "absolute",
    bottom: 14,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  photoCount: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryTitleContainer: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 6,
    marginTop: 2,
  },
  availabilityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    lineHeight: 31,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    marginTop: 10,
  },
  location: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 7,
    marginTop: 18,
  },
  price: {
    fontSize: 27,
    fontWeight: "700",
  },
  priceUnit: {
    fontSize: 14,
  },
  serviceFee: {
    fontSize: 13,
    marginTop: 4,
  },
  unitSection: {
    marginTop: 22,
  },
  unitTabsContent: {
    gap: 9,
    paddingBottom: 2,
  },
  unitTab: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  quickFacts: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginTop: 22,
    paddingVertical: 15,
    gap: 8,
  },
  quickFact: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: 4,
  },
  quickFactValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  quickFactLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  section: {
    marginTop: 25,
  },
  dividedSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 21,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 23,
  },
  inlineAction: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  inlineActionText: {
    fontSize: 14,
    fontWeight: "700",
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: "100%",
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 6,
  },
  featureText: {
    flexShrink: 1,
    fontSize: 13,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 7,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 12,
  },
  specificationList: {
    gap: 0,
  },
  specificationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 11,
  },
  specificationLabel: {
    flex: 1,
    fontSize: 14,
  },
  specificationValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
  },
  actionBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 11,
  },
  contactButton: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 6,
    paddingHorizontal: 16,
  },
  contactButtonText: {
    flex: 1,
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  contactUnavailable: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  contactUnavailableText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.94)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    right: 20,
    zIndex: 1,
  },
  modalContent: {
    width: "100%",
    height: "80%",
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: "80%",
    resizeMode: "contain",
  },
  modalImageName: {
    color: "white",
    fontSize: 16,
    marginTop: 15,
  },
});

export default PropertyDetailsScreen;
