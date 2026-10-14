import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiRequest, getQueryFn } from "../../shared/queryClient";
import { useTheme } from "../../shared/theme/ThemeContext";
import { NavigationProp, RootStackParamList } from "../../shared/types";
import { useInternetConnection } from "../../shared/hooks/useInternetConnection";
import { getPublishedListing } from "../../data/property";
import {
  mockListerProfiles,
  PublicListerProfile,
} from "../../data/mockListerProfiles";
import { useAuth } from "../auth/AuthContext";
import { useProperties } from "./useProperties";
import { useSavedProperties } from "./SavedPropertiesContext";
import PropertyListingCard from "./PropertyListingCard";

type ReviewItem = {
  id: string;
  reviewerId: string;
  reviewedUserId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  reviewer?: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatar?: { url?: string } | null;
  } | null;
};

type PublicProfileResponse = { user: PublicListerProfile };
type ReviewListResponse = { reviews: ReviewItem[] };
type ReviewSummaryResponse = {
  summary: { averageRating: number; totalReviews: number; ratingCount: number };
};
type Props = {
  route: RouteProp<RootStackParamList, "Lister Profile">;
};

const renderStars = (rating: number, size = 16, color = "#f5b301") =>
  Array.from({ length: 5 }).map((_, index) => {
    const isFilled = index < Math.round(rating);
    return (
      <Ionicons
        key={`${rating}-${index}`}
        name={isFilled ? "star" : "star-outline"}
        size={size}
        color={isFilled ? color : "#8a8a8a"}
      />
    );
  });

const ListerProfileScreen = ({ route }: Props) => {
  const { userId } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user: signedInUser, openAuth } = useAuth();
  const { isSaved, toggleSaved } = useSavedProperties();
  const [draftRating, setDraftRating] = React.useState(5);
  const [draftComment, setDraftComment] = React.useState("");
  const [editingReviewId, setEditingReviewId] = React.useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = React.useState(false);
  const {
    data: properties = [],
    isLoading: propertiesLoading,
    isError: propertiesError,
    refetch: refetchProperties,
  } = useProperties();
  const isConnected = useInternetConnection();
  const useMockProperties =
    process.env.EXPO_PUBLIC_USE_MOCK_PROPERTIES === "true";
  const {
    data: profileResponse,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["users", userId, "public"],
    queryFn: getQueryFn<PublicProfileResponse>({ on401: "throw" }),
    enabled: Boolean(userId) && !useMockProperties,
  });
  const {
    data: reviewResponse,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ["users", userId, "reviews"],
    queryFn: getQueryFn<ReviewListResponse>({ on401: "returnNull" }),
    enabled: Boolean(userId),
  });
  const {
    data: reviewSummaryResponse,
    refetch: refetchReviewSummary,
  } = useQuery({
    queryKey: ["users", userId, "reviews", "summary"],
    queryFn: getQueryFn<ReviewSummaryResponse>({ on401: "returnNull" }),
    enabled: Boolean(userId),
  });
  const lister = useMockProperties
    ? mockListerProfiles.find((profile) => profile.id === userId)
    : profileResponse?.user;
  const listerProperties = properties.filter(
    (property) =>
      property.ownerId === userId &&
      getPublishedListing(property)?.status === "published",
  );
  const reviews = reviewResponse?.reviews ?? [];
  const summary =
    reviewSummaryResponse?.summary ??
    ({
      averageRating: lister?.averageRating ?? 0,
      totalReviews: lister?.totalReviews ?? reviews.length,
      ratingCount: lister?.ratingCount ?? reviews.length,
    } as ReviewSummaryResponse["summary"]);
  const isLoading = profileLoading || propertiesLoading;
  const canCreateReview = Boolean(signedInUser && signedInUser.id !== userId);

  const refreshReviews = async () => {
    await Promise.all([refetchReviews(), refetchReviewSummary()]);
  };

  const handleSubmitReview = async () => {
    if (!signedInUser) {
      openAuth();
      return;
    }

    if (!draftComment.trim() && !draftRating) {
      return;
    }

    setIsSubmittingReview(true);
    try {
      const payload = {
        reviewedUserId: userId,
        rating: draftRating,
        comment: draftComment.trim(),
      };

      if (editingReviewId) {
        await apiRequest("PATCH", `/reviews/${editingReviewId}`, payload);
      } else {
        await apiRequest("POST", "/reviews", payload);
      }

      setDraftComment("");
      setDraftRating(5);
      setEditingReviewId(null);
      await refreshReviews();
    } catch (error: any) {
      Alert.alert(
        editingReviewId ? "Unable to update review" : "Unable to submit review",
        error?.message || "Please try again.",
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    Alert.alert("Delete review", "This review will be removed permanently.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await apiRequest("DELETE", `/reviews/${reviewId}`);
            await refreshReviews();
          } catch (error: any) {
            Alert.alert("Delete failed", error?.message || "Please try again.");
          }
        },
      },
    ]);
  };

  const startEditingReview = (review: ReviewItem) => {
    setDraftRating(review.rating);
    setDraftComment(review.comment);
    setEditingReviewId(review.id);
  };

  const handleContact = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      // The device may not have a handler for the requested contact action.
    }
  };

  const handleToggleSaved = (propertyId: string) => {
    if (!signedInUser) {
      openAuth();
      return;
    }
    toggleSaved(propertyId);
  };

  const roleLabel =
    lister?.role === "propertyManager" ? "Property manager" : "Landlord";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={listerProperties}
        keyExtractor={(property) => property.id}
        renderItem={({ item }) => (
          <PropertyListingCard
            property={item}
            saved={isSaved(item.id)}
            onPress={() =>
              navigation.navigate("PropertyDetails", { property: item })
            }
            onToggleSaved={() => handleToggleSaved(item.id)}
          />
        )}
        ListHeaderComponent={
          <>
            {isLoading ? (
              <View style={styles.state}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : !lister || profileError ? (
              <View style={styles.state}>
                <Ionicons
                  name="person-circle-outline"
                  size={42}
                  color={colors.textMuted}
                />
                <Text style={[styles.stateTitle, { color: colors.text }]}>
                  Lister profile unavailable
                </Text>
                <Text style={[styles.stateCopy, { color: colors.textMuted }]}>
                  {!isConnected
                    ? "You are offline. Reconnect and try again."
                    : "This profile could not be loaded. Please try again."}
                </Text>
                {isConnected && (
                  <TouchableOpacity
                    style={[
                      styles.retryButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={() => void refetchProfile()}
                    accessibilityRole="button"
                  >
                    <Text style={styles.retryText}>Try again</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <>
                <View
                  style={[
                    styles.profileHeader,
                    {
                      borderColor: colors.border,
                      flexDirection: "row",
                      width: "100%",
                      justifyContent: "space-between",
                      paddingHorizontal: 16,
                      alignItems: "center",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.avatarWrap,
                      { backgroundColor: colors.card },
                    ]}
                  >
                    {lister.avatar?.url ? (
                      <Image
                        source={{ uri: lister.avatar.url }}
                        style={styles.avatar}
                      />
                    ) : (
                      <Ionicons
                        name="person-outline"
                        size={38}
                        color={colors.textMuted}
                      />
                    )}
                  </View>
                  <View
                    style={styles.profileInfo}
                  >
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
                      {lister.firstName} {lister.lastName}
                    </Text>
                    <Text style={[styles.role, { color: colors.primary }]}>
                      {roleLabel}
                    </Text>
                    <Text
                      style={[styles.listingCount, { color: colors.textMuted }]}
                    >
                      {listerProperties.length} active{" "}
                      {listerProperties.length === 1 ? "listing" : "listings"}
                    </Text>
                    <View
                      accessibilityLabel={`${summary.averageRating.toFixed(1)} out of 5 stars, ${summary.totalReviews} reviews`}
                      style={styles.profileRating}
                    >
                      {summary.totalReviews > 0 ? (
                        <>
                          <View style={styles.profileStars}>
                            {renderStars(summary.averageRating, 14)}
                          </View>
                          <Text style={[styles.profileRatingValue, { color: colors.text }]}>
                            {summary.averageRating.toFixed(1)}
                          </Text>
                          <Text style={[styles.profileRatingCount, { color: colors.textMuted }]}>
                            ({summary.totalReviews})
                          </Text>
                        </>
                      ) : (
                        <Text style={[styles.profileRatingCount, { color: colors.textMuted }]}>
                          No reviews yet
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                {lister.bio.trim().length > 0 && (
                  <View
                    style={[styles.section, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      About
                    </Text>
                    <Text style={[styles.bio, { color: colors.textMuted }]}>
                      {lister.bio}
                    </Text>
                  </View>
                )}

                <View style={[styles.section, { borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Reviews
                  </Text>

                  {canCreateReview && (
                    <View
                      style={[
                        styles.reviewComposer,
                        { backgroundColor: colors.card },
                      ]}
                    >
                      <Text style={[styles.reviewComposerTitle, { color: colors.text }]}>
                        {editingReviewId ? "Edit your review" : "Leave a review"}
                      </Text>

                      <View style={styles.starSelector}>
                        {Array.from({ length: 5 }).map((_, index) => {
                          const value = index + 1;
                          const active = value <= draftRating;

                          return (
                            <TouchableOpacity
                              key={value}
                              onPress={() => setDraftRating(value)}
                              accessibilityRole="button"
                              accessibilityLabel={`Rate ${value} out of 5`}
                            >
                              <Ionicons
                                name={active ? "star" : "star-outline"}
                                size={28}
                                color={active ? "#f5b301" : colors.textMuted}
                              />
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      <TextInput
                        value={draftComment}
                        onChangeText={setDraftComment}
                        placeholder="Share your experience with this lister"
                        placeholderTextColor={colors.textMuted}
                        multiline
                        style={[
                          styles.reviewInput,
                          {
                            backgroundColor: colors.background,
                            color: colors.text,
                            borderColor: colors.border,
                          },
                        ]}
                      />

                      <TouchableOpacity
                        style={[
                          styles.submitReviewButton,
                          {
                            backgroundColor: colors.primary,
                            opacity: isSubmittingReview ? 0.7 : 1,
                          },
                        ]}
                        onPress={() => void handleSubmitReview()}
                        disabled={isSubmittingReview}
                      >
                        <Text style={styles.submitReviewText}>
                          {isSubmittingReview
                            ? "Submitting..."
                            : editingReviewId
                              ? "Save changes"
                              : "Submit review"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {reviews.length > 0 ? (
                    reviews.map((review) => {
                      const isOwnReview = signedInUser?.id === review.reviewerId;

                      return (
                        <View
                          key={review.id}
                          style={[
                            styles.reviewCard,
                            { backgroundColor: colors.card, borderColor: colors.border },
                          ]}
                        >
                          <View style={styles.reviewHeaderRow}>
                            <View style={styles.reviewAuthorRow}>
                              {review.reviewer?.avatar?.url ? (
                                <Image
                                  source={{ uri: review.reviewer.avatar.url }}
                                  style={styles.reviewAvatar}
                                />
                              ) : (
                                <View
                                  style={[
                                    styles.reviewAvatar,
                                    { backgroundColor: colors.background },
                                  ]}
                                >
                                  <Ionicons
                                    name="person-outline"
                                    size={14}
                                    color={colors.textMuted}
                                  />
                                </View>
                              )}
                              <View>
                                <Text style={[styles.reviewAuthor, { color: colors.text }]}>
                                  {review.reviewer
                                    ? `${review.reviewer.firstName || ""} ${review.reviewer.lastName || ""}`.trim() || "Guest reviewer"
                                    : "Guest reviewer"}
                                </Text>
                                <Text style={[styles.reviewDate, { color: colors.textMuted }]}>
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </Text>
                              </View>
                            </View>

                            {isOwnReview && (
                              <View style={styles.reviewActions}>
                                <TouchableOpacity
                                  onPress={() => startEditingReview(review)}
                                  accessibilityRole="button"
                                >
                                  <Text style={[styles.inlineActionText, { color: colors.primary }]}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => void handleDeleteReview(review.id)}
                                  accessibilityRole="button"
                                >
                                  <Text style={[styles.inlineActionText, { color: "#ef4444" }]}>Delete</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>

                          <View style={styles.starRow}>{renderStars(review.rating, 14)}</View>
                          {review.comment ? (
                            <Text style={[styles.reviewComment, { color: colors.textMuted }]}>
                              {review.comment}
                            </Text>
                          ) : null}
                        </View>
                      );
                    })
                  ) : (
                    <View
                      style={[
                        styles.reviewPlaceholder,
                        { backgroundColor: colors.card },
                      ]}
                    >
                      <Ionicons
                        name="star-outline"
                        size={20}
                        color={colors.textMuted}
                      />
                      <Text style={[styles.reviewCopy, { color: colors.textMuted }]}>
                        No reviews yet. Be the first to leave one.
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.listingsHeading}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Active listings
                  </Text>
                </View>
              </>
            )}
          </>
        }
        ListEmptyComponent={
          !isLoading && lister && propertiesError ? (
            <View style={styles.listingError}>
              <Text style={[styles.emptyListings, { color: colors.textMuted }]}>
                Active listings could not be loaded.
              </Text>
              <TouchableOpacity
                style={[
                  styles.retryButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => void refetchProperties()}
                accessibilityRole="button"
              >
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : !isLoading && lister ? (
            <Text style={[styles.emptyListings, { color: colors.textMuted }]}>
              No active listings right now.
            </Text>
          ) : null
        }
        contentContainerStyle={{
          paddingBottom:
            insets.bottom +
            (lister && (lister.phoneNumber || lister.email) ? 88 : 20),
        }}
        showsVerticalScrollIndicator={false}
      />

      {lister && (lister?.phoneNumber || lister?.email) && (
        <View
          style={[
            styles.contactBar,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          {lister.phoneNumber && (
            <TouchableOpacity
              style={[
                styles.contactButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => void handleContact(`tel:${lister.phoneNumber}`)}
              accessibilityRole="button"
              accessibilityLabel={`Call ${lister.firstName} ${lister.lastName}`}
            >
              <Ionicons name="call-outline" size={18} color="white" />
              <Text style={styles.contactLabel}>Call</Text>
            </TouchableOpacity>
          )}
          {lister.email && (
            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: colors.card }]}
              onPress={() => void handleContact(`mailto:${lister.email}`)}
              accessibilityRole="button"
              accessibilityLabel={`Email ${lister.firstName} ${lister.lastName}`}
            >
              <Ionicons name="mail-outline" size={18} color={colors.text} />
              <Text style={[styles.contactLabel, { color: colors.text }]}>
                Email
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: {
    borderBottomWidth: 1,
    minHeight: 176,
    paddingVertical: 16,
  },
  avatarWrap: {
    width: 124,
    height: 144,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginRight: 14,
  },
  avatar: { width: "100%", height: "100%" },
  profileInfo: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  name: { fontSize: 22, fontWeight: "800" },
  role: { fontSize: 14, fontWeight: "700", marginTop: 5 },
  listingCount: { fontSize: 13, marginTop: 8 },
  profileRating: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 12,
  },
  profileStars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
  profileRatingValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  profileRatingCount: {
    fontSize: 12,
  },
  section: { padding: 18, borderBottomWidth: 1 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  bio: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  reviewSummary: {
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
  },
  reviewSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  starGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingValue: {
    fontSize: 26,
    fontWeight: "800",
  },
  reviewMeta: {
    fontSize: 12,
    marginTop: 6,
  },
  reviewComposer: {
    marginTop: 14,
    borderRadius: 10,
    padding: 14,
    gap: 12,
  },
  reviewComposerTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  starSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reviewInput: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: "top",
  },
  submitReviewButton: {
    minHeight: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  submitReviewText: {
    color: "#fff",
    fontWeight: "700",
  },
  reviewPlaceholder: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 12,
    marginTop: 10,
    borderRadius: 8,
  },
  reviewCopy: { flex: 1, fontSize: 13 },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  reviewHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  reviewAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAuthor: {
    fontWeight: "700",
    fontSize: 14,
  },
  reviewDate: {
    fontSize: 11,
    marginTop: 2,
  },
  reviewActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inlineActionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 10,
  },
  reviewComment: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  listingsHeading: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 12 },
  emptyListings: {
    textAlign: "center",
    paddingHorizontal: 20,
    paddingVertical: 26,
  },
  listingError: { alignItems: "center" },
  state: { alignItems: "center", paddingVertical: 64, paddingHorizontal: 24 },
  stateTitle: { fontSize: 17, fontWeight: "700", marginTop: 12 },
  stateCopy: { fontSize: 13, textAlign: "center", marginTop: 6 },
  retryButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginTop: 12,
    borderRadius: 7,
  },
  retryText: { color: "white", fontWeight: "700" },
  contactBar: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  contactButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 8,
  },
  contactLabel: { color: "white", fontSize: 14, fontWeight: "700" },
});

export default ListerProfileScreen;
