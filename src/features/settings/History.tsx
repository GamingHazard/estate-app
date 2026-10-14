import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../shared/theme/ThemeContext";
import { useAuth } from "../auth/AuthContext";
import { NavigationProp } from "../../shared/types";
import { apiRequest } from "../../shared/queryClient";

type SearchHistoryEntry = {
  id: string;
  query: string;
  purpose?: string;
  category?: string;
  createdAt: string;
  expiresAt?: string;
};

const History = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { user, openAuth } = useAuth();
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    if (!user) {
      setHistory([]);
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("GET", "/users/me/search-history");
      const data = await response.json();
      setHistory(data.history ?? []);
    } catch (error) {
      console.error("Unable to load search history:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, [user?.id]);

  const groupedHistory = useMemo(() => {
    const groups = new Map<string, SearchHistoryEntry[]>();

    history.forEach((entry) => {
      const createdAt = new Date(entry.createdAt);
      const today = new Date();
      const dateKey = createdAt.toDateString();
      const isToday = dateKey === today.toDateString();
      const isYesterday =
        createdAt.toDateString() ===
        new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString();

      const label = isToday ? "Today" : isYesterday ? "Yesterday" : "Earlier";
      const existing = groups.get(label) ?? [];
      groups.set(label, [...existing, entry]);
    });

    return Array.from(groups.entries());
  }, [history]);

  const handleOpenSearch = (entry: SearchHistoryEntry) => {
    if (!user) {
      openAuth();
      return;
    }

    navigation.navigate("MainTabs", {
      screen: "Home",
      params: {
        initialSearch: entry.query,
        initialPurpose: entry.purpose,
        initialCategory: entry.category,
      },
    } as any);
  };

  const clearHistory = async () => {
    if (!user) {
      setHistory([]);
      return;
    }

    try {
      const response = await apiRequest("DELETE", "/users/me/search-history");
      const data = await response.json();
      setHistory(data.history ?? []);
    } catch (error) {
      console.error("Unable to clear search history:", error);
      Alert.alert("Unable to clear history", "Please try again.");
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Search history
          </Text>
          <Text style={[styles.subTitle, { color: colors.textMuted }]}>
            Saved for the last 3 days
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => void clearHistory()}
          style={[styles.clearButton, { borderColor: colors.border }]}
        >
          <Text style={[styles.clearText, { color: colors.text }]}>Clear all</Text>
        </TouchableOpacity>
      </View>

      {!user ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="magnify" size={42} color={colors.primary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Sign in to save your searches</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Recent searches will appear here once you are logged in.
          </Text>
        </View>
      ) : loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : groupedHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="magnify" size={42} color={colors.primary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No recent searches yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Your last 3 days of property searches will appear here.
          </Text>
        </View>
      ) : (
        groupedHistory.map(([label, items]) => (
          <View key={label} style={styles.groupSection}>
            <Text style={[styles.groupTitle, { color: colors.textMuted }]}>
              {label}
            </Text>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.searchCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleOpenSearch(item)}
              >
                <View style={styles.cardLeft}>
                  <MaterialCommunityIcons
                    name="magnify"
                    size={20}
                    color={colors.primary}
                  />
                  <View style={styles.cardTextWrap}>
                    <Text style={[styles.searchQuery, { color: colors.text }]}>
                      {item.query}
                    </Text>
                    <View style={styles.chipRow}>
                      {item.purpose ? (
                        <Text style={[styles.filterChip, { color: colors.primary, backgroundColor: colors.background }]}>
                          {item.purpose}
                        </Text>
                      ) : null}
                      {item.category ? (
                        <Text style={[styles.filterChip, { color: colors.primary, backgroundColor: colors.background }]}>
                          {item.category}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>
                <Text style={[styles.metaText, { color: colors.textMuted }]}>
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  subTitle: {
    fontSize: 13,
    marginTop: 2,
  },
  clearButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearText: {
    fontWeight: "600",
  },
  groupSection: {
    marginBottom: 18,
  },
  groupTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    fontWeight: "700",
  },
  searchCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  cardTextWrap: {
    marginLeft: 10,
    flex: 1,
  },
  searchQuery: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  filterChip: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: "600",
    overflow: "hidden",
  },
  metaText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20,
  },
  loadingState: {
    paddingVertical: 24,
    alignItems: "center",
  },
});

export default History;
