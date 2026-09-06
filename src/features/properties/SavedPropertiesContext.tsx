import React, { createContext, useContext, useEffect, useState } from "react";
import { mockProperties } from "../../data/mockData";
import { useAuth } from "../auth/AuthContext";

type SavedPropertiesContextValue = {
  savedPropertyIds: string[];
  isSaved: (propertyId: string) => boolean;
  toggleSaved: (propertyId: string) => void;
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
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);

  useEffect(() => {
    setSavedPropertyIds(
      user
        ? mockProperties
            .filter((property) => property.saved)
            .map((property) => property.id)
        : [],
    );
  }, [user?.id]);

  const isSaved = (propertyId: string) => savedPropertyIds.includes(propertyId);

  const toggleSaved = (propertyId: string) => {
    setSavedPropertyIds((currentIds) =>
      currentIds.includes(propertyId)
        ? currentIds.filter((id) => id !== propertyId)
        : [...currentIds, propertyId],
    );
  };

  return (
    <SavedPropertiesContext.Provider
      value={{ savedPropertyIds, isSaved, toggleSaved }}
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
