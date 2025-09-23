import { ParamListBase } from '@react-navigation/native';

export interface RootStackParamList extends ParamListBase {
  // Main Tabs
  Home: undefined;
  Deals: undefined;
  Saved: undefined;
  Messages: undefined;
  Settings: undefined;
  Admin: undefined;
  PropertiesManagement: undefined;
  MainTabs: undefined;

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
}