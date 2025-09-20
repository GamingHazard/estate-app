import { StackNavigationProp } from '@react-navigation/stack';

type Property = {
  id: string;
  type: string;
  title: string;
  description: string;
  price: number;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  thumbnail: string;
  amenities: string[];
  status: string;
  saved?: boolean;
  gallery: { name: string; url: string }[];
};

export type RootStackParamList = {
  MainTabs: undefined;
  PropertyDetails: { property: Property };
  Account: undefined;
  "General settings": undefined;
  "User Guide": undefined;
  "Terms-and-Conditions": undefined;
  History: undefined;
  "Customer Care": undefined;
};

export type NavigationProp = StackNavigationProp<RootStackParamList>;
