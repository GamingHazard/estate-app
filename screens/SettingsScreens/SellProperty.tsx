import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Linking,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { mockAgents } from "../../data/mockAgents";
import { useTheme } from "../../context/ThemeContext";

type Agent = {
  id: string;
  name: string;
  avatar?: string;
  rating: number; // 0-5
  verified?: boolean;
  propertiesCount?: number;
  phone?: string;
  about?: string;
};

export default function AgentList({ navigation }: any) {
  const agents = mockAgents;
  const { colors } = useTheme(); // theming

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    const stars = [];
    for (let i = 0; i < full; i++) {
      stars.push(
        <Ionicons key={"f" + i} name="star" size={14} color="#FFD700" />
      );
    }
    if (half) {
      stars.push(
        <Ionicons key={"h"} name="star-half" size={14} color="#FFD700" />
      );
    }
    const remaining = 5 - stars.length;
    for (let i = 0; i < remaining; i++) {
      stars.push(
        <Ionicons key={"e" + i} name="star-outline" size={14} color="#FFD700" />
      );
    }
    return <View style={styles.starRow}>{stars}</View>;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={agents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Agent Profile", { agent: item });
            }}
            style={[
              styles.item,
              {
                backgroundColor: colors.card,
                borderRadius: 10,
                marginVertical: 2,
                marginHorizontal: 4,
              },
            ]}
            activeOpacity={0.8}
          >
            <Image
              source={{
                uri:
                  item.avatar ||
                  "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
              }}
              style={styles.avatar}
            />
            <View style={styles.info}>
              <View style={styles.row}>
                <Text style={[styles.name, { color: colors.text }]}>
                  {item.name}
                </Text>
                {item.verified && (
                  <View style={styles.verified}>
                    <FontAwesome5
                      name="check-circle"
                      size={14}
                      color={colors.primary}
                    />
                  </View>
                )}
              </View>

              <View style={styles.metaRow}>
                {renderStars(item.rating)}
                <Text style={[styles.metaText, { color: colors.textMuted }]}>
                  {item.rating.toFixed(1)}
                </Text>
                <Text style={[styles.dot, { color: colors.textMuted }]}>•</Text>
                <Text style={[styles.metaText, { color: colors.textMuted }]}>
                  {item.totalProperties ?? 0} properties
                </Text>
              </View>

              {item.bio ? (
                <Text
                  numberOfLines={2}
                  style={[
                    styles.about,
                    { color: colors.textMuted || colors.text },
                  ]}
                >
                  {item.bio}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
        // ItemSeparatorComponent={() => (
        //   <View
        //     style={[
        //       styles.separator,
        //       { backgroundColor: colors.border || "rgba(0,0,0,0.06)" },
        //     ]}
        //   />
        // )}
        contentContainerStyle={{ paddingBottom: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  item: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontWeight: "600",
    fontSize: 16,
  },
  verified: {
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    marginLeft: 6,
    color: "#6b7280",
    fontSize: 12,
  },
  dot: {
    marginHorizontal: 6,
    color: "#6b7280",
    fontSize: 12,
  },
  about: {
    marginTop: 6,
    color: "#374151",
    fontSize: 13,
  },
  actions: {
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  msgBtn: {
    backgroundColor: "#2563eb",
    marginBottom: 6,
  },
  callBtn: {
    backgroundColor: "#059669",
  },
  actionText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.06)",
    marginLeft: 88,
    marginVertical: 4,
  },
});
