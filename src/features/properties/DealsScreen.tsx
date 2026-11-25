import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import {
  Deal,
  formatDealMoney,
  getDealTimeRemaining,
} from "../../data/deal";
import { getPropertyDisplayLocation } from "../../data/property";
import { getErrorMessage } from "../../shared/queryClient";
import { NavigationProp } from "../../shared/types";
import { useTheme } from "../../shared/theme/ThemeContext";
import { marketplaceDealsQueryOptions } from "./marketplaceQueries";

const NO_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/624px-No-Image-Placeholder.svg.png";
const DEAL_FILTERS = ["All", "Rent", "Sale"] as const;
type DealFilter = (typeof DEAL_FILTERS)[number];

const getDealPriceLabel = (deal: Deal) => {
  const price = formatDealMoney(
    deal.pricingSnapshot.dealPrice,
    deal.pricingSnapshot.currency,
  );
  return deal.pricingSnapshot.billingPeriod
    ? `${price} / ${deal.pricingSnapshot.billingPeriod}`
    : price;
};

const getDealBasePriceLabel = (deal: Deal) => {
  const price = formatDealMoney(
    deal.pricingSnapshot.basePrice,
    deal.pricingSnapshot.currency,
  );
  return deal.pricingSnapshot.billingPeriod
    ? `${price} / ${deal.pricingSnapshot.billingPeriod}`
    : price;
};

const getDiscountPercent = (deal: Deal) => {
  const { basePrice, dealPrice } = deal.pricingSnapshot;
  if (basePrice <= 0 || dealPrice >= basePrice) return null;
  return Math.round(((basePrice - dealPrice) / basePrice) * 100);
};

const getEndDateLabel = (endsAt?: string | null) => {
  if (!endsAt) return "No end date";
  const date = new Date(endsAt);
  if (!Number.isFinite(date.getTime())) return "End date unavailable";
  return `Ends ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
};

const DealsScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<DealFilter>("All");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [now, setNow] = useState(Date.now());
  const featuredIndexRef = useRef(0);
  const featuredListRef = useRef<FlatList<Deal>>(null);

  const dealsQuery = useQuery(marketplaceDealsQueryOptions());
  const deals = dealsQuery.data?.deals ?? [];

  const featuredDeals = useMemo(
    () =>
      deals
        .filter((deal) => deal.featured)
        .sort((a, b) => {
          const aEnd = a.endsAt ? new Date(a.endsAt).getTime() : Infinity;
          const bEnd = b.endsAt ? new Date(b.endsAt).getTime() : Infinity;
          return aEnd - bEnd;
        }),
    [deals],
  );
  const visibleDeals = useMemo(
    () =>
      deals
        .filter((deal) => {
          if (deal.featured) return false;
          if (filter === "All") return true;
          return deal.listing?.purpose === filter.toLowerCase();
        })
        .sort((a, b) => {
          const aEnd = a.endsAt ? new Date(a.endsAt).getTime() : Infinity;
          const bEnd = b.endsAt ? new Date(b.endsAt).getTime() : Infinity;
          return aEnd - bEnd;
        }),
    [deals, filter],
  );

  useEffect(() => {
    featuredIndexRef.current = 0;
    setFeaturedIndex(0);
    featuredListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [featuredDeals.length]);

  useEffect(() => {
    if (!isFocused || featuredDeals.length < 2) return;
    const timer = setInterval(() => {
      const nextIndex = (featuredIndexRef.current + 1) % featuredDeals.length;
      featuredIndexRef.current = nextIndex;
      setFeaturedIndex(nextIndex);
      featuredListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredDeals.length, isFocused]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const openDeal = (deal: Deal) => {
    if (!deal.property) return;
    navigation.navigate("PropertyDetails", {
      property: deal.property,
      deal,
    });
  };

  const onFeaturedScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const nextIndex = Math.max(
      0,
      Math.min(
        featuredDeals.length - 1,
        Math.round(event.nativeEvent.contentOffset.x / width),
      ),
    );
    featuredIndexRef.current = nextIndex;
    setFeaturedIndex(nextIndex);
  };

  const renderFeaturedDeal = ({ item }: { item: Deal }) => {
    const discount = getDiscountPercent(item);
    return (
      <View style={{ width }}>
        <TouchableOpacity
          activeOpacity={0.92}
          disabled={!item.property}
          onPress={() => openDeal(item)}
          style={styles.heroCard}
        >
          <Image
            source={{ uri: item.property?.images?.[0]?.url || NO_IMAGE }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.12)", "rgba(0,0,0,0.88)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroTopRow}>
            <Text style={styles.featuredBadge}>FEATURED DEAL</Text>
            {discount !== null && (
              <Text style={styles.discountBadge}>{discount}% OFF</Text>
            )}
          </View>
          <View style={styles.heroContent}>
            <Text numberOfLines={1} style={styles.heroTitle}>
              {item.property?.name ?? item.title}
            </Text>
            <Text numberOfLines={1} style={styles.heroLocation}>
              {item.property
                ? getPropertyDisplayLocation(item.property)
                : item.title}
            </Text>
            <View style={styles.heroPriceRow}>
              <Text style={styles.heroDealPrice}>{getDealPriceLabel(item)}</Text>
              <Text style={styles.heroOriginalPrice}>
                {getDealBasePriceLabel(item)}
              </Text>
            </View>
            <View style={styles.heroDateRow}>
              <View style={styles.heroMeta}>
                <Ionicons name="time-outline" size={15} color="#fff" />
                <Text style={styles.heroMetaText}>
                  {getDealTimeRemaining(item.endsAt, now)}
                </Text>
              </View>
              <Text style={styles.heroMetaText}>
                {getEndDateLabel(item.endsAt)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDeal = ({ item }: { item: Deal }) => {
    const discount = getDiscountPercent(item);
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        disabled={!item.property}
        onPress={() => openDeal(item)}
        style={[
          styles.dealCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Image
          source={{ uri: item.property?.images?.[0]?.url || NO_IMAGE }}
          style={styles.dealImage}
          resizeMode="cover"
        />
        <View style={styles.dealContent}>
          <View style={styles.dealTitleRow}>
            <Text
              numberOfLines={1}
              style={[styles.dealTitle, { color: colors.text }]}
            >
              {item.property?.name ?? item.title}
            </Text>
            {discount !== null && (
              <Text style={[styles.dealDiscount, { color: colors.primary }]}>
                {discount}% off
              </Text>
            )}
          </View>
          <Text
            numberOfLines={1}
            style={[styles.dealLocation, { color: colors.textMuted }]}
          >
            {item.property
              ? getPropertyDisplayLocation(item.property)
              : item.title}
          </Text>
          <View style={styles.dealPriceRow}>
            <Text style={[styles.dealPrice, { color: colors.primary }]}>
              {getDealPriceLabel(item)}
            </Text>
            <Text style={[styles.dealOriginalPrice, { color: colors.textMuted }]}>
              {getDealBasePriceLabel(item)}
            </Text>
          </View>
          <View style={styles.dealDateRow}>
            <Text style={[styles.dealDate, { color: colors.textMuted }]}>
              {getEndDateLabel(item.endsAt)}
            </Text>
            <Text style={[styles.dealRemaining, { color: colors.textMuted }]}>
              {getDealTimeRemaining(item.endsAt, now)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.listContent}
      data={visibleDeals}
      keyExtractor={(item) => item.id}
      renderItem={renderDeal}
      refreshControl={
        <RefreshControl
          refreshing={dealsQuery.isFetching && !dealsQuery.isLoading}
          onRefresh={() => void dealsQuery.refetch()}
          tintColor={colors.text}
          colors={[colors.primary]}
        />
      }
      ListHeaderComponent={
        <View>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Deals
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              Limited-time offers on handpicked properties
            </Text>
          </View>
          {featuredDeals.length > 0 && (
            <View style={styles.featuredSection}>
              <View style={styles.sectionHeadingRow}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Featured
                </Text>
                <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
                  Swipe to explore
                </Text>
              </View>
              <FlatList
                ref={featuredListRef}
                data={featuredDeals}
                keyExtractor={(item) => item.id}
                renderItem={renderFeaturedDeal}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onFeaturedScrollEnd}
                getItemLayout={(_, index) => ({
                  length: width,
                  offset: width * index,
                  index,
                })}
              />
              {featuredDeals.length > 1 && (
                <View style={styles.pagination}>
                  {featuredDeals.map((deal, index) => (
                    <TouchableOpacity
                      key={deal.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Show featured deal ${index + 1}`}
                      onPress={() => {
                        featuredIndexRef.current = index;
                        setFeaturedIndex(index);
                        featuredListRef.current?.scrollToIndex({
                          index,
                          animated: true,
                        });
                      }}
                      style={[
                        styles.paginationDot,
                        {
                          backgroundColor:
                            index === featuredIndex
                              ? colors.primary
                              : colors.border,
                        },
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          )}
          <View style={styles.dealsSectionHeader}>
            <View style={styles.sectionHeadingRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {featuredDeals.length > 0 ? "More deals" : "All deals"}
              </Text>
              <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
                {visibleDeals.length} available
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
            >
              {DEAL_FILTERS.map((item) => {
                const selected = filter === item;
                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setFilter(item)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: selected
                          ? colors.primary
                          : colors.card,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        { color: selected ? "#fff" : colors.text },
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          {dealsQuery.isError && deals.length > 0 && (
            <TouchableOpacity
              onPress={() => void dealsQuery.refetch()}
              style={[styles.inlineError, { backgroundColor: colors.card }]}
            >
              <Text style={[styles.errorText, { color: colors.text }]}>
                {getErrorMessage(dealsQuery.error, "Could not refresh deals.")}
              </Text>
              <Text style={{ color: colors.primary }}>Tap to retry</Text>
            </TouchableOpacity>
          )}
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          {dealsQuery.isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : dealsQuery.isError ? (
            <>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Deals are unavailable
              </Text>
              <Text style={[styles.emptyMessage, { color: colors.textMuted }]}>
                {getErrorMessage(dealsQuery.error, "Please try again.")}
              </Text>
              <TouchableOpacity
                onPress={() => void dealsQuery.refetch()}
                style={[styles.retryButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </>
          ) : deals.length === 0 ? (
            <>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No active deals right now
              </Text>
              <Text style={[styles.emptyMessage, { color: colors.textMuted }]}>
                Check back soon for new property offers.
              </Text>
            </>
          ) : (
            <Text style={[styles.emptyMessage, { color: colors.textMuted }]}>
              No {filter.toLowerCase()} deals are available right now.
            </Text>
          )}
        </View>
      }
      ListFooterComponent={<View style={{ height: 24 }} />}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 20 },
  header: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 18 },
  headerTitle: { fontSize: 28, fontWeight: "700" },
  headerSubtitle: { fontSize: 14, marginTop: 5 },
  featuredSection: { marginBottom: 20 },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: "700" },
  sectionHint: { fontSize: 12 },
  heroCard: {
    height: 320,
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#333",
  },
  heroTopRow: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  featuredBadge: {
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 6,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: "700",
  },
  discountBadge: {
    color: "#fff",
    backgroundColor: "#d94b3d",
    borderRadius: 6,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "700",
  },
  heroContent: { position: "absolute", bottom: 18, left: 18, right: 18 },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "700" },
  heroLocation: { color: "rgba(255,255,255,0.82)", fontSize: 13, marginTop: 3 },
  heroPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    marginTop: 12,
  },
  heroDealPrice: { color: "#fff", fontSize: 21, fontWeight: "700" },
  heroOriginalPrice: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginLeft: 9,
    textDecorationLine: "line-through",
  },
  heroDateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 9,
  },
  heroMeta: { flexDirection: "row", alignItems: "center" },
  heroMetaText: { color: "#fff", fontSize: 12, marginLeft: 5 },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  paginationDot: { width: 7, height: 7, borderRadius: 4, marginHorizontal: 4 },
  dealsSectionHeader: { paddingHorizontal: 20, paddingTop: 2, paddingBottom: 8 },
  filterList: { paddingVertical: 2 },
  filterChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 9,
  },
  filterText: { fontSize: 14, fontWeight: "600" },
  dealCard: {
    flexDirection: "row",
    minHeight: 128,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  dealImage: { width: 112, minHeight: 128 },
  dealContent: { flex: 1, minWidth: 0, paddingHorizontal: 12, paddingVertical: 11 },
  dealTitleRow: { flexDirection: "row", alignItems: "center" },
  dealTitle: { flex: 1, fontSize: 15, fontWeight: "700" },
  dealDiscount: { fontSize: 11, fontWeight: "700", marginLeft: 6 },
  dealLocation: { fontSize: 12, marginTop: 4 },
  dealPriceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 9 },
  dealPrice: { fontSize: 16, fontWeight: "700" },
  dealOriginalPrice: {
    fontSize: 11,
    marginLeft: 7,
    textDecorationLine: "line-through",
  },
  dealDateRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 7,
  },
  dealDate: { fontSize: 11, marginRight: 6 },
  dealRemaining: { fontSize: 11 },
  inlineError: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
  },
  errorText: { fontSize: 13, marginBottom: 7 },
  emptyState: { alignItems: "center", paddingHorizontal: 24, paddingVertical: 38 },
  emptyTitle: { fontSize: 17, fontWeight: "700", textAlign: "center" },
  emptyMessage: { fontSize: 14, textAlign: "center", marginTop: 7 },
  retryButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 16 },
  retryText: { color: "#fff", fontWeight: "700" },
});

export default DealsScreen;
