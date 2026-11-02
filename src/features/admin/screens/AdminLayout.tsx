import React, { createContext, useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import { AdminSidebar } from "../../../shared/components/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const AdminHeaderActionsContext = createContext<
  (actions: React.ReactNode | null) => void
>(() => undefined);

export function AdminLayout({
  children,
  title = "",
  isSidebarCollapsed = false,
  onToggleSidebar,
}: AdminLayoutProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [headerActions, setHeaderActions] = useState<React.ReactNode | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: insets.top,
    },
    layout: {
      flex: 1,
      flexDirection: "row",
      position: "relative",
    },
    mainContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    sidebarDismissLayer: {
      ...StyleSheet.absoluteFill,
      backgroundColor: "rgba(0, 0, 0, 0.18)",
      zIndex: 999,
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    headerActions: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      gap: 8,
    },
    menuButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.background,
    },

    title: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    mainContent: {
      flex: 1,
      padding: 16,
    },
  });

  return (
    <AdminHeaderActionsContext.Provider value={setHeaderActions}>
      <View style={styles.container}>
      <View style={styles.layout}>
        {!isSidebarCollapsed && onToggleSidebar && (
          <Pressable
            style={styles.sidebarDismissLayer}
            onPress={onToggleSidebar}
            accessibilityRole="button"
            accessibilityLabel="Close sidebar"
          />
        )}
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={onToggleSidebar}
        />
        <View style={styles.mainContainer}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              {headerActions ? (
                <View style={styles.headerActions}>{headerActions}</View>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={onToggleSidebar}
                  >
                    <MaterialIcons name="menu" size={24} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.title}>{title}</Text>
                </>
              )}
            </View>
          </View>
          <View style={styles.mainContent}>{children}</View>
        </View>
      </View>
      </View>
    </AdminHeaderActionsContext.Provider>
  );
}
