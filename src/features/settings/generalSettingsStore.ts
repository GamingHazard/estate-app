import AsyncStorage from "@react-native-async-storage/async-storage";

export type SavedSearchFrequency = "off" | "daily" | "weekly";

export type GeneralSettingsPreferences = {
  pushNotifications: boolean;
  emailNotifications: boolean;
  savedSearchMatches: boolean;
  savedPropertyUpdates: boolean;
  messageAndViewingUpdates: boolean;
  promotionalEmails: boolean;
  savedSearchFrequency: SavedSearchFrequency;
  locationRecommendations: boolean;
  notifyOwnersOnPropertyView: boolean;
};

const STORAGE_KEY_PREFIX = "general-settings:v1:";

export const DEFAULT_GENERAL_SETTINGS: GeneralSettingsPreferences = {
  pushNotifications: false,
  emailNotifications: false,
  savedSearchMatches: true,
  savedPropertyUpdates: true,
  messageAndViewingUpdates: true,
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
    pushNotifications: isBoolean(stored.pushNotifications)
      ? stored.pushNotifications
      : DEFAULT_GENERAL_SETTINGS.pushNotifications,
    emailNotifications: isBoolean(stored.emailNotifications)
      ? stored.emailNotifications
      : DEFAULT_GENERAL_SETTINGS.emailNotifications,
    savedSearchMatches: isBoolean(stored.savedSearchMatches)
      ? stored.savedSearchMatches
      : DEFAULT_GENERAL_SETTINGS.savedSearchMatches,
    savedPropertyUpdates: isBoolean(stored.savedPropertyUpdates)
      ? stored.savedPropertyUpdates
      : DEFAULT_GENERAL_SETTINGS.savedPropertyUpdates,
    messageAndViewingUpdates: isBoolean(stored.messageAndViewingUpdates)
      ? stored.messageAndViewingUpdates
      : DEFAULT_GENERAL_SETTINGS.messageAndViewingUpdates,
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
  const stored = await AsyncStorage.getItem(toStorageKey(userId));
  if (!stored) return { ...DEFAULT_GENERAL_SETTINGS };

  try {
    return parsePreferences(JSON.parse(stored));
  } catch {
    return { ...DEFAULT_GENERAL_SETTINGS };
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