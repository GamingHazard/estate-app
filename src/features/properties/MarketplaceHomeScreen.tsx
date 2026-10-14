import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../shared/theme/ThemeContext";
import { useAuth } from "../auth/AuthContext";
import { NavigationProp } from "../../shared/types";
import { apiRequest } from "../../shared/queryClient";
import {
  getPublishedListing,
  getPropertyDisplayLocation,
  Property,
} from "../../data/property";
import { useProperties } from "./useProperties";
import { useSavedProperties } from "./SavedPropertiesContext";
import PropertyListingCard from "./PropertyListingCard";

const CATEGORIES = ["All", "Residential", "Commercial", "Land", "Special"];
const PURPOSES = ["all", "rent", "sale"] as const;
type Purpose = (typeof PURPOSES)[number];

type SortOption = "newest" | "price-low" | "price-high";

type MockNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: "n1",
    title: "New property match",
    message: "3 homes near your preferred area just arrived.",
    time: "2m ago",
    read: false,
  },
  {
    id: "n2",
    title: "Offer reminder",
    message: "Your saved apartment is still drawing interest.",
    time: "30m ago",
    read: true,
  },
  {
    id: "n3",
    title: "Tour scheduled",
    message: "A viewing for your shortlisted home is confirmed tomorrow.",
    time: "1d ago",
    read: true,
  },
  {
    id: "n4",
    title: "Listing updated",
    message: "One of your saved homes changed its asking price.",
    time: "3d ago",
    read: true,
  },
];

const MarketplaceHomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const { colors,theme } = useTheme();
  const { user, openAuth } = useAuth();
  const insets = useSafeAreaInsets();
  const {
    data: properties = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useProperties();
  const { isSaved, toggleSaved } = useSavedProperties();
  const [search, setSearch] = useState("");
  const [purpose, setPurpose] = useState<Purpose>("all");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortOption>("newest");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notifications, setNotifications] = useState<MockNotification[]>(
    MOCK_NOTIFICATIONS,
  );
  const drawerTranslate = useRef(new Animated.Value(360)).current;
  const propertyListRef = useRef<FlatList<Property> | null>(null);
  const scrollToTopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    Animated.spring(drawerTranslate, {
      toValue: notificationsVisible ? 0 : 360,
      useNativeDriver: true,
      tension: 120,
      friction: 12,
    }).start();
  }, [drawerTranslate, notificationsVisible]);

  useEffect(
    () => () => {
      if (scrollToTopTimer.current) {
        clearTimeout(scrollToTopTimer.current);
      }
    },
  );

  const handleFeedScroll = (offsetY: number) => {
    if (offsetY <= 80) {
      if (scrollToTopTimer.current) {
        clearTimeout(scrollToTopTimer.current);
        scrollToTopTimer.current = null;
      }
      setShowScrollToTop(false);
      return;
    }

    setShowScrollToTop(true);
    if (scrollToTopTimer.current) {
      clearTimeout(scrollToTopTimer.current);
    }
    scrollToTopTimer.current = setTimeout(() => {
      setShowScrollToTop(false);
      scrollToTopTimer.current = null;
    }, 2000);
  };

  const scrollFeedToTop = () => {
    propertyListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const markAllNotificationsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const handleToggleSaved = (propertyId: string) => {
    if (!user) {
      openAuth();
      return;
    }
    toggleSaved(propertyId);
  };

  const persistSearchHistory = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || !user) {
      return;
    }

    try {
      await apiRequest("POST", "/users/me/search-history", {
        query: trimmed,
        purpose,
        category: category === "All" ? undefined : category,
      });
    } catch (error) {
      console.error("Unable to save search history:", error);
    }
  };

  useEffect(() => {
    const initialSearch = route.params?.initialSearch ?? "";
    if (!initialSearch) {
      return;
    }

    setSearch(initialSearch);

    if (route.params?.initialPurpose) {
      setPurpose(route.params.initialPurpose as Purpose);
    }

    if (route.params?.initialCategory) {
      setCategory(route.params.initialCategory);
    }

  }, [route.params?.initialSearch, route.params?.initialPurpose, route.params?.initialCategory]);

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = properties.filter((property) => {
      const listing = getPublishedListing(property);
      const searchable = [
        property.name,
        property.address,
        property.estate,
        property.city,
        property.country,
        property.category,
        property.propertyType,
        property.description,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      const matchesPurpose = purpose === "all" || listing?.purpose === purpose;
      const matchesCategory =
        category === "All" ||
        property.category.toLowerCase() === category.toLowerCase();

      return matchesSearch && matchesPurpose && matchesCategory;
    });

    return [...filtered].sort((first, second) => {
      const firstListing = getPublishedListing(first);
      const secondListing = getPublishedListing(second);
      if (sort === "price-low") {
        return (
          (firstListing?.price ?? Number.MAX_SAFE_INTEGER) -
          (secondListing?.price ?? Number.MAX_SAFE_INTEGER)
        );
      }
      if (sort === "price-high") {
        return (secondListing?.price ?? 0) - (firstListing?.price ?? 0);
      }
      return (
        new Date(second.createdAt ?? 0).getTime() -
        new Date(first.createdAt ?? 0).getTime()
      );
    });
  }, [category, properties, purpose, search, sort]);

  const renderHeader = () => (
    <View
      style={{
        backgroundColor: colors.bg,
        marginBottom: 10,
        borderBottomRightRadius: 30,
        borderBottomLeftRadius: 30,
      }}
    >
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerCopy}>
          <Text style={[styles.greeting, { color: "white" }]}>
            Hello, {user?.firstName ?? "there"} !
          </Text>
          <Text style={[styles.heading, { color: "white" }]}>
            Find your next crib
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: colors.card }]}
            accessibilityRole="button"
            accessibilityLabel="Open notifications"
            onPress={() => setNotificationsVisible(true)}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            {unreadCount > 0 && <View style={styles.notificationBadge} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.card }]}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            onPress={() => navigation.navigate("Account")}
          >
            {user && user.avatar?.url ? (
              <Image source={{ uri: user?.avatar?.url }} style={styles.avatar} />
            ) : (
              <Ionicons name="person-outline" size={20} color={colors.text} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[
          styles.searchBox,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search-outline" size={21} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => {
            const trimmed = search.trim();
            if (!trimmed) {
              return;
            }
            void persistSearchHistory(trimmed);
          }}
          placeholder="Search city, neighborhood, or property type"
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { color: colors.text }]}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearch("")}
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={19} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.purposeSwitch, { backgroundColor: colors.card }]}>
        {PURPOSES.map((option) => {
          const selected = purpose === option;
          return (
            <TouchableOpacity
              key={option}
              onPress={() => setPurpose(option)}
              style={[
                styles.purposeOption,
                selected && { backgroundColor: colors.bg },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text
                style={[
                  styles.purposeLabel,
                  { color: selected ? "white" : colors.textMuted },
                ]}
              >
                {option === "all"
                  ? "All listings"
                  : option === "rent"
                    ? "Rent"
                    : "Buy"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.filterRow}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const selected = category === item;
            return (
              <TouchableOpacity
                onPress={() => setCategory(item)}
                style={[
                  styles.categoryChip,
                  { borderColor: colors.border },
                  selected && {
                    backgroundColor: "white",
                    borderColor: "white",
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: selected ? colors.bg : "white" },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
        <TouchableOpacity
          style={[
            styles.filterButton,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
          onPress={() => setFiltersVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Open filters"
        >
          <Ionicons name="options-outline" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.resultsHeader}>
        <View>
          <Text style={[styles.resultsTitle, { color: "white" }]}>
            Properties for you
          </Text>
          <Text style={[styles.resultsSubtitle, { color: colors.textMuted }]}>
            {filteredProperties.length}{" "}
            {filteredProperties.length === 1 ? "listing" : "listings"}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.sortButton, { borderColor: colors.border }]}
          onPress={() => setFiltersVisible(true)}
          accessibilityRole="button"
        >
          <Ionicons name="swap-vertical-outline" size={16} color={"white"} />
          <Text style={[styles.sortLabel, { color: "white" }]}>Sort</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={propertyListRef}
        data={filteredProperties}
        keyExtractor={(item) => item.id}
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
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : isError ? (
            <View style={styles.centerState}>
              <Ionicons
                name="cloud-offline-outline"
                size={42}
                color={colors.textMuted}
              />
              <Text style={[styles.stateTitle, { color: colors.text }]}>
                Unable to load listings
              </Text>
              <Text style={[styles.stateCopy, { color: colors.textMuted }]}>
                {error instanceof Error ? error.message : "Please try again."}
              </Text>
              <TouchableOpacity
                onPress={() => void refetch()}
                style={[
                  styles.retryButton,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.centerState}>
              <Ionicons
                name="search-outline"
                size={42}
                color={colors.textMuted}
              />
              <Text style={[styles.stateTitle, { color: colors.text }]}>
                No matching listings
              </Text>
              <Text style={[styles.stateCopy, { color: colors.textMuted }]}>
                Try another search or remove a filter.
              </Text>
            </View>
          )
        }
        contentContainerStyle={[
          { paddingBottom: insets.bottom + 120 },
          filteredProperties.length === 0 && { flex: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={(event) =>
          handleFeedScroll(event.nativeEvent.contentOffset.y)
        }
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => void refetch()}
            tintColor={colors.primary}
          />
        }
      />

      {showScrollToTop && (
        <Pressable
          style={[
            styles.scrollToTopButton,
            {
              backgroundColor: colors.bg,
              borderColor: 'white',
              bottom: insets.bottom + 98,
              
            },
          ]}
          onPress={scrollFeedToTop}
          accessibilityRole="button"
          accessibilityLabel="Scroll to top"
          hitSlop={8}
        >
          <Ionicons name="arrow-up" size={22} color={'white'} />
        </Pressable>
      )}

      <Modal
        visible={filtersVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFiltersVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setFiltersVisible(false)}
          />
          <View
            style={[
              styles.filterSheet,
              {
                backgroundColor: colors.background,
                paddingBottom: insets.bottom + 18,
              },
            ]}
          >
            <View style={styles.sheetHeader}>
              <View>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>
                  Sort listings
                </Text>
                <Text
                  style={[styles.sheetSubtitle, { color: colors.textMuted }]}
                >
                  Choose how results should appear
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setFiltersVisible(false)}
                accessibilityLabel="Close filters"
              >
                <Ionicons name="close" size={25} color={colors.text} />
              </TouchableOpacity>
            </View>
            {(
              [
                ["newest", "Newest first"],
                ["price-low", "Lowest price"],
                ["price-high", "Highest price"],
              ] as const
            ).map(([value, label]) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.sortOption,
                  { borderColor: colors.border },
                  sort === value && {
                    borderColor: colors.primary,
                    backgroundColor: colors.card,
                  },
                ]}
                onPress={() => {
                  setSort(value);
                  setFiltersVisible(false);
                }}
              >
                <Text style={[styles.sortOptionText, { color: colors.text }]}>
                  {label}
                </Text>
                {sort === value && (
                  <Ionicons
                    name="checkmark-circle"
                    size={21}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => {
                setCategory("All");
                setPurpose("all");
                setSearch("");
                setSort("newest");
                setFiltersVisible(false);
              }}
              style={styles.clearButton}
            >
              <Text style={[styles.clearButtonText, { color: colors.primary }]}>
                Clear all filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={notificationsVisible}
        transparent
        animationType="none"
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <Pressable
          style={styles.notificationBackdrop}
          onPress={() => setNotificationsVisible(false)}
        />

        <Animated.View
          style={[
            styles.notificationDrawer,
            {
              backgroundColor: colors.card,
              transform: [{ translateX: drawerTranslate }],
            },
          ]}
        >
          <View style={styles.notificationHeader}>
            <View>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>
                Notifications
              </Text>
              <Text style={[styles.notificationCount, { color: colors.textMuted }]}>
                {notifications.length} total
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setNotificationsVisible(false)}
              accessibilityLabel="Close notifications"
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.notificationActions}>
            <TouchableOpacity
              style={[
                styles.notificationActionButton,
                { borderColor: colors.border, backgroundColor: colors.background },
              ]}
              onPress={markAllNotificationsRead}
            >
              <Text style={[styles.notificationActionText, { color: colors.text }]}>
                Read all
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.notificationActionButton,
                { borderColor: colors.border, backgroundColor: colors.background },
              ]}
              onPress={clearNotifications}
            >
              <Text style={[styles.notificationActionText, { color: colors.text }]}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.notificationList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyNotifications}>
                <Ionicons name="notifications-off-outline" size={30} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  No notifications
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View
                style={[
                  styles.notificationItem,
                  {
                    backgroundColor: item.read ? colors.background : colors.card,
                    borderColor: item.read ? colors.border : colors.primary,
                  },
                ]}
              >
                {!item.read && <View style={styles.unreadDot} />}
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationItemTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.notificationItemMessage, { color: colors.textMuted }]}>
                    {item.message}
                  </Text>
                </View>
                <Text style={[styles.notificationTime, { color: colors.textMuted }]}>
                  {item.time}
                </Text>
              </View>
            )}
          />
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollToTopButton: {
    position: "absolute",
    right: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 5,
  },
  //   listContent: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 18,
    marginVertical: 10,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  headerCopy: { flex: 1, paddingRight: 12 },
  avatar: { width: "100%", height: "100%", borderRadius: 21 },
  greeting: { fontSize: 13, marginBottom: 4 },
  heading: { fontSize: 24, fontWeight: "800", lineHeight: 30 },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ef4444",
    position: "absolute",
    right: 8,
    top: 7,
    borderWidth: 2,
    borderColor: "white",
  },
  searchBox: {
    height: 52,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginHorizontal: 16,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  purposeSwitch: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 4,
    marginTop: 14,
    marginHorizontal: 16,
  },
  purposeOption: {
    flex: 1,
    minHeight: 40,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  purposeLabel: { fontSize: 13, fontWeight: "700" },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    //   marginHorizontal: 16,
    paddingHorizontal: 12,
  },
  categoryList: { gap: 8, paddingRight: 8 },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  categoryLabel: { fontSize: 12, fontWeight: "600" },
  filterButton: {
    width: 40,
    height: 38,
    borderWidth: 1,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 25,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  resultsTitle: { fontSize: 19, fontWeight: "800" },
  resultsSubtitle: { fontSize: 12, marginTop: 3 },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sortLabel: { fontSize: 12, fontWeight: "600" },
  centerState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 70,
    paddingHorizontal: 24,
  },
  stateTitle: { fontSize: 17, fontWeight: "700", marginTop: 12 },
  stateCopy: { fontSize: 13, textAlign: "center", marginTop: 6 },
  retryButton: {
    borderRadius: 7,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 16,
  },
  retryText: { color: "white", fontWeight: "700" },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  filterSheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  sheetTitle: { fontSize: 20, fontWeight: "800" },
  sheetSubtitle: { fontSize: 13, marginTop: 4 },
  sortOption: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sortOptionText: { fontSize: 14, fontWeight: "600" },
  clearButton: { alignItems: "center", paddingVertical: 14 },
  clearButtonText: { fontSize: 14, fontWeight: "700" },
  notificationBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  notificationDrawer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "86%",
    paddingTop: 28,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: -6, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 10,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  notificationTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  notificationCount: {
    fontSize: 12,
    marginTop: 4,
  },
  notificationActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  notificationActionButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  notificationActionText: {
    fontSize: 13,
    fontWeight: "700",
  },
  notificationList: {
    paddingBottom: 12,
    gap: 10,
  },
  notificationItem: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3b82f6",
    marginTop: 6,
  },
  notificationContent: {
    flex: 1,
  },
  notificationItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  notificationItemMessage: {
    fontSize: 12,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyNotifications: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default MarketplaceHomeScreen;
