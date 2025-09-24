import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { View } from 'react-native';

export function AdminWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <AdminLayout
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
    >
      {children}
    </AdminLayout>
  );
}