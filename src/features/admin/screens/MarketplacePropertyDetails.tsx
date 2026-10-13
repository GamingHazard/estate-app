import React, { useSyncExternalStore, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { adminPropertyStore } from "../../../data/adminPropertyStore";
import {
  getListingPriceLabel,
  getPropertyDisplayLocation,
  MarketplacePropertyRecord,
} from "../../../data/property";

type Props = { propertyId: string };

export function MarketplacePropertyDetails({ propertyId }: Props) {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const properties = useSyncExternalStore(
    adminPropertyStore.subscribeMarketplace,
    adminPropertyStore.getMarketplaceSnapshot,
    adminPropertyStore.getMarketplaceSnapshot,
  );
  const property = properties.find((item) => item.id === propertyId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<MarketplacePropertyRecord | null>(
    property ?? null,
  );

  if (!property || !draft) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Listing not found
        </Text>
      </View>
    );
  }

  const listing = draft.listings[0];
  const updateDraft = (updates: Partial<MarketplacePropertyRecord>) => {
    setDraft((current) => (current ? { ...current, ...updates } : current));
  };
  const updateListing = (updates: Partial<typeof listing>) => {
    updateDraft({ listings: [{ ...listing, ...updates }] });
  };
  const save = () => {
    adminPropertyStore.updateMarketplace(draft.id, draft);
    setEditing(false);
    Alert.alert("Listing updated", "The marketplace listing has been saved.");
  };
  const updateModeration = (
    status: MarketplacePropertyRecord["moderationStatus"],
  ) => {
    adminPropertyStore.updateMarketplaceModeration(draft.id, status);
    setEditing(false);
  };
  const remove = () => {
    Alert.alert("Delete listing", "Delete this marketplace listing?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          adminPropertyStore.removeMarketplace(draft.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>
          Manage listing
        </Text>
        <Pressable onPress={remove} accessibilityLabel="Delete listing">
          <Ionicons name="trash-outline" size={22} color={colors.destructive} />
        </Pressable>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {draft.images[0] && (
          <Image source={{ uri: draft.images[0].url }} style={styles.hero} />
        )}
        {editing ? (
          <>
            <Text style={[styles.label, { color: colors.text }]}>
              Property name
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              value={draft.name}
              onChangeText={(value) => updateDraft({ name: value })}
            />
            <Text style={[styles.label, { color: colors.text }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              value={draft.description}
              onChangeText={(value) => updateDraft({ description: value })}
              multiline
            />
            <Text style={[styles.label, { color: colors.text }]}>
              Listing price
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              value={String(listing.price)}
              onChangeText={(value) =>
                updateListing({ price: Number(value) || 0 })
              }
              keyboardType="numeric"
            />
          </>
        ) : (
          <>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {listing.purpose.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.heading, { color: colors.text }]}>
              {draft.name}
            </Text>
            <Text style={[styles.muted, { color: colors.textMuted }]}>
              {getPropertyDisplayLocation(draft)}
            </Text>
            <Text style={[styles.price, { color: colors.primary }]}>
              {getListingPriceLabel(listing)}
            </Text>
            <Text style={[styles.muted, { color: colors.textMuted }]}>
              {draft.description}
            </Text>
          </>
        )}
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Listing status
        </Text>
        <View style={styles.statusRow}>
          <Text style={[styles.muted, { color: colors.textMuted }]}>
            Moderation
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {draft.moderationStatus}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={[styles.muted, { color: colors.textMuted }]}>
            Visibility
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {listing.status}
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            style={[styles.action, { backgroundColor: colors.primary }]}
            onPress={() => updateModeration("approved")}
          >
            <Text style={styles.actionText}>Approve</Text>
          </Pressable>
          <Pressable
            style={[styles.action, { backgroundColor: colors.warning }]}
            onPress={() => updateModeration("pending")}
          >
            <Text style={styles.actionText}>Pending</Text>
          </Pressable>
          <Pressable
            style={[styles.action, { backgroundColor: colors.destructive }]}
            onPress={() => updateModeration("rejected")}
          >
            <Text style={styles.actionText}>Reject</Text>
          </Pressable>
        </View>
        {editing ? (
          <Pressable
            style={[styles.save, { backgroundColor: colors.primary }]}
            onPress={save}
          >
            <Text style={styles.actionText}>Save changes</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.save, { borderColor: colors.border }]}
            onPress={() => setEditing(true)}
          >
            <MaterialIcons name="edit" size={18} color={colors.text} />
            <Text style={[styles.editText, { color: colors.text }]}>
              Edit listing
            </Text>
          </Pressable>
        )}
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Units and details
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {draft.units.length
            ? `${draft.units.length} unit(s)`
            : "No separate units"}
        </Text>
        {draft.units.map((unit) => (
          <View
            key={unit.id ?? unit.unitNumber}
            style={[styles.unit, { borderColor: colors.border }]}
          >
            <Text style={[styles.value, { color: colors.text }]}>
              {unit.unitNumber} · {unit.unitType}
            </Text>
            <Text style={[styles.muted, { color: colors.textMuted }]}>
              {unit.description || "No unit description"}
            </Text>
            <Text style={[styles.muted, { color: colors.textMuted }]}>
              {unit.isAvailable ? "Available" : "Unavailable"}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: { fontSize: 21, fontWeight: "800" },
  card: { borderWidth: 1, borderRadius: 10, padding: 16, marginBottom: 14 },
  hero: { width: "100%", height: 210, borderRadius: 8, marginBottom: 14 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#3478F6",
    borderRadius: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  badgeText: { color: "white", fontSize: 11, fontWeight: "800" },
  heading: { fontSize: 23, fontWeight: "800", marginTop: 10 },
  sectionTitle: { fontSize: 17, fontWeight: "800", marginBottom: 12 },
  muted: { fontSize: 14, lineHeight: 21, marginTop: 6 },
  price: { fontSize: 22, fontWeight: "800", marginTop: 14 },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 7, padding: 11, marginBottom: 13 },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
  },
  value: { fontSize: 15, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 8, marginTop: 10 },
  action: {
    flex: 1,
    alignItems: "center",
    borderRadius: 7,
    paddingVertical: 10,
  },
  actionText: { color: "white", fontWeight: "800" },
  save: {
    minHeight: 46,
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  editText: { fontWeight: "700" },
  unit: { borderTopWidth: 1, marginTop: 12, paddingTop: 12 },
});
