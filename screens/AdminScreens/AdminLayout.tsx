import React from 'react';
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

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
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
      gap: 8,
    },
    badge: {
      backgroundColor: '#f59e0b',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      flexDirection: 'row',
      alignItems: 'center',
    },
    badgeText: {
      color: 'white',
      fontSize: 12,
      marginLeft: 4,
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
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.badge}>
            <MaterialIcons name="security" size={12} color="white" />
            <Text style={styles.badgeText}>Admin</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
      <ScrollView style={styles.mainContent}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}