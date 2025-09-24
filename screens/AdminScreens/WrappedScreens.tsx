import React from 'react';
import { PropertiesManagement } from './PropertiesManagement';
import { AdminLayout } from './AdminLayout';
import { PropertyCreation } from './PropertyCreation';
import { AdminNotifications } from './AdminNotifications';
import { AdminMessages } from './AdminMessages';
import { AdminSettings } from './AdminSettings';
import { Analytics } from './Analytics';
import { AdminManual } from './AdminManual';
import { PropertyDetails } from './PropertyDetails';

export const WrappedPropertiesManagement = () => (
  <AdminLayout title="Property Management">
    <PropertiesManagement />
  </AdminLayout>
);

export const WrappedPropertyCreation = () => (
  <AdminLayout title="Create Property">
    <PropertyCreation />
  </AdminLayout>
);

export const WrappedAdminNotifications = () => (
  <AdminLayout title="Notifications">
    <AdminNotifications />
  </AdminLayout>
);

export const WrappedAdminMessages = () => (
  <AdminLayout title="Messages">
    <AdminMessages />
  </AdminLayout>
);

export const WrappedAdminSettings = () => (
  <AdminLayout title="Settings">
    <AdminSettings />
  </AdminLayout>
);

export const WrappedAnalytics = () => (
  <AdminLayout title="Analytics">
    <Analytics />
  </AdminLayout>
);

export const WrappedAdminManual = () => (
  <AdminLayout title="Manual">
    <AdminManual />
  </AdminLayout>
);

export const WrappedPropertyDetails = ({ route }) => (
  <AdminLayout title="Property Details">
    <PropertyDetails propertyId={route.params.propertyId} />
  </AdminLayout>
);