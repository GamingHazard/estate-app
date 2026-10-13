import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getQueryFn } from "../../shared/queryClient";
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

type PublicProfileResponse = { user: PublicListerProfile };
type Props = {
  route: RouteProp<RootStackParamList, "Lister Profile">;
};

const ListerProfileScreen = ({ route }: Props) => {
  const { userId } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user: signedInUser, openAuth } = useAuth();
  const { isSaved, toggleSaved } = useSavedProperties();
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
  const lister = useMockProperties
    ? mockListerProfiles.find((profile) => profile.id === userId)
    : profileResponse?.user;
  const listerProperties = properties.filter(
    (property) =>
      property.ownerId === userId &&
      getPublishedListing(property)?.status === "published",
  );
  const isLoading = profileLoading || propertiesLoading;

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
                      justifyContent: "flex-start",
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
                    style={{
                      alignItems: "flex-start",
                      flex: 1,
                      height: "100%",
                    }}
                  >
                    <Text style={[styles.name, { color: colors.text }]}>
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
                    <Text
                      style={[styles.reviewCopy, { color: colors.textMuted }]}
                    >
                      Reviews will be available in a future update.
                    </Text>
                  </View>
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
    // alignItems: "center",
    // paddingTop: 28,
    // paddingBottom: 22,
    borderBottomWidth: 1,
    height: 200,
    paddingVertical: 12,
  },
  avatarWrap: {
    width: "50%",
    height: "100%",
    borderRadius: 8,
    alignItems: "center",
    overflow: "hidden",
    marginHorizontal: 16,
  },
  avatar: { width: "100%", height: "100%" },
  name: { fontSize: 22, fontWeight: "800" },
  role: { fontSize: 14, fontWeight: "700", marginTop: 5 },
  listingCount: { fontSize: 13, marginTop: 8 },
  section: { padding: 18, borderBottomWidth: 1 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  bio: { fontSize: 14, lineHeight: 21, marginTop: 8 },
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
