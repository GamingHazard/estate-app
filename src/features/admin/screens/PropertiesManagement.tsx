import React, { useState, useSyncExternalStore } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { AdminLayout } from "./AdminLayout";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../shared/types/navigation";
import {
  AdminProperty,
  adminPropertyStore,
} from "../../../data/adminPropertyStore";
import {
  getListingPriceLabel,
  getPropertyDisplayLocation,
  MarketplacePropertyRecord,
  Property,
} from "../../../data/property";
import { MarketplacePropertyCreation } from "./MarketplacePropertyCreation";
import { useProperties } from "../../properties/useProperties";

type NavigationProp = StackNavigationProp<RootStackParamList>;
type ManagementProperty =
  | { source: "local"; property: AdminProperty }
  | { source: "api"; property: Property }
  | { source: "marketplace"; property: MarketplacePropertyRecord };

export function PropertiesManagement() {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [isCreationVisible, setCreationVisible] = useState(false);
  const properties = useSyncExternalStore(
    adminPropertyStore.subscribe,
    adminPropertyStore.getSnapshot,
    adminPropertyStore.getSnapshot,
  );
  const marketplaceProperties = useSyncExternalStore(
    adminPropertyStore.subscribeMarketplace,
    adminPropertyStore.getMarketplaceSnapshot,
    adminPropertyStore.getMarketplaceSnapshot,
  );
  const {
    data: apiProperties = [],
    isLoading: isApiLoading,
    isError: isApiError,
    error: apiError,
    refetch,
  } = useProperties();
  const displayProperties: ManagementProperty[] = [
    ...apiProperties.map((property) => ({ source: "api" as const, property })),
    ...marketplaceProperties.map((property) => ({
      source: "marketplace" as const,
      property,
    })),
    ...properties.map((property) => ({ source: "local" as const, property })),
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    statsContainer: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
      position: "relative",
    },
    statsCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    listContent: {
      paddingBottom: 16,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
    },
    statsValue: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },
    statsDescription: {
      fontSize: 12,
      color: colors.textMuted,
    },
    pageHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    pageTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    addButtonText: {
      color: "white",
      fontSize: 14,
      fontWeight: "600",
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0, 0, 0, 0.45)",
    },
    modalContent: {
      height: "94%",
      backgroundColor: colors.background,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      overflow: "hidden",
    },
    propertiesList: {
      marginTop: 16,
    },
    propertyCard: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    propertyHeader: {
      flexDirection: "row",
      gap: 12,
    },
    propertyImage: {
      width: 64,
      height: 64,
      borderRadius: 4,
    },
    propertyInfo: {
      flex: 1,
    },
    propertyTitle: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
    },
    propertyLocation: {
      fontSize: 14,
      color: colors.textMuted,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginTop: 4,
    },
    badgeText: {
      fontSize: 12,
      color: "white",
    },
    agentInfo: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 4,
    },
    actionButtons: {
      flexDirection: "row",
      gap: 8,
      marginTop: 8,
    },
    button: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonText: {
      fontSize: 14,
      color: colors.text,
    },
  });

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case "active":
        return { backgroundColor: colors.primary };
      case "pending":
        return { backgroundColor: colors.warning };
      default:
        return { backgroundColor: colors.error };
    }
  };

  const renderPropertyItem = ({
    item: property,
  }: {
    item: ManagementProperty;
  }) => {
    const isApiProperty = property.source === "api";
    const isMarketplaceProperty = property.source === "marketplace";
    const details = property.property;
    const location =
      property.source === "api" || isMarketplaceProperty
        ? getPropertyDisplayLocation(property.property)
        : [property.property.city, property.property.country]
            .filter(Boolean)
            .join(", ") || property.property.address;
    const openProperty = () => {
      if (property.source === "api") {
        navigation.navigate("PropertyDetails", {
          property: property.property,
        });
      } else if (isMarketplaceProperty) {
        navigation.navigate("AdminPropertyDetails", {
          propertyId: property.property.id,
        });
      } else {
        navigation.navigate("AdminPropertyDetails", {
          propertyId: property.property.id,
        });
      }
    };

    return (
      <Pressable style={styles.propertyCard} onPress={openProperty}>
        <View style={styles.propertyHeader}>
          <Image
            source={{ uri: details.images[0]?.url }}
            style={styles.propertyImage}
          />
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyTitle}>{details.name}</Text>
            <Text style={styles.propertyLocation}>{location}</Text>
            {property.source === "api" ? (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>
                  {property.property.category}
                </Text>
              </View>
            ) : isMarketplaceProperty ? (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      property.property.moderationStatus === "approved"
                        ? colors.primary
                        : colors.warning,
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {property.property.moderationStatus} ·{" "}
                  {getListingPriceLabel(property.property.listings[0])}
                </Text>
              </View>
            ) : (
              <View
                style={[styles.badge, getBadgeStyle(property.property.status)]}
              >
                <Text style={styles.badgeText}>{property.property.status}</Text>
              </View>
            )}
            {property.source === "local" && (
              <Text style={styles.agentInfo}>
                {property.property.owner
                  ? `Owner: ${property.property.owner}`
                  : "Owner not assigned"}
              </Text>
            )}
            {isMarketplaceProperty && (
              <Text style={styles.agentInfo}>
                {property.property.ownerId
                  ? `Owner: ${property.property.ownerId}`
                  : "Owner not assigned"}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.actionButtons}>
          <Pressable style={styles.button} onPress={openProperty}>
            <Text style={styles.buttonText}>View Details</Text>
          </Pressable>
          {!isApiProperty && !isMarketplaceProperty && (
            <Pressable
              style={[styles.button, { padding: 8 }]}
              onPress={() => {}}
            >
              <MaterialIcons name="more-vert" size={16} color={colors.text} />
            </Pressable>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Property Management</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => setCreationVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Add property"
        >
          <MaterialIcons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Add Property</Text>
        </Pressable>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Total Properties</Text>
            <Ionicons
              name="home-outline"
              size={16}
              color={colors.textMuted}
              style={{ position: "absolute", right: 0, top: 0 }}
            />
          </View>
          <Text style={styles.statsValue}>{displayProperties.length}</Text>
          <Text style={styles.statsDescription}>
            API listings and dashboard drafts
          </Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Pending Review</Text>
            <Ionicons
              name="hourglass-outline"
              size={16}
              color={colors.textMuted}
              style={{ position: "absolute", right: 0, top: 0 }}
            />
          </View>
          <Text style={styles.statsValue}>
            {properties.filter((property) => property.status === "pending")
              .length +
              marketplaceProperties.filter(
                (property) => property.moderationStatus === "pending",
              ).length}
          </Text>
          <Text style={styles.statsDescription}>
            Properties awaiting review
          </Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Reported</Text>
            <Ionicons
              name="flag-outline"
              style={{ position: "absolute", right: 0, top: 0 }}
              size={16}
              color={colors.textMuted}
            />
          </View>
          <Text style={styles.statsValue}>
            {properties.filter((property) => property.status === "rejected")
              .length +
              marketplaceProperties.filter(
                (property) => property.moderationStatus === "rejected",
              ).length}
          </Text>
          <Text style={styles.statsDescription}>
            Properties with active reports
          </Text>
        </View>
      </View>

      {isApiLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayProperties}
          renderItem={renderPropertyItem}
          keyExtractor={(item) => `${item.source}-${item.property.id}`}
          style={styles.propertiesList}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            isApiError ? (
              <Pressable onPress={() => void refetch()}>
                <Text style={{ color: colors.destructive, marginBottom: 12 }}>
                  {apiError instanceof Error
                    ? apiError.message
                    : "Unable to load server properties. Tap to retry."}
                </Text>
              </Pressable>
            ) : null
          }
        />
      )}
      <Modal
        visible={isCreationVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCreationVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <MarketplacePropertyCreation
              onClose={() => setCreationVisible(false)}
            />
          </View>
        </View>
      </Modal>
      <View style={{ height: 70, width: "100%" }} />
    </View>
  );
}
