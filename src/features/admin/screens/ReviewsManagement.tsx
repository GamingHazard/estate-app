import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, getQueryFn, queryClient } from "../../../shared/queryClient";
import { useTheme } from "../../../shared/theme/ThemeContext";

type ReviewStatus = "active" | "flagged" | "hidden";
type StatusFilter = "all" | ReviewStatus;

type ManagedReview = {
  id: string;
  reviewerId: string;
  reviewedUserId: string;
  propertyId: string | null;
  rating: number;
  comment: string;
  status: ReviewStatus;
  moderationNote: string;
  createdAt: string;
  updatedAt: string;
  reviewer: {
    id: string;
    firstName?: string;
    lastName?: string;
  } | null;
  reviewedUser: {
    id: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  } | null;
  property: { id: string; name?: string } | null;
};

type ReviewListResponse = { reviews: ManagedReview[] };

const STATUS_FILTERS: Array<{ key: StatusFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "flagged", label: "Flagged" },
  { key: "hidden", label: "Hidden" },
];

const displayName = (
  person: { firstName?: string; lastName?: string } | null,
) =>
  person
    ? `${person.firstName || ""} ${person.lastName || ""}`.trim() || "Unnamed user"
    : "Unknown user";

const reviewRating = (reviews: ManagedReview[]) => {
  const active = reviews.filter((review) => review.status === "active");
  if (!active.length) return 0;
  return active.reduce((sum, review) => sum + review.rating, 0) / active.length;
};

export function ReviewsManagement() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 720;
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("flagged");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<"all" | 1 | 2 | 3 | 4 | 5>("all");
  const [selectedReview, setSelectedReview] = useState<ManagedReview | null>(null);
  const [moderationNote, setModerationNote] = useState("");
  const [pendingAction, setPendingAction] = useState<ReviewStatus | "delete" | null>(
    null,
  );

  const reviewsQuery = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: getQueryFn<ReviewListResponse>({ on401: "throw" }),
  });
  const reviews = reviewsQuery.data?.reviews ?? [];

  const filteredReviews = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return reviews.filter((review) => {
      if (statusFilter !== "all" && review.status !== statusFilter) return false;
      if (ratingFilter !== "all" && review.rating !== ratingFilter) return false;
      if (!normalizedSearch) return true;
      return [
        displayName(review.reviewer),
        displayName(review.reviewedUser),
        review.reviewedUser?.role,
        review.property?.name,
        review.comment,
      ].some((value) => value?.toLowerCase().includes(normalizedSearch));
    });
  }, [ratingFilter, reviews, search, statusFilter]);

  const refreshReviews = async () => {
    await reviewsQuery.refetch();
    await queryClient.invalidateQueries({ predicate: (query) =>
      String(query.queryKey.join("/")).includes("reviews"),
    });
  };

  const invalidateReviewData = async () => {
    await Promise.all([
      reviewsQuery.refetch(),
      queryClient.invalidateQueries({ predicate: (query) =>
        String(query.queryKey.join("/")).includes("reviews"),
      }),
    ]);
  };

  const openReview = (review: ManagedReview) => {
    setSelectedReview(review);
    setModerationNote(review.moderationNote || "");
  };

  const moderateReview = async (review: ManagedReview, status: ReviewStatus) => {
    if (status !== "active" && !moderationNote.trim()) {
      Alert.alert("Moderation reason required", "Add a reason before hiding or flagging this review.");
      return;
    }
    setPendingAction(status);
    try {
      await apiRequest("PATCH", `/reviews/${review.id}/moderate`, {
        status,
        moderationNote: moderationNote.trim(),
      });
      setSelectedReview(null);
      await invalidateReviewData();
    } catch (error) {
      Alert.alert(
        "Unable to moderate review",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setPendingAction(null);
    }
  };

  const deleteReview = (review: ManagedReview) => {
    Alert.alert(
      "Delete review permanently?",
      `This will remove the review by ${displayName(review.reviewer)} and recalculate the owner's rating.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setPendingAction("delete");
            try {
              await apiRequest("DELETE", `/reviews/${review.id}`);
              setSelectedReview(null);
              await invalidateReviewData();
            } catch (error) {
              Alert.alert(
                "Unable to delete review",
                error instanceof Error ? error.message : "Please try again.",
              );
            } finally {
              setPendingAction(null);
            }
          },
        },
      ],
    );
  };

  const counts = {
    all: reviews.length,
    active: reviews.filter((review) => review.status === "active").length,
    flagged: reviews.filter((review) => review.status === "flagged").length,
    hidden: reviews.filter((review) => review.status === "hidden").length,
  };

  const statusStyle = (status: ReviewStatus) => {
    if (status === "active") return { background: "#dcfce7", color: "#166534" };
    if (status === "flagged") return { background: "#ffedd5", color: "#c2410c" };
    return { background: "#e5e7eb", color: "#374151" };
  };

  const styles = StyleSheet.create({
    page: { flex: 1 },
    header: {
      flexDirection: isCompact ? "column" : "row",
      alignItems: isCompact ? "flex-start" : "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 18,
    },
    title: { color: colors.text, fontSize: 26, fontWeight: "800" },
    subtitle: { color: colors.textMuted, fontSize: 13, marginTop: 5 },
    refreshButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
      backgroundColor: colors.card,
    },
    refreshText: { color: colors.text, fontWeight: "700", fontSize: 13 },
    metrics: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 16,
    },
    metricCard: {
      flexGrow: 1,
      flexBasis: isCompact ? "45%" : 150,
      minWidth: isCompact ? 130 : 150,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
    },
    metricLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "600" },
    metricValue: { color: colors.text, fontSize: 24, fontWeight: "800", marginTop: 7 },
    searchRow: {
      flexDirection: isCompact ? "column" : "row",
      gap: 10,
      marginBottom: 12,
    },
    searchBox: {
      flex: 1,
      minHeight: 42,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      backgroundColor: colors.card,
    },
    searchInput: { flex: 1, color: colors.text, height: 42 },
    ratingFilters: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
    filterChip: {
      minHeight: 42,
      minWidth: 42,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
      backgroundColor: colors.card,
    },
    selectedChip: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterChipText: { color: colors.text, fontWeight: "700", fontSize: 12 },
    selectedChipText: { color: "white" },
    tabs: {
      flexDirection: "row",
      gap: 5,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 12,
    },
    tab: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    selectedTab: { borderBottomColor: colors.primary },
    tabText: { color: colors.textMuted, fontWeight: "700", fontSize: 13 },
    selectedTabText: { color: colors.primary },
    countBadge: {
      marginLeft: 5,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    reviewCard: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    reviewTop: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
    reviewer: { color: colors.text, fontWeight: "800", fontSize: 15 },
    meta: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
    stars: { flexDirection: "row", marginTop: 10 },
    comment: { color: colors.text, fontSize: 14, lineHeight: 21, marginTop: 10 },
    context: {
      marginTop: 12,
      paddingTop: 11,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 4,
    },
    contextText: { color: colors.textMuted, fontSize: 12 },
    statusBadge: {
      alignSelf: "flex-start",
      borderRadius: 20,
      paddingHorizontal: 9,
      paddingVertical: 5,
    },
    statusText: { fontSize: 11, fontWeight: "800", textTransform: "capitalize" },
    empty: { alignItems: "center", paddingVertical: 48 },
    emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "800", marginTop: 12 },
    emptyText: { color: colors.textMuted, textAlign: "center", marginTop: 6, maxWidth: 340 },
    modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    drawer: {
      backgroundColor: colors.card,
      maxHeight: "92%",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 18,
    },
    drawerWide: {
      width: 520,
      alignSelf: "flex-end",
      height: "100%",
      borderRadius: 0,
    },
    modalHandle: {
      alignSelf: "center",
      width: 42,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginBottom: 14,
    },
    drawerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    drawerTitle: { color: colors.text, fontSize: 21, fontWeight: "800" },
    detailBlock: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
    detailLabel: { color: colors.textMuted, fontSize: 11, fontWeight: "800", marginBottom: 7 },
    noteInput: {
      minHeight: 88,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      color: colors.text,
      textAlignVertical: "top",
      backgroundColor: colors.background,
    },
    actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingTop: 16 },
    actionButton: {
      minHeight: 42,
      borderRadius: 9,
      paddingHorizontal: 13,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    actionText: { fontWeight: "800", fontSize: 13 },
    destructive: { borderColor: colors.destructive },
    destructiveText: { color: colors.destructive },
  });

  const renderReview = ({ item }: { item: ManagedReview }) => {
    const status = statusStyle(item.status);
    return (
      <TouchableOpacity style={styles.reviewCard} onPress={() => openReview(item)} activeOpacity={0.78}>
        <View style={styles.reviewTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.reviewer}>{displayName(item.reviewer)}</Text>
            <Text style={styles.meta}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.stars}>
          {Array.from({ length: 5 }, (_, index) => (
            <Ionicons
              key={index}
              name={index < item.rating ? "star" : "star-outline"}
              size={16}
              color="#f5b301"
            />
          ))}
        </View>
        {item.comment ? <Text style={styles.comment}>{item.comment}</Text> : null}
        <View style={styles.context}>
          <Text style={styles.contextText}>
            Owner: {displayName(item.reviewedUser)}
            {item.reviewedUser?.role ? ` · ${item.reviewedUser.role}` : ""}
          </Text>
          {item.property?.name ? (
            <Text style={styles.contextText}>Property: {item.property.name}</Text>
          ) : null}
          {item.moderationNote ? (
            <Text style={styles.contextText}>Moderation note: {item.moderationNote}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Reviews & Ratings</Text>
          <Text style={styles.subtitle}>
            Review customer feedback and moderate owner reputation.
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={() => void refreshReviews()}>
          <Ionicons name="refresh" size={17} color={colors.text} />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metrics}>
        {[
          ["Total reviews", counts.all],
          ["Active", counts.active],
          ["Flagged queue", counts.flagged],
          ["Hidden", counts.hidden],
          ["Average rating", reviewRating(reviews).toFixed(1)],
        ].map(([label, value]) => (
          <View key={String(label)} style={styles.metricCard}>
            <Text style={styles.metricLabel}>{String(label)}</Text>
            <Text style={styles.metricValue}>{String(value)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search reviews, users, or properties"
            placeholderTextColor={colors.textMuted}
          />
          {search.length > 0 ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.ratingFilters}>
          {(["all", 5, 4, 3, 2, 1] as const).map((value) => (
            <TouchableOpacity
              key={value}
              style={[styles.filterChip, ratingFilter === value && styles.selectedChip]}
              onPress={() => setRatingFilter(value)}
            >
              <Text style={[
                styles.filterChipText,
                ratingFilter === value && styles.selectedChipText,
              ]}>
                {value === "all" ? "All stars" : `${value}★`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.tabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {STATUS_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[styles.tab, statusFilter === filter.key && styles.selectedTab]}
              onPress={() => setStatusFilter(filter.key)}
            >
              <Text style={[
                styles.tabText,
                statusFilter === filter.key && styles.selectedTabText,
              ]}>
                {filter.label}
                <Text style={styles.countBadge}>{counts[filter.key]}</Text>
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {reviewsQuery.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : reviewsQuery.isError ? (
        <View style={styles.empty}>
          <Ionicons name="cloud-offline-outline" size={34} color={colors.destructive} />
          <Text style={styles.emptyTitle}>Reviews could not be loaded</Text>
          <TouchableOpacity style={[styles.refreshButton, { marginTop: 14 }]} onPress={() => void reviewsQuery.refetch()}>
            <Text style={styles.refreshText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : filteredReviews.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons
            name={statusFilter === "flagged" ? "shield-checkmark-outline" : "chatbubbles-outline"}
            size={36}
            color={colors.textMuted}
          />
          <Text style={styles.emptyTitle}>
            {statusFilter === "flagged" ? "All caught up" : "No reviews found"}
          </Text>
          <Text style={styles.emptyText}>
            {statusFilter === "flagged"
              ? "There are no flagged reviews waiting for moderation."
              : "Try changing the status, rating, or search filters."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredReviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReview}
          refreshControl={
            <RefreshControl
              refreshing={reviewsQuery.isFetching}
              onRefresh={() => void refreshReviews()}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}

      <Modal
        visible={Boolean(selectedReview)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedReview(null)}
      >
        <View style={[
          styles.modalBackdrop,
          !isCompact && { justifyContent: "flex-end" },
        ]}>
          <View style={[styles.drawer, !isCompact && styles.drawerWide]}>
            {!isCompact ? null : <View style={styles.modalHandle} />}
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Review details</Text>
              <TouchableOpacity onPress={() => setSelectedReview(null)} accessibilityLabel="Close review details">
                <Ionicons name="close" size={25} color={colors.text} />
              </TouchableOpacity>
            </View>
            {selectedReview ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>REVIEWER</Text>
                  <Text style={styles.comment}>{displayName(selectedReview.reviewer)}</Text>
                </View>
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>OWNER / PROPERTY</Text>
                  <Text style={styles.comment}>{displayName(selectedReview.reviewedUser)}</Text>
                  {selectedReview.property?.name ? (
                    <Text style={styles.meta}>{selectedReview.property.name}</Text>
                  ) : null}
                </View>
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>RATING & COMMENT</Text>
                  <View style={styles.stars}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <Ionicons key={index} name={index < selectedReview.rating ? "star" : "star-outline"} size={18} color="#f5b301" />
                    ))}
                  </View>
                  <Text style={styles.comment}>{selectedReview.comment || "No written comment."}</Text>
                </View>
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>MODERATION NOTE</Text>
                  <TextInput
                    style={styles.noteInput}
                    value={moderationNote}
                    onChangeText={setModerationNote}
                    placeholder="Explain why this review is hidden or flagged"
                    placeholderTextColor={colors.textMuted}
                    multiline
                    maxLength={500}
                  />
                </View>
                <View style={styles.actions}>
                  {selectedReview.status !== "active" ? (
                    <TouchableOpacity
                      style={[styles.actionButton, { borderColor: colors.primary }]}
                      onPress={() => void moderateReview(selectedReview, "active")}
                      disabled={Boolean(pendingAction)}
                    >
                      <Text style={[styles.actionText, { color: colors.primary }]}>Restore active</Text>
                    </TouchableOpacity>
                  ) : null}
                  {selectedReview.status !== "flagged" ? (
                    <TouchableOpacity
                      style={[styles.actionButton, { borderColor: "#c2410c" }]}
                      onPress={() => void moderateReview(selectedReview, "flagged")}
                      disabled={Boolean(pendingAction)}
                    >
                      <Text style={[styles.actionText, { color: "#c2410c" }]}>Mark flagged</Text>
                    </TouchableOpacity>
                  ) : null}
                  {selectedReview.status !== "hidden" ? (
                    <TouchableOpacity
                      style={[styles.actionButton, { borderColor: colors.textMuted }]}
                      onPress={() => void moderateReview(selectedReview, "hidden")}
                      disabled={Boolean(pendingAction)}
                    >
                      <Text style={[styles.actionText, { color: colors.textMuted }]}>Hide review</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.destructive]}
                    onPress={() => deleteReview(selectedReview)}
                    disabled={Boolean(pendingAction)}
                  >
                    <Text style={[styles.actionText, styles.destructiveText]}>Delete permanently</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}
