import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { AdminSidebar } from '../../components/AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function AdminLayout({ children, title = '', isSidebarCollapsed = false, onToggleSidebar }: AdminLayoutProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    layout: {
      flex: 1,
      flexDirection: 'row',
    },
    mainContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    menuButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
   
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    mainContent: {
      flex: 1,
      padding: 16,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.layout}>
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={onToggleSidebar}
        />
        <View style={styles.mainContainer}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.menuButton} 
                onPress={onToggleSidebar}
              >
                <MaterialIcons 
                  name="menu" 
                  size={24} 
                  color={colors.text} 
                />
              </TouchableOpacity>
              
              <Text style={styles.title}>{title}</Text>
            </View>
          </View>
          <View style={styles.mainContent}>
            {children}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}