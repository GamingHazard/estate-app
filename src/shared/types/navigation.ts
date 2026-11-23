import { ParamListBase } from "@react-navigation/native";
import { AdminProperty } from "../../data/adminPropertyStore";
import { Property } from "../../data/property";

export type PropertySource = "local" | "marketplace" | "server-marketplace";
type PropertySnapshot = Property | AdminProperty;

export interface RootStackParamList extends ParamListBase {
  // Main Tabs
  Home: undefined;
  Deals: undefined;
  Saved: undefined;
  Messages: undefined;
  Settings: undefined;
  MainTabs: undefined;

  // Admin Stack Screens
  Admin: undefined;
  Dashboard: undefined;
  PropertiesManagement: undefined;
  DealsManagement: undefined;
  ReviewsManagement: undefined;
  PropertyCreation:
    | {
        mode?: "edit";
        propertyId?: string;
        propertySource?: PropertySource;
        propertySnapshot?: PropertySnapshot;
      }
    | undefined;
  AdminNotifications: undefined;
  AdminNotificationDetails: { notificationId: string };
  AdminMessages: undefined;
  AdminSettings: undefined;
  Analytics: undefined;
  AdminManual: undefined;
  AdminPropertyDetails: {
    propertyId: string;
    propertySource?: PropertySource;
    propertySnapshot?: PropertySnapshot;
  };

  // Stack Screens
  Account: undefined;
  GeneralSettings: undefined;
  UserManual: undefined;
  TermsAndConditions: undefined;
  History: undefined;
  CustomerCare: undefined;
  PropertyDetails: { property: Property };
  "Lister Profile": { userId: string };
  NoInternet: undefined;
  PaymentMethod: undefined;
  AddCard: undefined;
  "Chat Room":
    | {
        conversationId?: string;
        participantName: string;
        participantAvatar: string;
        initialMessages: any[];
      }
    | undefined;
}
