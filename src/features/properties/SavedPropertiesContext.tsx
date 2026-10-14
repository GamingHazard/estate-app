import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { parsePropertyListResponse, Property } from "../../data/property";
import { apiRequest } from "../../shared/queryClient";
import { useAuth } from "../auth/AuthContext";

type SavedPropertiesContextValue = {
  savedProperties: Property[];
  savedPropertyIds: string[];
  isSaved: (propertyId: string) => boolean;
  toggleSaved: (propertyId: string) => Promise<void>;
};

const SavedPropertiesContext = createContext<
  SavedPropertiesContextValue | undefined
>(undefined);

export const SavedPropertiesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);

  const updateSavedState = (items: unknown[] = []) => {
    const normalized = parsePropertyListResponse({ properties: items }).properties;
    setSavedProperties(normalized);
    setSavedPropertyIds(normalized.map((property) => property.id));
  };

  useEffect(() => {
    const loadSavedProperties = async () => {
      if (!user) {
        setSavedProperties([]);
        setSavedPropertyIds([]);
        return;
      }

      try {
        const response = await apiRequest("GET", "/users/me/saved");
        const data = await response.json();
        updateSavedState(data.properties ?? []);
      } catch (error) {
        console.error("Unable to load saved properties:", error);
        setSavedProperties([]);
        setSavedPropertyIds([]);
      }
    };

    void loadSavedProperties();
  }, [user?.id]);

  const isSaved = (propertyId: string) => savedPropertyIds.includes(propertyId);

  const toggleSaved = async (propertyId: string) => {
    if (!user) {
      Alert.alert("Login required", "Please sign in to save properties.");
      return;
    }

    try {
      const response = await apiRequest("PATCH", `/users/me/saved/${propertyId}`);
      const data = await response.json();
      if (Array.isArray(data.properties)) {
        updateSavedState(data.properties);
        return;
      }
      const nextSavedIds = data.savedPropertyIds ?? savedPropertyIds;
      const nextProperties = savedProperties.filter((property) =>
        nextSavedIds.includes(property.id),
      );
      setSavedPropertyIds(nextSavedIds);
      setSavedProperties(nextProperties);
    } catch (error) {
      console.error("Unable to toggle saved property:", error);
      Alert.alert("Unable to update saved property", "Please try again.");
    }
  };

  return (
    <SavedPropertiesContext.Provider
      value={{ savedProperties, savedPropertyIds, isSaved, toggleSaved }}
    >
      {children}
    </SavedPropertiesContext.Provider>
  );
};

export const useSavedProperties = () => {
  const context = useContext(SavedPropertiesContext);
  if (!context) {
    throw new Error(
      "useSavedProperties must be used within a SavedPropertiesProvider",
    );
  }
  return context;
};
