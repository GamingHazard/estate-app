import { ParamListBase } from '@react-navigation/native';

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
  PropertiesManagement: undefined;
  PropertyCreation: undefined;
  AdminNotifications: undefined;
  AdminMessages: undefined;
  AdminSettings: undefined;
  Analytics: undefined;
  AdminManual: undefined;
  AdminPropertyDetails: { propertyId: string };

  // Stack Screens
  Account: undefined;
  GeneralSettings: undefined;
  UserManual: undefined;
  TermsAndConditions: undefined;
  History: undefined;
  CustomerCare: undefined;
  PropertyDetails: { propertyId: string };
  AgentProfile: { agent: any };
  NoInternet: undefined;
  PaymentMethod: undefined;
  AddCard: undefined;
}