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
  getListingPriceLabel,
  getPropertyDisplayLocation,
  Property,
} from "../../data/property";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NavigationProp } from "../../shared/types";
import SkeletonLoader from "../../shared/components/SkeletonLoader";
import { useProperties } from "./useProperties";

const DealsScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const {
    data: properties = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useProperties();
  const getPublishedOffer = (property: Property) =>
    property.listings.find((listing) => listing.status === "published");
  const getDisplayPrice = (property: Property) => {
    const listing = getPublishedOffer(property);
    return listing
      ? getListingPriceLabel(listing)
      : `${formatPropertyPrice(property.pricePerUnit)} / unit`;
  };
  const visibleProperties = properties.filter(
    (property) =>
      property.listings.length === 0 || Boolean(getPublishedOffer(property)),
  );
  const propertiesWithUnits = visibleProperties.filter(
    (property) => property.unitsAvailable > 0 || property.units.length > 0,
  );
  const lowestPriceProperties = [...visibleProperties]
    .sort(
      (a, b) =>
        (getPublishedOffer(a)?.price ?? a.pricePerUnit) -
        (getPublishedOffer(b)?.price ?? b.pricePerUnit),
    )
    .slice(0, 5);

  const onRefresh = React.useCallback(() => {
    void refetch();
  }, [refetch]);

  const noImage =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/624px-No-Image-Placeholder.svg.png";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={isFetching}
          onRefresh={onRefresh}
          tintColor={colors.text}
          titleColor={colors.text}
          title="Pull to refresh"
          progressBackgroundColor={colors.card}
        />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.text }]}>
          Properties
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.section}>
          <SkeletonLoader
            style={{ width: 150, height: 24, marginBottom: 15 }}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <SkeletonLoader
              style={{
                width: 250,
                height: 200,
                borderRadius: 10,
                marginRight: 15,
              }}
            />
            <SkeletonLoader
              style={{
                width: 250,
                height: 200,
                borderRadius: 10,
                marginRight: 15,
              }}
            />
          </ScrollView>
          <SkeletonLoader
            style={{ width: 200, height: 24, marginTop: 20, marginBottom: 15 }}
          />
          <SkeletonLoader
            style={{
              width: "100%",
              height: 100,
              borderRadius: 10,
              marginBottom: 15,
            }}
          />
          <SkeletonLoader
            style={{
              width: "100%",
              height: 100,
              borderRadius: 10,
              marginBottom: 15,
            }}
          />
        </View>
      ) : isError ? (
        <View style={styles.section}>
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
        <>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Available Units
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {propertiesWithUnits.map((property) => (
                <TouchableOpacity
                  key={property.id}
                  style={styles.card}
                  onPress={() =>
                    navigation.navigate("PropertyDetails", { property })
                  }
                >
                  <Image
                    source={{ uri: property.images[0]?.url || noImage }}
                    style={styles.cardImage}
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.8)"]}
                    style={styles.gradient}
                  />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{property.name}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.cardPrice}>
                        {property.unitsAvailable} units · {getDisplayPrice(property)}
                      </Text>
                    </View>
                    <Text style={{ color: "#fff", fontSize: 12 }}>
                      {getPropertyDisplayLocation(property)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {propertiesWithUnits.length === 0 && (
              <Text style={{ color: colors.textMuted }}>
                No units currently listed.
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Lowest Price per Unit
            </Text>
            {lowestPriceProperties.length > 0 ? (
              lowestPriceProperties.map((property) => (
                <TouchableOpacity
                  key={property.id}
                  style={[styles.listItem, { backgroundColor: colors.card }]}
                  onPress={() =>
                    navigation.navigate("PropertyDetails", { property })
                  }
                >
                  <Image
                    source={{ uri: property.images[0]?.url || noImage }}
                    style={styles.listItemImage}
                  />
                  <View style={styles.listItemContent}>
                    <Text
                      style={[styles.listItemTitle, { color: colors.text }]}
                    >
                      {property.name}
                    </Text>
                    <Text style={{ color: colors.textMuted }}>
                      {getPropertyDisplayLocation(property)}
                    </Text>
                    <Text
                      style={[styles.listItemPrice, { color: colors.primary }]}
                    >
                      {getDisplayPrice(property)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ color: colors.textMuted }}>
                No properties found.
              </Text>
            )}
          </View>
        </>
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
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  card: {
    width: 250,
    height: 200,
    borderRadius: 10,
    marginRight: 15,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  cardContent: {
    position: "absolute",
    bottom: 10,
    left: 10,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cardPrice: {
    color: "#fff",
    fontSize: 14,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 15,
    borderRadius: 10,
    overflow: "hidden",
  },
  listItemImage: {
    width: 100,
    height: 100,
  },
  listItemContent: {
    padding: 10,
    justifyContent: "center",
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  listItemPrice: {
    fontSize: 14,
    marginTop: 5,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  oldPrice: {
    fontSize: 14,
    textDecorationLine: "line-through",
    marginRight: 10,
  },
});

export default DealsScreen;
