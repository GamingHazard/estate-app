import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../shared/theme/ThemeContext";
import {
  formatPropertyPrice,
  getPropertyDisplayLocation,
} from "../../data/property";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "../../shared/types";
import { useSavedProperties } from "./SavedPropertiesContext";

const SavedScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const {
    savedProperties,
    isLoading,
    loadError,
    reloadSavedProperties,
  } = useSavedProperties();

  const noImage =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/624px-No-Image-Placeholder.svg.png";

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.text }]}>
          Saved Properties
        </Text>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : loadError ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Unable to load saved properties.
            </Text>
            <Text style={[styles.emptySubText, { color: colors.textMuted }]}>
              {loadError}
            </Text>
            <TouchableOpacity onPress={reloadSavedProperties}>
              <Text style={[styles.emptySubText, { color: colors.primary }]}>
                Try again
              </Text>
            </TouchableOpacity>
          </View>
        ) : savedProperties.length > 0 ? (
          savedProperties.map((property) => (
            <TouchableOpacity
              key={property.id}
              style={[styles.card, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate("PropertyDetails", { property })}
            >
              <Image
                source={{ uri: property.images[0]?.url || noImage }}
                style={styles.cardImage}
              />
              <View style={styles.cardContent}>
                <Text
                  style={[styles.cardTitle, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {property.name}
                </Text>
                <Text
                  style={[styles.cardLocation, { color: colors.textMuted }]}
                  numberOfLines={2}
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
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    flexDirection: "row",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 3,
  },
  cardImage: {
    width: 112,
    aspectRatio: 1,
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
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
