import { apiRequest } from "../../shared/queryClient";
import type { GeneralSettingsPreferences } from "./generalSettingsStore";

export type NotificationPreferenceRole =
  | "user"
  | "landlord"
  | "propertyManager"
  | "admin";

export type PersistedNotificationPreferences = Omit<
  GeneralSettingsPreferences,
  "locationRecommendations" | "notifyOwnersOnPropertyView"
>;

export type NotificationPreferencesResponse = {
  configured: boolean;
  preferences: Partial<PersistedNotificationPreferences>;
};

const isPlainObject = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  (Object.getPrototypeOf(value) === Object.prototype ||
    Object.getPrototypeOf(value) === null);

const isNotificationPreferences = (
  value: unknown,
): value is Partial<PersistedNotificationPreferences> => {
  if (!isPlainObject(value)) return false;

  const booleanFields = new Set([
    "notificationsEnabled",
    "emailNotifications",
    "messageAndViewingUpdates",
    "deals",
    "contactedOwnerListings",
    "savedSearchMatches",
    "savedPropertyUpdates",
    "savedPropertyReminders",
    "termsAndConditionsUpdates",
    "customerCareUpdates",
    "customerCareRequests",
    "ownerPropertyReviews",
    "ownerPropertySaves",
    "promotionalEmails",
  ]);

  return Object.entries(value).every(([field, preference]) => {
    if (booleanFields.has(field)) return typeof preference === "boolean";
    return (
      field === "savedSearchFrequency" &&
      (preference === "off" ||
        preference === "daily" ||
        preference === "weekly")
    );
  });
};

const parsePreferencesResponse = (
  payload: unknown,
): NotificationPreferencesResponse => {
  if (
    !isPlainObject(payload) ||
    typeof payload.configured !== "boolean" ||
    !isNotificationPreferences(payload.preferences)
  ) {
    throw new Error("The server returned invalid notification preferences.");
  }

  return {
    configured: payload.configured,
    preferences: payload.preferences,
  };
};

export const getNotificationPreferences =
  async (): Promise<NotificationPreferencesResponse> => {
    const response = await apiRequest(
      "GET",
      "/users/me/notification-preferences",
    );
    return parsePreferencesResponse(await response.json());
  };

export const saveNotificationPreferences = async (
  preferences: Partial<PersistedNotificationPreferences>,
  initialize = false,
): Promise<NotificationPreferencesResponse> => {
  const response = await apiRequest(
    "PATCH",
    "/users/me/notification-preferences",
    { preferences, initialize },
  );
  return parsePreferencesResponse(await response.json());
};

export const projectNotificationPreferences = (
  preferences: Partial<GeneralSettingsPreferences>,
  role: NotificationPreferenceRole,
): Partial<PersistedNotificationPreferences> => {
  const fields: Array<keyof PersistedNotificationPreferences> = [
    "notificationsEnabled",
    "emailNotifications",
    "termsAndConditionsUpdates",
    "promotionalEmails",
  ];

  if (role === "admin") {
    fields.push("messageAndViewingUpdates", "customerCareRequests");
  } else {
    fields.push(
      "messageAndViewingUpdates",
      "deals",
      "contactedOwnerListings",
      "savedSearchMatches",
      "savedPropertyUpdates",
      "savedPropertyReminders",
      "customerCareUpdates",
      "savedSearchFrequency",
    );
    if (role === "landlord" || role === "propertyManager") {
      fields.push("ownerPropertyReviews", "ownerPropertySaves");
    }
  }

  const result: Partial<PersistedNotificationPreferences> = {};
  for (const field of fields) {
    const value = preferences[field];
    if (value !== undefined) {
      Object.assign(result, { [field]: value });
    }
  }
  return result;
};
