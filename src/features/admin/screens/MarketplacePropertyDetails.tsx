import React, { useEffect, useSyncExternalStore, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useAuth } from "../../auth/AuthContext";
import { apiRequest, getQueryFn } from "../../../shared/queryClient";
import { adminPropertyStore } from "../../../data/adminPropertyStore";
import {
  getListingPriceLabel,
  getPropertyDisplayLocation,
  MarketplacePropertyRecord,
  parsePropertyListResponse,
  Property,
} from "../../../data/property";

type Props = { propertyId: string };

export function MarketplacePropertyDetails({ propertyId }: Props) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const properties = useSyncExternalStore(
    adminPropertyStore.subscribeMarketplace,
    adminPropertyStore.getMarketplaceSnapshot,
    adminPropertyStore.getMarketplaceSnapshot,
  );
  const localProperty = properties.find((item) => item.id === propertyId);
  const serverQuery = useQuery({
    queryKey: ["properties", "marketplace", "manage"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !localProperty,
    select: (response: unknown) =>
      parsePropertyListResponse(response).properties,
  });
  const property =
    localProperty ?? serverQuery.data?.find((item) => item.id === propertyId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<
    MarketplacePropertyRecord | Property | null
  >(property ?? null);

  useEffect(() => {
    if (property) setDraft(property);
  }, [property]);

  if (!property || !draft) {
    if (serverQuery.isLoading) return null;
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Listing not found
        </Text>
      </View>
    );
  }

  const listing = draft.listings[0];
  const isLocalProperty = Boolean(localProperty);
  const canManage =
    isLocalProperty ||
    ["admin", "propertyManager"].includes(user?.role ?? "");
  const updateDraft = (
    updates: Partial<MarketplacePropertyRecord | Property>,
  ) => {
    setDraft((current) => (current ? { ...current, ...updates } : current));
  };
  const updateListing = (updates: Partial<typeof listing>) => {
    updateDraft({ listings: [{ ...listing, ...updates }] });
  };
  const save = async () => {
    try {
      if (isLocalProperty) {
        adminPropertyStore.updateMarketplace(
          draft.id,
          draft as MarketplacePropertyRecord,
        );
      } else {
        await apiRequest("PATCH", `/properties/marketplace/${draft.id}`, {
          property: { name: draft.name, description: draft.description },
          listingId: listing.id,
          listing: { price: listing.price },
        });
        await queryClient.invalidateQueries({
          queryKey: ["properties", "marketplace", "manage"],
        });
        await queryClient.invalidateQueries({ queryKey: ["properties"] });
      }
      setEditing(false);
      Alert.alert("Listing updated", "The marketplace listing has been saved.");
    } catch (error) {
      Alert.alert(
        "Update failed",
        error instanceof Error ? error.message : "Unable to save changes.",
      );
    }
  };
  const updateModeration = (
    status: NonNullable<MarketplacePropertyRecord["moderationStatus"]>,
  ) => {
    void (async () => {
      try {
        if (isLocalProperty) {
          adminPropertyStore.updateMarketplaceModeration(draft.id, status);
        } else {
          await apiRequest(
            "PATCH",
            `/properties/marketplace/${draft.id}/moderation`,
            { status },
          );
          await queryClient.invalidateQueries({
            queryKey: ["properties", "marketplace", "manage"],
          });
          await queryClient.invalidateQueries({ queryKey: ["properties"] });
        }
        setEditing(false);
      } catch (error) {
        Alert.alert(
          "Moderation failed",
          error instanceof Error ? error.message : "Unable to update status.",
        );
      }
    })();
  };
  const remove = () => {
    Alert.alert("Delete listing", "Delete this marketplace listing?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              if (isLocalProperty) {
                adminPropertyStore.removeMarketplace(draft.id);
                navigation.goBack();
                return;
              }

              await apiRequest("DELETE", `/properties/marketplace/${draft.id}`);
              await queryClient.invalidateQueries({
                queryKey: ["properties", "marketplace", "manage"],
              });
              await queryClient.invalidateQueries({ queryKey: ["properties"] });
              navigation.goBack();
              Alert.alert("Listing deleted", "The marketplace listing has been removed.");
            } catch (error) {
              Alert.alert(
                "Delete failed",
                error instanceof Error ? error.message : "Unable to delete listing.",
              );
            }
          })();
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
        {isLocalProperty && (
          <Pressable onPress={remove} accessibilityLabel="Delete listing">
            <Ionicons
              name="trash-outline"
              size={22}
              color={colors.destructive}
            />
          </Pressable>
        )}
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
            {draft.moderationStatus ?? "pending"}
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
        {canManage && (
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
        )}
        {editing && canManage ? (
          <Pressable
            style={[styles.save, { backgroundColor: colors.primary }]}
            onPress={save}
          >
            <Text style={styles.actionText}>Save changes</Text>
          </Pressable>
        ) : canManage ? (
          <Pressable
            style={[styles.save, { borderColor: colors.border }]}
            onPress={() => setEditing(true)}
          >
            <MaterialIcons name="edit" size={18} color={colors.text} />
            <Text style={[styles.editText, { color: colors.text }]}>
              Edit listing
            </Text>
          </Pressable>
        ) : null}
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
