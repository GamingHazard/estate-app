import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../shared/theme/ThemeContext";
import {
  formatListingPrice,
  getListingPriceLabel,
  getPropertyCardFacts,
  getPropertyDisplayLocation,
  getPublishedListing,
  Property,
} from "../../data/property";

const NO_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/624px-No-Image-Placeholder.svg.png";

type Props = {
  property: Property;
  saved: boolean;
  onPress: () => void;
  onToggleSaved: () => void;
};

export default function PropertyListingCard({
  property,
  saved,
  onPress,
  onToggleSaved,
}: Props) {
  const { colors } = useTheme();
  const listing = getPublishedListing(property);
  const facts = getPropertyCardFacts(property);
  const location = [property.estate, property.city].filter(Boolean).join(", ");

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={`Open ${property.name}`}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: property.images[0]?.url || NO_IMAGE }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
        <View style={styles.badgeRow}>
          <View
            style={[styles.purposeBadge, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.purposeText}>
              {(listing?.purpose ?? "rent").toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={onToggleSaved}
            accessibilityRole="button"
            accessibilityLabel={
              saved ? "Remove saved property" : "Save property"
            }
          >
            <Ionicons
              name={saved ? "bookmark" : "bookmark-outline"}
              size={20}
              color="white"
            />
          </TouchableOpacity>
        </View>
        {property.images.length > 1 && (
          <View style={styles.photoCount}>
            <Ionicons name="images-outline" size={13} color="white" />
            <Text style={styles.photoCountText}>{property.images.length}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
          >
            {property.name}
          </Text>
          <Text
            style={[styles.type, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {property.propertyType}
          </Text>
        </View>
        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={15}
            color={colors.textMuted}
          />
          <Text
            style={[styles.location, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {location || getPropertyDisplayLocation(property)}
          </Text>
        </View>
        <Text style={[styles.price, { color: colors.primary }]}>
          {listing
            ? getListingPriceLabel(listing)
            : formatListingPrice(listing)}
        </Text>
        {facts.length > 0 && (
          <View style={styles.factRow}>
            {facts.map((fact) => (
              <Text
                key={fact}
                style={[styles.fact, { color: colors.text }]}
                numberOfLines={1}
              >
                {fact}
              </Text>
            ))}
          </View>
        )}
        {property.features.length > 0 && (
          <Text
            style={[styles.features, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {property.features.slice(0, 2).join(" · ")}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    marginHorizontal: 16,
  },
  imageWrap: {
    height: 210,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  badgeRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  purposeBadge: {
    borderRadius: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  purposeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  saveButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  photoCount: {
    position: "absolute",
    right: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  photoCountText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  content: {
    padding: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
  },
  type: {
    maxWidth: "35%",
    fontSize: 11,
    textTransform: "capitalize",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 7,
  },
  location: {
    flex: 1,
    fontSize: 13,
  },
  price: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 13,
  },
  factRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 9,
  },
  fact: {
    flexShrink: 1,
    fontSize: 12,
  },
  features: {
    fontSize: 12,
    marginTop: 8,
  },
});
