import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { parsePropertyListResponse, Property } from "../../data/property";
import { apiRequest, getErrorMessage } from "../../shared/queryClient";
import { useAuth } from "../auth/AuthContext";

type SavedPropertiesContextValue = {
  savedProperties: Property[];
  savedPropertyIds: string[];
  isLoading: boolean;
  loadError: string | null;
  reloadSavedProperties: () => void;
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
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadRequest, setReloadRequest] = useState(0);

  const updateSavedState = (items: unknown[] = []) => {
    const normalized = parsePropertyListResponse({ properties: items }).properties;
    setSavedProperties(normalized);
    setSavedPropertyIds(normalized.map((property) => property.id));
    setLoadError(null);
  };

  useEffect(() => {
    let isActive = true;
    const loadSavedProperties = async () => {
      if (!user) {
        setSavedProperties([]);
        setSavedPropertyIds([]);
        setLoadError(null);
        setIsLoading(false);
        return;
      }

      setSavedProperties([]);
      setSavedPropertyIds([]);
      setLoadError(null);
      setIsLoading(true);
      try {
        const response = await apiRequest("GET", "/users/me/saved");
        const data = await response.json();
        if (isActive) updateSavedState(data.properties ?? []);
      } catch (error) {
        console.error("Unable to load saved properties:", error);
        if (isActive) {
          setSavedProperties([]);
          setSavedPropertyIds([]);
          setLoadError(
            getErrorMessage(
              error,
              "Unable to load saved properties. Please try again.",
            ),
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadSavedProperties();
    return () => {
      isActive = false;
    };
  }, [user?.id, reloadRequest]);

  const isSaved = (propertyId: string) => savedPropertyIds.includes(propertyId);
  const reloadSavedProperties = () =>
    setReloadRequest((current) => current + 1);

  const toggleSaved = async (propertyId: string) => {
    if (!user) {
      Alert.alert("Login required", "Please sign in to save properties.");
      return;
    }

    try {
      const response = await apiRequest("PATCH", `/users/me/saved/${propertyId}`);
      const data = await response.json();
      setLoadError(null);
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
      Alert.alert(
        "Unable to update saved property",
        getErrorMessage(error, "Please try again."),
      );
    }
  };

  return (
    <SavedPropertiesContext.Provider
      value={{
        savedProperties,
        savedPropertyIds,
        isLoading,
        loadError,
        reloadSavedProperties,
        isSaved,
        toggleSaved,
      }}
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
