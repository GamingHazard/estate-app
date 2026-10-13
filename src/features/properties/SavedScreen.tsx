import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useTheme } from "../../shared/theme/ThemeContext";
import {
  formatPropertyPrice,
  getPropertyDisplayLocation,
} from "../../data/property";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "../../shared/types";
import SkeletonLoader from "../../shared/components/SkeletonLoader";
import { useSavedProperties } from "./SavedPropertiesContext";
import { useProperties } from "./useProperties";

const SavedScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { savedPropertyIds } = useSavedProperties();
  const {
    data: properties = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useProperties();
  const savedProperties = properties.filter((property) =>
    savedPropertyIds.includes(property.id),
  );

  const noImage =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/624px-No-Image-Placeholder.svg.png";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={isFetching}
          onRefresh={() => void refetch()}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.text }]}>
          Saved Properties
        </Text>
      </View>
      {isLoading ? (
        <View style={styles.content}>
          <SkeletonLoader
            style={{
              width: "100%",
              height: 120,
              borderRadius: 10,
              marginBottom: 15,
            }}
          />
          <SkeletonLoader
            style={{
              width: "100%",
              height: 120,
              borderRadius: 10,
              marginBottom: 15,
            }}
          />
          <SkeletonLoader
            style={{
              width: "100%",
              height: 120,
              borderRadius: 10,
              marginBottom: 15,
            }}
          />
          <SkeletonLoader
            style={{
              width: "100%",
              height: 120,
              borderRadius: 10,
              marginBottom: 15,
            }}
          />
        </View>
      ) : isError ? (
        <View style={styles.content}>
          <Text style={{ color: colors.text, marginBottom: 12 }}>
            {error instanceof Error
              ? error.message
              : "Unable to load properties."}
          </Text>
          <TouchableOpacity onPress={() => void refetch()}>
            <Text style={{ color: colors.primary }}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          {savedProperties.length > 0 ? (
            savedProperties.map((property) => (
              <TouchableOpacity
                key={property.id}
                style={[styles.card, { backgroundColor: colors.card }]}
                onPress={() =>
                  navigation.navigate("PropertyDetails", { property })
                }
              >
                <Image
                  source={{ uri: property.images[0]?.url || noImage }}
                  style={styles.cardImage}
                />
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    {property.name}
                  </Text>
                  <Text
                    style={[styles.cardLocation, { color: colors.textMuted }]}
                  >
                    {getPropertyDisplayLocation(property)}
                  </Text>
                  <Text style={[styles.cardPrice, { color: colors.primary }]}>
                    {formatPropertyPrice(property.pricePerUnit)} / unit
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                You haven't saved any properties yet.
              </Text>
            </View>
          )}
        </View>
      )}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  clearButton: {
    backgroundColor: "#ff3b30",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  card: {
    flexDirection: "row",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 3,
  },
  cardImage: {
    width: 120,
    height: "100%",
  },
  cardContent: {
    flex: 1,
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardLocation: {
    fontSize: 14,
    color: "gray",
    marginVertical: 5,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 16,
    color: "gray",
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 50,
  },
});

export default SavedScreen;
