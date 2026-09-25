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
import { adminPropertyStore } from "../../../data/adminPropertyStore";
import { PropertyCreation } from "./PropertyCreation";

type NavigationProp = StackNavigationProp<RootStackParamList>;

export function PropertiesManagement() {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [isCreationVisible, setCreationVisible] = useState(false);
  const properties = useSyncExternalStore(
    adminPropertyStore.subscribe,
    adminPropertyStore.getSnapshot,
    adminPropertyStore.getSnapshot,
  );
  const isLoading = false;

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
    item: (typeof properties)[number];
  }) => (
    <Pressable
      style={styles.propertyCard}
      onPress={() =>
        navigation.navigate("AdminPropertyDetails", { propertyId: property.id })
      }
    >
      <View style={styles.propertyHeader}>
        <Image
          source={{ uri: property.images[0]?.url }}
          style={styles.propertyImage}
        />
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle}>{property.name}</Text>
          <Text style={styles.propertyLocation}>
            {[property.city, property.country].filter(Boolean).join(", ") ||
              property.address}
          </Text>
          <View style={[styles.badge, getBadgeStyle(property.status)]}>
            <Text style={styles.badgeText}>{property.status}</Text>
          </View>
          <Text style={styles.agentInfo}>
            {property.owner ? `Owner: ${property.owner}` : "Owner not assigned"}
          </Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <Pressable
          style={styles.button}
          onPress={() =>
            navigation.navigate("AdminPropertyDetails", {
              propertyId: property.id,
            })
          }
        >
          <Text style={styles.buttonText}>View Details</Text>
        </Pressable>
        <Pressable style={[styles.button, { padding: 8 }]} onPress={() => {}}>
          <MaterialIcons name="more-vert" size={16} color={colors.text} />
        </Pressable>
      </View>
    </Pressable>
  );

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
          <Text style={styles.statsValue}>{properties.length}</Text>
          <Text style={styles.statsDescription}>
            Active listings in the system
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
            {
              properties.filter((property) => property.status === "pending")
                .length
            }
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
            {
              properties.filter((property) => property.status === "rejected")
                .length
            }
          </Text>
          <Text style={styles.statsDescription}>
            Properties with active reports
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={properties}
          renderItem={renderPropertyItem}
          keyExtractor={(item) => item.id}
          style={styles.propertiesList}
          contentContainerStyle={styles.listContent}
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
            <PropertyCreation onClose={() => setCreationVisible(false)} />
          </View>
        </View>
      </Modal>
      <View style={{ height: 70, width: "100%" }} />
    </View>
  );
}
