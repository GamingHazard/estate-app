import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../shared/theme/ThemeContext";
import { useAuth } from "../auth/AuthContext";
import { NavigationProp } from "../../shared/types";
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

const MarketplaceHomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
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

  const handleToggleSaved = (propertyId: string) => {
    if (!user) {
      openAuth();
      return;
    }
    toggleSaved(propertyId);
  };

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
        ListHeaderComponent={renderHeader}
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
          { paddingBottom: insets.bottom + 24 },
          filteredProperties.length === 0 && { flex: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => void refetch()}
            tintColor={colors.primary}
          />
        }
      />

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
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
});

export default MarketplaceHomeScreen;
