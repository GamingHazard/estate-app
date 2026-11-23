import React, {
  useEffect,
  useRef,
  useSyncExternalStore,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { useAuth } from "../../auth/AuthContext";
import {
  apiRequest,
  getErrorMessage,
  getQueryFn,
} from "../../../shared/queryClient";
import {
  AdminProperty,
  adaptAdminPropertyForMarketplace,
  adminPropertyStore,
} from "../../../data/adminPropertyStore";
import {
  getListingPriceLabel,
  getPropertyDisplayLocation,
  MarketplacePropertyRecord,
  parsePropertyListResponse,
  Property,
} from "../../../data/property";
import {
  PropertySource,
  RootStackParamList,
} from "../../../shared/types/navigation";

type Props = {
  propertyId: string;
  propertySource?: PropertySource;
  propertySnapshot?: Property | AdminProperty;
};

const isLegacyAdminProperty = (
  property: Property | AdminProperty | undefined,
  source: PropertySource,
): property is AdminProperty =>
  source === "local" && property !== undefined && "price_per_unit" in property;

export function MarketplacePropertyDetails({
  propertyId,
  propertySource,
  propertySnapshot,
}: Props) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const localProperties = useSyncExternalStore(
    adminPropertyStore.subscribe,
    adminPropertyStore.getSnapshot,
    adminPropertyStore.getSnapshot,
  );
  const marketplaceProperties = useSyncExternalStore(
    adminPropertyStore.subscribeMarketplace,
    adminPropertyStore.getMarketplaceSnapshot,
    adminPropertyStore.getMarketplaceSnapshot,
  );
  const legacyProperty = localProperties.find((item) => item.id === propertyId);
  const cachedMarketplaceProperty = marketplaceProperties.find(
    (item) => item.id === propertyId,
  );
  const resolvedSource =
    propertySource ??
    (cachedMarketplaceProperty
      ? "marketplace"
      : legacyProperty
        ? "local"
        : "server-marketplace");
  const localProperty =
    resolvedSource === "local"
      ? legacyProperty
        ? adaptAdminPropertyForMarketplace(legacyProperty)
        : undefined
      : resolvedSource === "marketplace"
        ? cachedMarketplaceProperty
        : undefined;
  const snapshotProperty = isLegacyAdminProperty(
    propertySnapshot,
    resolvedSource,
  )
    ? adaptAdminPropertyForMarketplace(propertySnapshot)
    : propertySnapshot;
  const serverQuery = useQuery({
    queryKey: ["properties", "marketplace", "manage"],
    queryFn: getQueryFn({ on401: "throw", authenticated: true }),
    enabled: resolvedSource === "server-marketplace",
    select: (response: unknown) =>
      parsePropertyListResponse(response).properties,
  });
  const serverProperty = serverQuery.data?.find(
    (item) => item.id === propertyId,
  );
  const property =
    resolvedSource === "server-marketplace"
      ? (serverProperty ?? snapshotProperty)
      : (localProperty ?? snapshotProperty);
  const [draft, setDraft] = useState<
    MarketplacePropertyRecord | Property | null
  >(property ?? null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteCountdown, setDeleteCountdown] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (property) setDraft(property);
  }, [property]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [propertyId]);

  useEffect(
    () => () => {
      if (deleteTimer.current) clearTimeout(deleteTimer.current);
    },
    [],
  );

  const clearDeleteTimer = () => {
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
    deleteTimer.current = null;
  };
  const cancelDeletion = () => {
    clearDeleteTimer();
    setDeleteCountdown(null);
    setDeletePassword("");
    setDeleteError("");
    setDeleteDialogVisible(false);
  };

  if (!property || !draft) {
    if (serverQuery.isLoading && !propertySnapshot) return null;
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, padding: 20 },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          {serverQuery.isError ? "Unable to load listing" : "Listing not found"}
        </Text>
        <Text style={[styles.muted, { color: colors.textMuted }]}>
          {serverQuery.isError
            ? getErrorMessage(
                serverQuery.error,
                "Unable to load this property profile. Please try again.",
              )
            : "This property listing may have been removed or is no longer available."}
        </Text>
        {serverQuery.isError && (
          <Pressable onPress={() => void serverQuery.refetch()}>
            <Text style={[styles.muted, { color: colors.primary }]}>
              Try again
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  const listing = draft.listings[0];
  const isLocalProperty = resolvedSource !== "server-marketplace";
  const canManage =
    isLocalProperty || ["admin", "propertyManager"].includes(user?.role ?? "");
  const updateModeration = (
    status: NonNullable<MarketplacePropertyRecord["moderationStatus"]>,
  ) => {
    void (async () => {
      try {
        if (resolvedSource === "local") {
          adminPropertyStore.updateStatus(
            draft.id,
            status === "approved" ? "active" : status,
          );
        } else if (resolvedSource === "marketplace") {
          adminPropertyStore.updateMarketplaceModeration(draft.id, status);
        } else {
          await apiRequest(
            "PATCH",
            `/properties/marketplace/${draft.id}/moderation`,
            { status },
          );
          await queryClient.invalidateQueries({
            queryKey: ["properties", "marketplace", "manage"],
          });
          await queryClient.invalidateQueries({ queryKey: ["properties"] });
        }
      } catch (error) {
        Alert.alert(
          "Moderation failed",
          getErrorMessage(error, "Unable to update status. Please try again."),
        );
      }
    })();
  };
  const editProperty = () => {
    const snapshot =
      resolvedSource === "local" ? (legacyProperty ?? propertySnapshot) : draft;
    if (!snapshot) {
      Alert.alert("Unable to edit", "The property data is unavailable.");
      return;
    }
    navigation.navigate("PropertyCreation", {
      mode: "edit",
      propertyId: draft.id,
      propertySource: resolvedSource,
      propertySnapshot: snapshot,
    });
  };
  const completeDeletion = async (password: string) => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      if (resolvedSource === "server-marketplace") {
        await apiRequest("DELETE", `/properties/marketplace/${draft.id}`, {
          currentPassword: password,
        });
      } else {
        await apiRequest("POST", "/users/me/verify-password", {
          currentPassword: password,
        });
        if (resolvedSource === "marketplace") {
          adminPropertyStore.removeMarketplace(draft.id);
        } else {
          adminPropertyStore.remove(draft.id);
        }
      }

      await queryClient.invalidateQueries({
        queryKey: ["properties", "marketplace", "manage"],
      });
      await queryClient.invalidateQueries({ queryKey: ["properties"] });
      cancelDeletion();
      navigation.goBack();
      Alert.alert("Property deleted", "The property has been removed.");
    } catch (error) {
      clearDeleteTimer();
      setDeleteCountdown(null);
      setDeletePassword("");
      setDeleteError(
        getErrorMessage(
          error,
          "Unable to delete this property. Please try again.",
        ),
      );
    } finally {
      setIsDeleting(false);
    }
  };
  const startDeleteCountdown = () => {
    if (!deletePassword) {
      setDeleteError("Enter your current password to continue.");
      return;
    }

    clearDeleteTimer();
    setDeleteError("");
    setDeleteCountdown(5);
    let remaining = 5;
    const tick = () => {
      remaining -= 1;
      if (remaining === 0) {
        deleteTimer.current = null;
        setDeleteCountdown(0);
        void completeDeletion(deletePassword);
        return;
      }
      setDeleteCountdown(remaining);
      deleteTimer.current = setTimeout(tick, 1000);
    };
    deleteTimer.current = setTimeout(tick, 1000);
  };

  const images = (draft.images ?? []).filter((image) => Boolean(image.url));
  const selectedImage = images[selectedImageIndex] ?? images[0];
  const specifications = (draft.specifications ?? []).filter(
    (specification) =>
      specification.title?.trim() || specification.value?.trim(),
  );
  const features = (draft.features ?? []).filter(
    (feature) => typeof feature === "string" && feature.trim(),
  );
  const policies = draft.policies ?? {};
  const petPolicy = policies.pets ?? policies.petPolicy;
  const parkingPolicy = policies.parking ?? policies.parkingPolicy;
  const leasePolicy = policies.lease ?? policies.leasePolicy;
  const otherPolicies = policies.other ?? policies.otherPolicies ?? [];
  const hasPolicies = Boolean(
    petPolicy || parkingPolicy || leasePolicy || otherPolicies.length,
  );
  const coordinates =
    draft.location &&
    Number.isFinite(draft.location.lat) &&
    Number.isFinite(draft.location.lng) &&
    (draft.location.lat !== 0 || draft.location.lng !== 0)
      ? `${draft.location.lat.toFixed(5)}, ${draft.location.lng.toFixed(5)}`
      : "Not provided";
  const renderSection = (
    title: string,
    icon: React.ComponentProps<typeof Ionicons>["name"],
    content: React.ReactNode,
  ) => (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {title}
        </Text>
      </View>
      {content}
    </View>
  );
  const renderDetail = (label: string, value: string) => (
    <View
      key={label}
      style={[styles.detailRow, { borderBottomColor: colors.border }]}
    >
      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
        {label}
      </Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
  const renderPolicy = (
    label: string,
    policy: { allowed?: boolean; details?: string } | undefined,
    positiveLabel: string,
    negativeLabel: string,
  ) => (
    <View key={label} style={styles.policyBlock}>
      {renderDetail(
        label,
        policy?.allowed === undefined
          ? "Not specified"
          : policy.allowed
            ? positiveLabel
            : negativeLabel,
      )}
      {policy?.details?.trim() ? (
        <Text style={[styles.policyDetails, { color: colors.textMuted }]}>
          {policy.details.trim()}
        </Text>
      ) : null}
    </View>
  );

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>
            Property details
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        {canManage && (
          <View style={styles.detailActions}>
            <Pressable
              style={[styles.detailAction, { borderColor: colors.border }]}
              onPress={editProperty}
              accessibilityRole="button"
            >
              <MaterialIcons name="edit" size={18} color={colors.primary} />
              <Text style={[styles.editText, { color: colors.text }]}>
                Edit Property
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.detailAction,
                styles.deleteAction,
                { borderColor: colors.destructive },
              ]}
              onPress={() => {
                setDeleteError("");
                setDeleteDialogVisible(true);
              }}
              accessibilityRole="button"
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color={colors.destructive}
              />
              <Text style={[styles.editText, { color: colors.destructive }]}>
                Delete Property
              </Text>
            </Pressable>
          </View>
        )}

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage.url }}
              style={styles.hero}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.heroPlaceholder,
                { backgroundColor: colors.background },
              ]}
            >
              <Ionicons
                name="image-outline"
                size={38}
                color={colors.textMuted}
              />
              <Text style={[styles.muted, { color: colors.textMuted }]}>
                No property images added
              </Text>
            </View>
          )}
          {images.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailList}
            >
              {images.map((image, index) => (
                <Pressable
                  key={image.id ?? `${image.url}-${index}`}
                  style={[
                    styles.thumbnailButton,
                    { borderColor: colors.border },
                    selectedImageIndex === index && {
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setSelectedImageIndex(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`View property image ${index + 1}`}
                  accessibilityState={{
                    selected: selectedImageIndex === index,
                  }}
                >
                  <Image
                    source={{ uri: image.url }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>
              {listing.purpose.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.heading, { color: colors.text }]}>
            {draft.name}
          </Text>
          <View style={styles.propertyTypeTags}>
            {[draft.category, draft.propertyType].filter(Boolean).map((tag) => (
              <View
                key={tag}
                style={[
                  styles.propertyTypeTag,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text style={[styles.tagText, { color: colors.textMuted }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
          <Text style={[styles.price, { color: colors.primary }]}>
            {getListingPriceLabel(listing)}
          </Text>
          <Text style={[styles.muted, { color: colors.textMuted }]}>
            {draft.description || "No description provided."}
          </Text>
        </View>

        {renderSection(
          "Address",
          "home-outline",
          <>
            {renderDetail("Street address", draft.address || "Not provided")}
            {renderDetail(
              "Estate / neighborhood",
              draft.estate || "Not provided",
            )}
            {renderDetail("City", draft.city || "Not provided")}
            {renderDetail("Country", draft.country || "Not provided")}
          </>,
        )}

        {renderSection(
          "Location",
          "location-outline",
          <>
            {renderDetail(
              "Area",
              [draft.estate, draft.city, draft.country]
                .filter(Boolean)
                .filter(
                  (value, index, values) => values.indexOf(value) === index,
                )
                .join(", ") || "Not provided",
            )}
            {renderDetail("Coordinates", coordinates)}
          </>,
        )}

        {renderSection(
          "Listing details",
          "pricetag-outline",
          <>
            {renderDetail(
              "Purpose",
              listing.purpose === "rent" ? "For rent" : "For sale",
            )}
            {renderDetail("Price", getListingPriceLabel(listing))}
            {renderDetail(
              "Billing period",
              listing.billingPeriod?.replace("-", " ") || "Not specified",
            )}
            {renderDetail(
              "Service fee",
              listing.serviceFee == null
                ? "Not specified"
                : `${listing.currency} ${listing.serviceFee.toLocaleString("en-US")}`,
            )}
            {renderDetail("Negotiable", listing.negotiable ? "Yes" : "No")}
            {renderDetail(
              "Available from",
              listing.availableFrom || "Not specified",
            )}
            {renderDetail("Listing visibility", listing.status)}
            {renderDetail(
              "Units available",
              String(draft.unitsAvailable ?? draft.units.length),
            )}
          </>,
        )}

        {renderSection(
          "Features & amenities",
          "sparkles-outline",
          features.length ? (
            <View style={styles.featureList}>
              {features.map((feature, index) => (
                <View
                  key={`${feature}-${index}`}
                  style={[
                    styles.featureChip,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.featureText, { color: colors.text }]}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.muted, { color: colors.textMuted }]}>
              No features or amenities have been added.
            </Text>
          ),
        )}

        {renderSection(
          "Specifications",
          "options-outline",
          specifications.length ? (
            specifications.map((specification, index) =>
              renderDetail(
                specification.title?.trim() || `Specification ${index + 1}`,
                specification.value?.trim() || "Not provided",
              ),
            )
          ) : (
            <Text style={[styles.muted, { color: colors.textMuted }]}>
              No specifications have been provided.
            </Text>
          ),
        )}

        {renderSection(
          "Policies",
          "document-text-outline",
          hasPolicies ? (
            <>
              {renderPolicy("Pets", petPolicy, "Allowed", "Not allowed")}
              {renderPolicy(
                "Parking",
                parkingPolicy,
                "Available",
                "Not available",
              )}
              {renderDetail("Lease", leasePolicy?.trim() || "Not specified")}
              {otherPolicies.map((policy, index) => (
                <View
                  key={`${policy.title ?? "policy"}-${index}`}
                  style={styles.policyBlock}
                >
                  {renderDetail(
                    policy.title?.trim() || `Other policy ${index + 1}`,
                    policy.body?.trim() || "Details not provided",
                  )}
                </View>
              ))}
            </>
          ) : (
            <Text style={[styles.muted, { color: colors.textMuted }]}>
              No policies have been provided.
            </Text>
          ),
        )}

        {renderSection(
          "Units",
          "business-outline",
          draft.units.length ? (
            draft.units.map((unit, index) => {
              const unitPrice =
                typeof unit.price === "number" && unit.price > 0
                  ? unit.price
                  : unit.rent;

              return (
                <View
                  key={unit.id ?? unit.unitNumber ?? index}
                  style={[
                    styles.unit,
                    { borderTopColor: colors.border },
                    index === 0 && styles.firstUnit,
                  ]}
                >
                  <View style={styles.unitHeading}>
                    <Text style={[styles.value, { color: colors.text }]}>
                      {unit.unitNumber || `Unit ${index + 1}`}
                      {unit.unitType ? ` · ${unit.unitType}` : ""}
                    </Text>
                    <Text
                      style={[
                        styles.availability,
                        {
                          color: unit.isAvailable
                            ? colors.primary
                            : colors.textMuted,
                        },
                      ]}
                    >
                      {unit.isAvailable ? "Available" : "Unavailable"}
                    </Text>
                  </View>
                  {unit.description ? (
                    <Text style={[styles.muted, { color: colors.textMuted }]}>
                      {unit.description}
                    </Text>
                  ) : null}
                  {renderDetail(
                    "Price",
                    Number.isFinite(unitPrice) && unitPrice > 0
                      ? `${unit.currency ?? listing.currency} ${unitPrice.toLocaleString("en-US")}`
                      : "Not specified",
                  )}
                  {unit.specifications?.map(
                    (specification, specificationIndex) => (
                      <Text
                        key={`${specification.title}-${specificationIndex}`}
                        style={[
                          styles.unitSpecification,
                          { color: colors.textMuted },
                        ]}
                      >
                        {specification.title}: {specification.value}
                      </Text>
                    ),
                  )}
                </View>
              );
            })
          ) : (
            <Text style={[styles.muted, { color: colors.textMuted }]}>
              No separate units have been added.
            </Text>
          ),
        )}

        {renderSection(
          "Moderation & management",
          "shield-checkmark-outline",
          <>
            <View style={styles.statusRow}>
              <Text style={[styles.muted, { color: colors.textMuted }]}>
                Moderation
              </Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {draft.moderationStatus ?? "pending"}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={[styles.muted, { color: colors.textMuted }]}>
                Visibility
              </Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {listing.status}
              </Text>
            </View>
            {canManage && (
              <View style={styles.actions}>
                <Pressable
                  style={[styles.action, { backgroundColor: colors.primary }]}
                  onPress={() => updateModeration("approved")}
                >
                  <Text style={styles.actionText}>Approve</Text>
                </Pressable>
                <Pressable
                  style={[styles.action, { backgroundColor: colors.warning }]}
                  onPress={() => updateModeration("pending")}
                >
                  <Text style={styles.actionText}>Pending</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.action,
                    { backgroundColor: colors.destructive },
                  ]}
                  onPress={() => updateModeration("rejected")}
                >
                  <Text style={styles.actionText}>Reject</Text>
                </Pressable>
              </View>
            )}

            <View style={{ width: "100%", height: 70 }} />
          </>,
        )}
      </ScrollView>
      <Modal
        visible={deleteDialogVisible}
        transparent
        animationType="fade"
        statusBarTranslucent={false}
        onRequestClose={() => {
          if (!isDeleting) cancelDeletion();
        }}
      >
        <View style={styles.dialogBackdrop}>
          <View
            style={[
              styles.dialog,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.dialogHeading}>
              <Ionicons
                name="warning-outline"
                size={24}
                color={colors.destructive}
              />
              <Text style={[styles.dialogTitle, { color: colors.text }]}>
                Delete property?
              </Text>
            </View>
            <Text style={[styles.dialogCopy, { color: colors.textMuted }]}>
              Enter your current password to confirm. A five-second countdown
              starts next, and you can cancel it before deletion.
            </Text>
            <TextInput
              style={[
                styles.passwordInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              value={deletePassword}
              onChangeText={setDeletePassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={deleteCountdown === null && !isDeleting}
              placeholder="Current password"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Current password"
            />
            {deleteCountdown !== null && (
              <Text style={[styles.countdown, { color: colors.destructive }]}>
                {isDeleting
                  ? "Deleting property..."
                  : `Deleting in ${deleteCountdown} seconds`}
              </Text>
            )}
            {deleteError ? (
              <Text style={[styles.deleteError, { color: colors.destructive }]}>
                {deleteError}
              </Text>
            ) : null}
            <View style={styles.dialogActions}>
              <Pressable
                style={[styles.dialogButton, { borderColor: colors.border }]}
                onPress={cancelDeletion}
                disabled={isDeleting}
              >
                <Text style={[styles.dialogButtonText, { color: colors.text }]}>
                  {deleteCountdown === null ? "Cancel" : "Cancel deletion"}
                </Text>
              </Pressable>
              {deleteCountdown === null ? (
                <Pressable
                  style={[
                    styles.dialogButton,
                    { backgroundColor: colors.destructive },
                  ]}
                  onPress={startDeleteCountdown}
                  disabled={isDeleting}
                >
                  <Text style={styles.confirmDeleteText}>Continue</Text>
                </Pressable>
              ) : (
                <View
                  style={[
                    styles.dialogButton,
                    styles.countdownButton,
                    { backgroundColor: colors.destructive },
                  ]}
                >
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.confirmDeleteText}>
                    {isDeleting ? "Deleting..." : "Please wait"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerSpacer: { width: 24 },
  detailActions: { flexDirection: "row", gap: 10, marginBottom: 14 },
  detailAction: {
    flex: 1,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 8,
  },
  deleteAction: { backgroundColor: "transparent" },
  title: { fontSize: 21, fontWeight: "800" },
  card: { borderWidth: 1, borderRadius: 10, padding: 16, marginBottom: 14 },
  hero: { width: "100%", height: 230, borderRadius: 8 },
  heroPlaceholder: {
    height: 230,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnailList: { gap: 9, paddingTop: 12, paddingBottom: 2 },
  thumbnailButton: {
    width: 70,
    height: 70,
    borderRadius: 9,
    borderWidth: 2,
    padding: 2,
    overflow: "hidden",
  },
  thumbnail: { width: "100%", height: "100%", borderRadius: 6 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#3478F6",
    borderRadius: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  badgeText: { color: "white", fontSize: 11, fontWeight: "800" },
  heading: { fontSize: 23, fontWeight: "800", marginTop: 10 },
  propertyTypeTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  propertyTypeTag: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: { fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 17, fontWeight: "800" },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  detailLabel: { flex: 0.8, fontSize: 13, lineHeight: 19 },
  detailValue: {
    flex: 1.2,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    textAlign: "right",
  },
  muted: { fontSize: 14, lineHeight: 21, marginTop: 6 },
  price: { fontSize: 22, fontWeight: "800", marginTop: 14 },
  featureList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  featureChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  featureText: { fontSize: 13, fontWeight: "600" },
  policyBlock: { marginBottom: 2 },
  policyDetails: { fontSize: 13, lineHeight: 19, paddingBottom: 8 },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
  },
  value: { fontSize: 15, fontWeight: "600" },
  unitHeading: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  availability: { fontSize: 12, fontWeight: "700" },
  unitSpecification: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  actions: { flexDirection: "row", gap: 8, marginTop: 10 },
  action: {
    flex: 1,
    alignItems: "center",
    borderRadius: 7,
    paddingVertical: 10,
  },
  actionText: { color: "white", fontWeight: "800" },
  editText: { fontWeight: "700" },
  unit: { borderTopWidth: 1, marginTop: 12, paddingTop: 12 },
  firstUnit: { borderTopWidth: 0, marginTop: 0, paddingTop: 0 },
  dialogBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  dialog: {
    width: "100%",
    maxWidth: 420,
    padding: 20,
    borderWidth: 1,
    borderRadius: 14,
  },
  dialogHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 8,
  },
  dialogTitle: { fontSize: 18, fontWeight: "800" },
  dialogCopy: { fontSize: 14, lineHeight: 21, marginBottom: 14 },
  passwordInput: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  countdown: { fontSize: 14, fontWeight: "700", marginVertical: 6 },
  deleteError: { fontSize: 13, lineHeight: 19, marginVertical: 6 },
  dialogActions: { flexDirection: "row", gap: 10, marginTop: 12 },
  dialogButton: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  countdownButton: { flexDirection: "row", gap: 8 },
  dialogButtonText: { fontSize: 14, fontWeight: "700", textAlign: "center" },
  confirmDeleteText: { color: "white", fontSize: 14, fontWeight: "800" },
});
