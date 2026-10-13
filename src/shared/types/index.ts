import { StackNavigationProp } from "@react-navigation/stack";
import { Property } from "../../data/property";

export type RootStackParamList = {
  MainTabs: undefined;
  PropertyDetails: { property: Property };
  Account: undefined;
  "General settings": undefined;
  "User Guide": undefined;
  "Terms-and-Conditions": undefined;
  History: undefined;
  "Customer Care": undefined;
  "Lister Profile": { userId: string };
  "Payment Method": undefined;
  "Add Card": undefined;
  "Sell Property": undefined;
  AdminPropertyDetails: { propertyId: string };
  "Chat Room": {
    participantName: string;
    participantAvatar: string;
    initialMessages: any[];
  };
};

export type NavigationProp = StackNavigationProp<RootStackParamList>;
