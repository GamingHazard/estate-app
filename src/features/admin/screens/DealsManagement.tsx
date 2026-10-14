import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, getQueryFn, queryClient } from "../../../shared/queryClient";
import { useTheme } from "../../../shared/theme/ThemeContext";
import {
  getPropertyDisplayLocation,
  Property,
  PropertyListing,
} from "../../../data/property";

type DealStatus = "draft" | "published" | "paused" | "removed";
type DealViewStatus = DealStatus | "scheduled" | "active" | "expired" | "all";
type Deal = {
  id: string;
  propertyId: string;
  listingId: string;
  title: string;
  description?: string;
  discount: { type: "percentage" | "fixed"; value: number };
  pricingSnapshot: { basePrice: number; dealPrice: number; currency: string; billingPeriod?: string };
  status: DealStatus;
  startsAt: string;
  endsAt?: string | null;
  isActive: boolean;
  property?: Property;
  listing?: PropertyListing;
};
type DealsResponse = { deals: Deal[] };
type PropertiesResponse = { properties: Property[] };
type DealFilter = "all" | DealViewStatus;
type DateTarget = "startsAt" | "endsAt";

type DealDraft = {
  propertyId: string;
  listingId: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  startsAt: Date;
  endsAt: Date | null;
  status: "draft" | "published" | "paused";
};

const emptyDraft = (): DealDraft => ({
  propertyId: "",
  listingId: "",
  title: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  startsAt: new Date(),
  endsAt: null,
  status: "draft",
});

const formatMoney = (amount: number, currency = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

const getViewStatus = (deal: Deal, now = Date.now()): DealViewStatus => {
  if (deal.status !== "published") return deal.status;
  const startsAt = new Date(deal.startsAt).getTime();
  const endsAt = deal.endsAt ? new Date(deal.endsAt).getTime() : null;
  if (Number.isFinite(startsAt) && now < startsAt) return "scheduled";
  if (endsAt !== null && Number.isFinite(endsAt) && now > endsAt) return "expired";
  return "active";
};

const statusLabel: Record<DealViewStatus, string> = {
  all: "All deals",
  draft: "Draft",
  published: "Published",
  paused: "Paused",
  removed: "Removed",
  scheduled: "Scheduled",
  active: "Active",
  expired: "Expired",
};

const DealsManagement: React.FC = () => {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DealFilter>("all");
  const [isFormVisible, setFormVisible] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [draft, setDraft] = useState<DealDraft>(emptyDraft());
  const [propertyPickerVisible, setPropertyPickerVisible] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<DateTarget | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const dealsQuery = useQuery({
    queryKey: ["deals", "manage"],
    queryFn: getQueryFn<DealsResponse>({ on401: "throw" }),
  });
  const propertiesQuery = useQuery({
    queryKey: ["properties", "marketplace", "manage"],
    queryFn: getQueryFn<PropertiesResponse>({ on401: "throw" }),
  });

  const deals = dealsQuery.data?.deals ?? [];
  const eligibleListings = useMemo(
    () =>
      (propertiesQuery.data?.properties ?? [])
        .filter((property) => property.moderationStatus === "approved")
        .flatMap((property) =>
          (property.listings ?? [])
            .filter((listing) => listing.status === "published")
            .map((listing) => ({ property, listing })),
        ),
    [propertiesQuery.data?.properties],
  );
  const selectedTarget = eligibleListings.find(
    ({ property, listing }) => property.id === draft.propertyId && listing.id === draft.listingId,
  );
  const listingPrice = selectedTarget?.listing.price ?? 0;
  const discountValue = Number(draft.discountValue);
  const previewPrice = Number.isFinite(discountValue) && discountValue >= 0
    ? draft.discountType === "percentage"
      ? listingPrice * (1 - discountValue / 100)
      : listingPrice - discountValue
    : listingPrice;

  const visibleDeals = useMemo(() => {
    const query = search.trim().toLowerCase();
    return deals.filter((deal) => {
      const viewStatus = getViewStatus(deal);
      const matchesStatus = filter === "all" || viewStatus === filter || deal.status === filter;
      const matchesQuery = !query || [
        deal.title,
        deal.description,
        deal.property?.name,
        deal.property?.address,
        deal.property?.city,
        deal.listing?.purpose,
      ].some((value) => value?.toLowerCase().includes(query));
      return matchesStatus && matchesQuery;
    });
  }, [deals, filter, search]);

  const statusCounts = useMemo(() => {
    const counts: Record<DealViewStatus, number> = {
      all: deals.length,
      draft: 0,
      published: 0,
      paused: 0,
      removed: 0,
      scheduled: 0,
      active: 0,
      expired: 0,
    };
    deals.forEach((deal) => {
      counts[deal.status] += 1;
      const computed = getViewStatus(deal);
      if (computed === "active" || computed === "scheduled" || computed === "expired") {
        counts[computed] += 1;
      }
    });
    return counts;
  }, [deals]);

  const openCreateForm = () => {
    setEditingDeal(null);
    setDraft(emptyDraft());
    setFormVisible(true);
  };

  const openEditForm = (deal: Deal) => {
    setEditingDeal(deal);
    setDraft({
      propertyId: deal.propertyId,
      listingId: deal.listingId,
      title: deal.title,
      description: deal.description ?? "",
      discountType: deal.discount.type,
      discountValue: String(deal.discount.value),
      startsAt: new Date(deal.startsAt),
      endsAt: deal.endsAt ? new Date(deal.endsAt) : null,
      status: deal.status === "paused" ? "paused" : deal.status === "published" ? "published" : "draft",
    });
    setFormVisible(true);
  };

  const invalidateDealQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["deals", "manage"] }),
      queryClient.invalidateQueries({ queryKey: ["deals"] }),
    ]);
  };

  const saveDeal = async () => {
    if (!draft.title.trim() || !draft.propertyId || !draft.listingId || !draft.discountValue.trim()) {
      Alert.alert("Complete required fields", "Choose a listing, enter a title, and set a discount.");
      return;
    }
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      Alert.alert("Invalid discount", "Enter a discount greater than zero.");
      return;
    }
    if (draft.endsAt && draft.endsAt < draft.startsAt) {
      Alert.alert("Invalid dates", "The end date must be after the start date.");
      return;
    }
    if (draft.discountType === "percentage" && discountValue >= 100) {
      Alert.alert("Invalid percentage", "Percentage discounts must be below 100%.");
      return;
    }
    if (draft.discountType === "fixed" && discountValue >= listingPrice) {
      Alert.alert("Invalid discount", "A fixed discount must be less than the listing price.");
      return;
    }

    const payload = {
      propertyId: draft.propertyId,
      listingId: draft.listingId,
      title: draft.title.trim(),
      description: draft.description.trim(),
      discount: { type: draft.discountType, value: discountValue },
      startsAt: draft.startsAt.toISOString(),
      endsAt: draft.endsAt?.toISOString() ?? null,
      status: draft.status,
    };

    setIsSaving(true);
    try {
      if (editingDeal) {
        await apiRequest("PATCH", `/deals/${editingDeal.id}`, {
          title: payload.title,
          description: payload.description,
          discount: payload.discount,
          startsAt: payload.startsAt,
          endsAt: payload.endsAt,
        });
        if (draft.status !== editingDeal.status) {
          await apiRequest("PATCH", `/deals/${editingDeal.id}/status`, { status: draft.status });
        }
      } else {
        await apiRequest("POST", "/deals", payload);
      }
      await invalidateDealQueries();
      setFormVisible(false);
    } catch (error) {
      Alert.alert("Unable to save deal", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const changeStatus = async (deal: Deal, status: DealStatus) => {
    const runStatusChange = async () => {
      try {
        await apiRequest("PATCH", `/deals/${deal.id}/status`, { status });
        await invalidateDealQueries();
      } catch (error) {
        Alert.alert("Unable to update deal", error instanceof Error ? error.message : "Please try again.");
      }
    };

    if (status === "removed") {
      Alert.alert("Remove deal?", `“${deal.title}” will be removed from public deals, but retained in management history.`, [
        { text: "Keep deal", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => void runStatusChange() },
      ]);
      return;
    }
    await runStatusChange();
  };

  const showDatePicker = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate && datePickerTarget) {
      setDraft((current) => ({ ...current, [datePickerTarget]: selectedDate }));
    }
    setDatePickerTarget(null);
  };

  const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 },
    title: { color: colors.text, fontSize: 22, fontWeight: "800" },
    subtitle: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
    primaryButton: { minHeight: 42, paddingHorizontal: 13, borderRadius: 8, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
    primaryButtonText: { color: "#fff", fontSize: 13, fontWeight: "700" },
    metrics: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
    metric: { minWidth: "30%", flexGrow: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 11 },
    metricLabel: { color: colors.textMuted, fontSize: 11 },
    metricValue: { color: colors.text, fontSize: 19, fontWeight: "800", marginTop: 4 },
    search: { minHeight: 44, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8 },
    searchInput: { flex: 1, color: colors.text, paddingVertical: 8, fontSize: 14 },
    filters: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginVertical: 12 },
    filterChip: { minHeight: 34, paddingHorizontal: 11, borderRadius: 17, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
    filterChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterText: { color: colors.textMuted, fontSize: 12, fontWeight: "600" },
    filterTextSelected: { color: "#fff" },
    dealCard: { backgroundColor: colors.card, borderRadius: 8, padding: 13, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
    dealTop: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
    dealTitle: { color: colors.text, fontSize: 15, fontWeight: "700", flex: 1 },
    statusBadge: { borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: `${colors.primary}20` },
    statusText: { color: colors.primary, fontSize: 11, fontWeight: "700" },
    dealTarget: { color: colors.textMuted, fontSize: 12, marginTop: 5 },
    priceLine: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 7, marginTop: 10 },
    dealPrice: { color: colors.text, fontSize: 16, fontWeight: "800" },
    basePrice: { color: colors.textMuted, fontSize: 12, textDecorationLine: "line-through" },
    discountText: { color: "#15803d", fontSize: 12, fontWeight: "700" },
    dateLine: { color: colors.textMuted, fontSize: 12, marginTop: 7 },
    actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
    actionButton: { minHeight: 36, paddingHorizontal: 10, borderRadius: 7, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
    actionText: { color: colors.text, fontSize: 12, fontWeight: "600" },
    state: { alignItems: "center", justifyContent: "center", paddingVertical: 44, gap: 10 },
    stateText: { color: colors.textMuted, fontSize: 14, textAlign: "center" },
    formBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
    formSheet: { height: "94%", backgroundColor: colors.background, borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: "hidden" },
    formHeader: { minHeight: 58, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    formTitle: { color: colors.text, fontSize: 17, fontWeight: "700" },
    formBody: { padding: 16, paddingBottom: 32 },
    label: { color: colors.text, fontSize: 13, fontWeight: "600", marginBottom: 7 },
    field: { minHeight: 46, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, color: colors.text, paddingHorizontal: 12, fontSize: 14 },
    fieldGroup: { marginBottom: 15 },
    textArea: { minHeight: 82, paddingTop: 11, textAlignVertical: "top" },
    segmented: { flexDirection: "row", borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: "hidden" },
    segment: { flex: 1, minHeight: 42, alignItems: "center", justifyContent: "center", backgroundColor: colors.card },
    segmentActive: { backgroundColor: colors.primary },
    segmentText: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
    segmentTextActive: { color: "#fff" },
    targetButton: { minHeight: 56, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 12, justifyContent: "center" },
    targetTitle: { color: colors.text, fontSize: 13, fontWeight: "600" },
    targetSub: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
    dateButton: { minHeight: 46, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    preview: { backgroundColor: colors.card, borderRadius: 8, padding: 13, borderWidth: 1, borderColor: colors.border, marginBottom: 15 },
    previewLabel: { color: colors.textMuted, fontSize: 12 },
    previewPrice: { color: colors.text, fontSize: 21, fontWeight: "800", marginTop: 4 },
    formActions: { flexDirection: "row", gap: 9, marginTop: 5 },
    secondaryButton: { minHeight: 46, flex: 1, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
    pickerBackdrop: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "rgba(0,0,0,0.45)" },
    pickerSheet: { maxHeight: "80%", borderRadius: 10, backgroundColor: colors.background, padding: 14 },
    pickerTitle: { color: colors.text, fontSize: 16, fontWeight: "700", marginBottom: 10 },
    pickerOption: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    pickerOptionTitle: { color: colors.text, fontSize: 14, fontWeight: "600" },
    pickerOptionSub: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
    pickerEmpty: { color: colors.textMuted, paddingVertical: 20, textAlign: "center" },
  });

  const currency = selectedTarget?.listing.currency || editingDeal?.pricingSnapshot.currency || "USD";
  const eligibleListingPrice = selectedTarget?.listing.price ?? editingDeal?.pricingSnapshot.basePrice ?? 0;
  const previewDealPrice = draft.discountType === "percentage"
    ? eligibleListingPrice * (1 - discountValue / 100)
    : eligibleListingPrice - discountValue;

  const renderDeal = ({ item }: { item: Deal }) => {
    const viewStatus = getViewStatus(item);
    const relatedProperty = item.property;
    const listing = item.listing;
    const dateSummary = `${new Date(item.startsAt).toLocaleDateString()} – ${item.endsAt ? new Date(item.endsAt).toLocaleDateString() : "No end date"}`;
    const canEdit = item.status !== "removed";

    return (
      <View style={styles.dealCard}>
        <View style={styles.dealTop}>
          <Text style={styles.dealTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.statusBadge}><Text style={styles.statusText}>{statusLabel[viewStatus]}</Text></View>
        </View>
        <Text style={styles.dealTarget} numberOfLines={2}>
          {relatedProperty?.name ?? "Property unavailable"} · {listing?.purpose ?? "listing"} · {relatedProperty?.city ?? relatedProperty?.address ?? ""}
        </Text>
        <View style={styles.priceLine}>
          <Text style={styles.dealPrice}>{formatMoney(item.pricingSnapshot.dealPrice, item.pricingSnapshot.currency)}</Text>
          <Text style={styles.basePrice}>{formatMoney(item.pricingSnapshot.basePrice, item.pricingSnapshot.currency)}</Text>
          <Text style={styles.discountText}>
            {item.discount.type === "percentage" ? `${item.discount.value}% off` : `${formatMoney(item.discount.value, item.pricingSnapshot.currency)} off`}
          </Text>
        </View>
        <Text style={styles.dateLine}>{dateSummary}</Text>
        <View style={styles.actions}>
          {canEdit && <Pressable style={styles.actionButton} onPress={() => openEditForm(item)}><Ionicons name="create-outline" size={15} color={colors.text} /><Text style={styles.actionText}>Edit</Text></Pressable>}
          {item.status === "draft" && <Pressable style={styles.actionButton} onPress={() => void changeStatus(item, "published")}><Ionicons name="paper-plane-outline" size={15} color={colors.primary} /><Text style={[styles.actionText, { color: colors.primary }]}>Publish</Text></Pressable>}
          {(viewStatus === "active" || viewStatus === "scheduled") && <Pressable style={styles.actionButton} onPress={() => void changeStatus(item, "paused")}><Ionicons name="pause-outline" size={15} color={colors.text} /><Text style={styles.actionText}>Pause</Text></Pressable>}
          {item.status === "paused" && <Pressable style={styles.actionButton} onPress={() => void changeStatus(item, "published")}><Ionicons name="play-outline" size={15} color={colors.primary} /><Text style={[styles.actionText, { color: colors.primary }]}>Resume</Text></Pressable>}
          {canEdit && <Pressable style={styles.actionButton} onPress={() => void changeStatus(item, "removed")}><Ionicons name="trash-outline" size={15} color={colors.destructive} /><Text style={[styles.actionText, { color: colors.destructive }]}>Remove</Text></Pressable>}
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Deals management</Text>
          <Text style={styles.subtitle}>Create offers, control schedules, and review deal performance.</Text>
        </View>
        <Pressable style={styles.primaryButton} onPress={openCreateForm} accessibilityRole="button">
          <Ionicons name="add" size={19} color="#fff" />
          <Text style={styles.primaryButtonText}>Create deal</Text>
        </Pressable>
      </View>
      <View style={styles.metrics}>
        {(["all", "active", "scheduled", "draft", "paused", "removed"] as const).map((key) => (
          <Pressable key={key} style={styles.metric} onPress={() => setFilter(key)}>
            <Text style={styles.metricLabel}>{key === "all" ? "Total deals" : statusLabel[key]}</Text>
            <Text style={styles.metricValue}>{statusCounts[key]}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.search}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput value={search} onChangeText={setSearch} placeholder="Search title, property, or listing" placeholderTextColor={colors.textMuted} style={styles.searchInput} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {(["all", "active", "scheduled", "draft", "paused", "expired", "removed"] as const).map((key) => (
          <Pressable key={key} onPress={() => setFilter(key)} style={[styles.filterChip, filter === key && styles.filterChipSelected]}>
            <Text style={[styles.filterText, filter === key && styles.filterTextSelected]}>{statusLabel[key]}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {dealsQuery.isError && (
        <Pressable onPress={() => void dealsQuery.refetch()}>
          <Text style={{ color: colors.error, marginBottom: 10 }}>
            {dealsQuery.error instanceof Error ? dealsQuery.error.message : "Unable to load deals. Tap to retry."}
          </Text>
        </Pressable>
      )}
    </>
  );

  const renderField = (label: string, value: string, onChangeText: (text: string) => void, placeholder: string, keyboardType: "default" | "decimal-pad" = "default") => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textMuted} keyboardType={keyboardType} style={styles.field} />
    </View>
  );

  const setDate = (target: DateTarget, value: Date) => setDraft((current) => ({ ...current, [target]: value }));
  const clearEndDate = () => setDraft((current) => ({ ...current, endsAt: null }));
  const availableStatuses: DealDraft["status"][] = editingDeal
    ? ["draft", "published", "paused"]
    : ["draft", "published"];

  return (
    <View style={styles.root}>
      {dealsQuery.isLoading ? (
        <View style={styles.state}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.stateText}>Loading deals…</Text></View>
      ) : (
        <FlatList
          data={visibleDeals}
          keyExtractor={(deal) => deal.id}
          renderItem={renderDeal}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={<View style={styles.state}><Ionicons name="pricetag-outline" size={34} color={colors.textMuted} /><Text style={styles.stateText}>{search || filter !== "all" ? "No deals match these filters." : "No deals yet. Create the first offer."}</Text></View>}
          contentContainerStyle={{ paddingBottom: 28, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshing={dealsQuery.isRefetching}
          onRefresh={() => void dealsQuery.refetch()}
        />
      )}

      <Modal visible={isFormVisible} animationType="slide" transparent onRequestClose={() => setFormVisible(false)}>
        <View style={styles.formBackdrop}>
          <View style={styles.formSheet}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>{editingDeal ? "Edit deal" : "Create deal"}</Text>
              <Pressable onPress={() => setFormVisible(false)} accessibilityRole="button" accessibilityLabel="Close deal form" hitSlop={8}>
                <Ionicons name="close" size={23} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.formBody} keyboardShouldPersistTaps="handled">
              {!editingDeal && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Property and listing *</Text>
                  <Pressable style={styles.targetButton} onPress={() => setPropertyPickerVisible(true)}>
                    <Text style={styles.targetTitle}>{selectedTarget ? selectedTarget.property.name : "Choose eligible listing"}</Text>
                    <Text style={styles.targetSub}>{selectedTarget ? `${selectedTarget.listing.purpose} · ${formatMoney(selectedTarget.listing.price, selectedTarget.listing.currency)}${selectedTarget.listing.billingPeriod ? ` / ${selectedTarget.listing.billingPeriod}` : ""}` : "Approved properties with published listings"}</Text>
                  </Pressable>
                </View>
              )}
              {renderField("Deal title *", draft.title, (title) => setDraft((current) => ({ ...current, title })), "e.g. Summer rent offer")}
              {renderField("Description", draft.description, (description) => setDraft((current) => ({ ...current, description })), "Describe the offer")}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Discount type</Text>
                <View style={styles.segmented}>
                  {(["percentage", "fixed"] as const).map((type) => (
                    <Pressable key={type} onPress={() => setDraft((current) => ({ ...current, discountType: type }))} style={[styles.segment, draft.discountType === type && styles.segmentActive]}>
                      <Text style={[styles.segmentText, draft.discountType === type && styles.segmentTextActive]}>{type === "percentage" ? "Percentage" : "Fixed amount"}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              {renderField("Discount value *", draft.discountValue, (discountValue) => setDraft((current) => ({ ...current, discountValue })), draft.discountType === "percentage" ? "e.g. 10" : "e.g. 250", "decimal-pad")}
              {selectedTarget && (
                <View style={styles.preview}>
                  <Text style={styles.previewLabel}>Estimated price after discount</Text>
                  <Text style={styles.previewPrice}>{formatMoney(previewDealPrice, currency)}{selectedTarget.listing.billingPeriod ? ` / ${selectedTarget.listing.billingPeriod}` : ""}</Text>
                </View>
              )}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Starts</Text>
                <Pressable style={styles.dateButton} onPress={() => setDatePickerTarget("startsAt")}>
                  <Text style={{ color: colors.text }}>{draft.startsAt.toLocaleString()}</Text>
                  <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
                </Pressable>
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Ends (optional)</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Pressable style={[styles.dateButton, { flex: 1 }]} onPress={() => setDatePickerTarget("endsAt")}>
                    <Text style={{ color: draft.endsAt ? colors.text : colors.textMuted }}>{draft.endsAt?.toLocaleString() ?? "No end date"}</Text>
                    <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
                  </Pressable>
                  {draft.endsAt && <Pressable accessibilityRole="button" accessibilityLabel="Clear end date" onPress={clearEndDate} style={[styles.actionButton, { alignSelf: "stretch" }]}><Ionicons name="close" size={18} color={colors.textMuted} /></Pressable>}
                </View>
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>{editingDeal ? "Status" : "Save as"}</Text>
                <View style={styles.segmented}>
                  {availableStatuses.map((status) => (
                    <Pressable key={status} onPress={() => setDraft((current) => ({ ...current, status }))} style={[styles.segment, draft.status === status && styles.segmentActive]}>
                      <Text style={[styles.segmentText, draft.status === status && styles.segmentTextActive]}>{status === "published" ? "Published" : status === "paused" ? "Paused" : "Draft"}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={styles.formActions}>
                <Pressable style={styles.secondaryButton} onPress={() => setFormVisible(false)}><Text style={styles.actionText}>Cancel</Text></Pressable>
                <Pressable style={[styles.primaryButton, { flex: 1 }]} disabled={isSaving} onPress={() => void saveDeal()}>
                  {isSaving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.primaryButtonText}>{editingDeal ? "Save changes" : "Save deal"}</Text>}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={propertyPickerVisible} transparent animationType="fade" onRequestClose={() => setPropertyPickerVisible(false)}>
        <Pressable style={styles.pickerBackdrop} onPress={() => setPropertyPickerVisible(false)}>
          <Pressable style={styles.pickerSheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.pickerTitle}>Choose a published listing</Text>
            {propertiesQuery.isLoading ? <ActivityIndicator color={colors.primary} /> : propertiesQuery.isError ? (
              <View style={{ alignItems: "center", gap: 10, paddingVertical: 20 }}>
                <Text style={styles.pickerEmpty}>Unable to load eligible listings.</Text>
                <Pressable style={styles.actionButton} onPress={() => void propertiesQuery.refetch()}>
                  <Ionicons name="refresh-outline" size={15} color={colors.primary} />
                  <Text style={[styles.actionText, { color: colors.primary }]}>Try again</Text>
                </Pressable>
              </View>
            ) : eligibleListings.length === 0 ? (
              <Text style={styles.pickerEmpty}>No approved properties with published listings are available.</Text>
            ) : (
              <FlatList
                data={eligibleListings}
                keyExtractor={({ property, listing }) => `${property.id}-${listing.id}`}
                renderItem={({ item }) => (
                  <Pressable style={styles.pickerOption} onPress={() => {
                    setDraft((current) => ({ ...current, propertyId: item.property.id, listingId: item.listing.id }));
                    setPropertyPickerVisible(false);
                  }}>
                    <Text style={styles.pickerOptionTitle}>{item.property.name}</Text>
                    <Text style={styles.pickerOptionSub}>{getPropertyDisplayLocation(item.property)} · {item.listing.purpose} · {formatMoney(item.listing.price, item.listing.currency)}{item.listing.billingPeriod ? ` / ${item.listing.billingPeriod}` : ""}</Text>
                  </Pressable>
                )}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {datePickerTarget && (
        <DateTimePicker
          value={datePickerTarget === "startsAt" ? draft.startsAt : draft.endsAt ?? new Date()}
          mode="datetime"
          onChange={showDatePicker}
        />
      )}
    </View>
  );
};

export default DealsManagement;
