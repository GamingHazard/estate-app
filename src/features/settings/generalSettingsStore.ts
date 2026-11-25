import AsyncStorage from "@react-native-async-storage/async-storage";

export type SavedSearchFrequency = "off" | "daily" | "weekly";

export type GeneralSettingsPreferences = {
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  messageAndViewingUpdates: boolean;
  deals: boolean;
  contactedOwnerListings: boolean;
  savedSearchMatches: boolean;
  savedPropertyUpdates: boolean;
  savedPropertyReminders: boolean;
  termsAndConditionsUpdates: boolean;
  customerCareUpdates: boolean;
  customerCareRequests: boolean;
  ownerPropertyReviews: boolean;
  ownerPropertySaves: boolean;
  promotionalEmails: boolean;
  savedSearchFrequency: SavedSearchFrequency;
  locationRecommendations: boolean;
  notifyOwnersOnPropertyView: boolean;
};

const STORAGE_KEY_PREFIX = "general-settings:v1:";

export const DEFAULT_GENERAL_SETTINGS: GeneralSettingsPreferences = {
  notificationsEnabled: true,
  emailNotifications: true,
  messageAndViewingUpdates: true,
  deals: true,
  contactedOwnerListings: true,
  savedSearchMatches: true,
  savedPropertyUpdates: true,
  savedPropertyReminders: true,
  termsAndConditionsUpdates: true,
  customerCareUpdates: true,
  customerCareRequests: true,
  ownerPropertyReviews: true,
  ownerPropertySaves: true,
  promotionalEmails: false,
  savedSearchFrequency: "daily",
  locationRecommendations: false,
  notifyOwnersOnPropertyView: false,
};

const isSavedSearchFrequency = (
  value: unknown,
): value is SavedSearchFrequency =>
  value === "off" || value === "daily" || value === "weekly";

const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

const toStorageKey = (userId: string | null) =>
  `${STORAGE_KEY_PREFIX}${userId ?? "guest"}`;

const parsePreferences = (value: unknown): GeneralSettingsPreferences => {
  if (typeof value !== "object" || value === null) {
    return { ...DEFAULT_GENERAL_SETTINGS };
  }

  const stored = value as Record<string, unknown>;

  return {
    notificationsEnabled: isBoolean(stored.notificationsEnabled)
      ? stored.notificationsEnabled
      : isBoolean(stored.pushNotifications)
        ? stored.pushNotifications
        : DEFAULT_GENERAL_SETTINGS.notificationsEnabled,
    emailNotifications: isBoolean(stored.emailNotifications)
      ? stored.emailNotifications
      : DEFAULT_GENERAL_SETTINGS.emailNotifications,
    messageAndViewingUpdates: isBoolean(stored.messageAndViewingUpdates)
      ? stored.messageAndViewingUpdates
      : DEFAULT_GENERAL_SETTINGS.messageAndViewingUpdates,
    deals: isBoolean(stored.deals)
      ? stored.deals
      : DEFAULT_GENERAL_SETTINGS.deals,
    contactedOwnerListings: isBoolean(stored.contactedOwnerListings)
      ? stored.contactedOwnerListings
      : DEFAULT_GENERAL_SETTINGS.contactedOwnerListings,
    savedSearchMatches: isBoolean(stored.savedSearchMatches)
      ? stored.savedSearchMatches
      : DEFAULT_GENERAL_SETTINGS.savedSearchMatches,
    savedPropertyUpdates: isBoolean(stored.savedPropertyUpdates)
      ? stored.savedPropertyUpdates
      : isBoolean(stored.savedPropertyPriceChanges)
        ? stored.savedPropertyPriceChanges
        : DEFAULT_GENERAL_SETTINGS.savedPropertyUpdates,
    savedPropertyReminders: isBoolean(stored.savedPropertyReminders)
      ? stored.savedPropertyReminders
      : DEFAULT_GENERAL_SETTINGS.savedPropertyReminders,
    termsAndConditionsUpdates: isBoolean(stored.termsAndConditionsUpdates)
      ? stored.termsAndConditionsUpdates
      : DEFAULT_GENERAL_SETTINGS.termsAndConditionsUpdates,
    customerCareUpdates: isBoolean(stored.customerCareUpdates)
      ? stored.customerCareUpdates
      : DEFAULT_GENERAL_SETTINGS.customerCareUpdates,
    customerCareRequests: isBoolean(stored.customerCareRequests)
      ? stored.customerCareRequests
      : DEFAULT_GENERAL_SETTINGS.customerCareRequests,
    ownerPropertyReviews: isBoolean(stored.ownerPropertyReviews)
      ? stored.ownerPropertyReviews
      : DEFAULT_GENERAL_SETTINGS.ownerPropertyReviews,
    ownerPropertySaves: isBoolean(stored.ownerPropertySaves)
      ? stored.ownerPropertySaves
      : DEFAULT_GENERAL_SETTINGS.ownerPropertySaves,
    promotionalEmails: isBoolean(stored.promotionalEmails)
      ? stored.promotionalEmails
      : DEFAULT_GENERAL_SETTINGS.promotionalEmails,
    savedSearchFrequency: isSavedSearchFrequency(stored.savedSearchFrequency)
      ? stored.savedSearchFrequency
      : DEFAULT_GENERAL_SETTINGS.savedSearchFrequency,
    locationRecommendations: isBoolean(stored.locationRecommendations)
      ? stored.locationRecommendations
      : DEFAULT_GENERAL_SETTINGS.locationRecommendations,
    notifyOwnersOnPropertyView: isBoolean(stored.notifyOwnersOnPropertyView)
      ? stored.notifyOwnersOnPropertyView
      : DEFAULT_GENERAL_SETTINGS.notifyOwnersOnPropertyView,
  };
};

export const loadGeneralSettings = async (userId: string | null) => {
  const { preferences } = await loadGeneralSettingsWithStatus(userId);
  return preferences;
};

export const loadGeneralSettingsWithStatus = async (userId: string | null) => {
  const stored = await AsyncStorage.getItem(toStorageKey(userId));
  if (!stored) {
    return {
      preferences: { ...DEFAULT_GENERAL_SETTINGS },
      hasStoredPreferences: false,
    };
  }

  try {
    return {
      preferences: parsePreferences(JSON.parse(stored)),
      hasStoredPreferences: true,
    };
  } catch {
    return {
      preferences: { ...DEFAULT_GENERAL_SETTINGS },
      hasStoredPreferences: false,
    };
  }
};

export const saveGeneralSettings = async (
  userId: string | null,
  preferences: GeneralSettingsPreferences,
) => {
  await AsyncStorage.setItem(
    toStorageKey(userId),
    JSON.stringify(preferences),
  );
};