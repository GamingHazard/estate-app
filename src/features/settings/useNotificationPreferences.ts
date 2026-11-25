import { AppState } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  GeneralSettingsPreferences,
  DEFAULT_GENERAL_SETTINGS,
  loadGeneralSettingsWithStatus,
  saveGeneralSettings,
} from "./generalSettingsStore";
import {
  NotificationPreferenceRole,
  getNotificationPreferences,
  projectNotificationPreferences,
  saveNotificationPreferences,
} from "./notificationPreferencesApi";

type PreferenceSyncStatus = "idle" | "saving" | "saved" | "error";
type PreferenceKey = keyof GeneralSettingsPreferences;

const SYNC_DEBOUNCE_MS = 400;

export function useNotificationPreferences(
  userId: string | null,
  role: NotificationPreferenceRole | null,
) {
  const [preferences, setPreferences] = useState(DEFAULT_GENERAL_SETTINGS);
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const [preferencesLoadError, setPreferencesLoadError] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [preferencesSaveError, setPreferencesSaveError] = useState(false);
  const [syncStatus, setSyncStatus] =
    useState<PreferenceSyncStatus>("idle");
  const [loadRequest, setLoadRequest] = useState(0);
  const preferencesRef = useRef(preferences);
  const pendingPatchRef = useRef<Partial<GeneralSettingsPreferences>>({});
  const initialSyncPendingRef = useRef(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightSyncRef = useRef<Promise<void> | null>(null);
  const loadGenerationRef = useRef(0);
  const isMountedRef = useRef(true);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushSyncRef = useRef<() => Promise<void>>(async () => {});

  const setCurrentPreferences = useCallback(
    (next: GeneralSettingsPreferences) => {
      preferencesRef.current = next;
      if (isMountedRef.current) setPreferences(next);
    },
    [],
  );

  const saveLocalPreferences = useCallback(
    async (next: GeneralSettingsPreferences) => {
      await saveGeneralSettings(userId, next);
    },
    [userId],
  );

  const flushPendingPreferences = useCallback(async () => {
    if (!userId || !role) return;
    if (inFlightSyncRef.current) return inFlightSyncRef.current;

    const pendingSnapshot = { ...pendingPatchRef.current };
    if (
      !initialSyncPendingRef.current &&
      Object.keys(pendingSnapshot).length === 0
    ) {
      return;
    }

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }

    let syncSucceeded = false;
    const sync = (async () => {
      if (isMountedRef.current) setIsSavingPreferences(true);
      setPreferencesSaveError(false);
      if (isMountedRef.current) setSyncStatus("saving");

      try {
        let response;
        if (initialSyncPendingRef.current) {
          const currentServer = await getNotificationPreferences();
          if (currentServer.configured) {
            const pendingPayload = projectNotificationPreferences(
              pendingSnapshot,
              role,
            );
            response =
              Object.keys(pendingPayload).length > 0
                ? await saveNotificationPreferences(pendingPayload)
                : currentServer;
          } else {
            response = await saveNotificationPreferences(
              projectNotificationPreferences(preferencesRef.current, role),
              true,
            );
          }
          initialSyncPendingRef.current = false;
        } else {
          response = await saveNotificationPreferences(
            projectNotificationPreferences(pendingSnapshot, role),
          );
        }
        syncSucceeded = true;

        const merged = {
          ...preferencesRef.current,
          ...response.preferences,
        };
        for (const field of Object.keys(pendingPatchRef.current) as PreferenceKey[]) {
          Object.assign(merged, {
            [field]: preferencesRef.current[field],
          });
        }
        setCurrentPreferences(merged);

        for (const [field, value] of Object.entries(pendingSnapshot)) {
          const key = field as PreferenceKey;
          if (pendingPatchRef.current[key] === value) {
            delete pendingPatchRef.current[key];
          }
        }

        try {
          await saveLocalPreferences(merged);
        } catch {
          if (isMountedRef.current) setPreferencesSaveError(true);
        }

        if (isMountedRef.current) {
          setSyncStatus(
            Object.keys(pendingPatchRef.current).length > 0 ? "saving" : "saved",
          );
          if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
          if (Object.keys(pendingPatchRef.current).length === 0) {
            statusTimerRef.current = setTimeout(
              () => setSyncStatus("idle"),
              1800,
            );
          }
        }
      } catch {
        pendingPatchRef.current = {
          ...pendingSnapshot,
          ...pendingPatchRef.current,
        };
        if (isMountedRef.current) {
          setSyncStatus("error");
          setPreferencesSaveError(true);
        }
      } finally {
        if (isMountedRef.current) setIsSavingPreferences(false);
      }
    })();

    inFlightSyncRef.current = sync;
    try {
      await sync;
    } finally {
      if (inFlightSyncRef.current === sync) {
        inFlightSyncRef.current = null;
        if (
          syncSucceeded &&
          Object.keys(pendingPatchRef.current).length > 0 &&
          !syncTimerRef.current
        ) {
          syncTimerRef.current = setTimeout(() => {
            syncTimerRef.current = null;
            void flushSyncRef.current();
          }, SYNC_DEBOUNCE_MS);
        }
      }
    }
  }, [role, saveLocalPreferences, setCurrentPreferences, userId]);

  flushSyncRef.current = flushPendingPreferences;

  const scheduleSync = useCallback(() => {
    if (!userId || !role) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      syncTimerRef.current = null;
      void flushSyncRef.current();
    }, SYNC_DEBOUNCE_MS);
  }, [role, userId]);

  const updatePreference = useCallback(
    async <Key extends PreferenceKey>(
      key: Key,
      value: GeneralSettingsPreferences[Key],
    ) => {
      const next = { ...preferencesRef.current, [key]: value };
      setCurrentPreferences(next);
      setPreferencesSaveError(false);

      if (userId && role) {
        const projected = projectNotificationPreferences(
          { [key]: value },
          role,
        );
        if (Object.keys(projected).length > 0) {
          Object.assign(pendingPatchRef.current, projected);
        }
      }

      setIsSavingPreferences(true);
      try {
        await saveLocalPreferences(next);
        if (userId && role) scheduleSync();
      } catch {
        if (isMountedRef.current) setPreferencesSaveError(true);
      } finally {
        if (isMountedRef.current) setIsSavingPreferences(false);
      }
    },
    [role, saveLocalPreferences, scheduleSync, setCurrentPreferences, userId],
  );

  const retrySync = useCallback(async () => {
    if (!userId || !role) return;
    try {
      await saveLocalPreferences(preferencesRef.current);
      setPreferencesSaveError(false);
    } catch {
      setPreferencesSaveError(true);
    }
    if (!initialSyncPendingRef.current) {
      Object.assign(
        pendingPatchRef.current,
        projectNotificationPreferences(preferencesRef.current, role),
      );
    }
    await flushPendingPreferences();
  }, [flushPendingPreferences, role, saveLocalPreferences, userId]);

  const reloadPreferences = useCallback(() => {
    setPreferencesLoading(true);
    setPreferencesLoadError(false);
    setPreferencesSaveError(false);
    setSyncStatus("idle");
    setLoadRequest((request) => request + 1);
  }, []);

  useEffect(() => {
    const generation = ++loadGenerationRef.current;
    let active = true;
    initialSyncPendingRef.current = Boolean(userId && role);
    pendingPatchRef.current = {};
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }

    setPreferencesLoading(true);
    setPreferencesLoadError(false);
    setPreferencesSaveError(false);

    const load = async () => {
      let localPreferences = { ...DEFAULT_GENERAL_SETTINGS };
      let hasLocalPreferences = false;
      let localLoadFailed = false;
      try {
        const local = await loadGeneralSettingsWithStatus(userId);
        localPreferences = local.preferences;
        hasLocalPreferences = local.hasStoredPreferences;
        if (userId && !hasLocalPreferences) {
          const guest = await loadGeneralSettingsWithStatus(null);
          if (guest.hasStoredPreferences) {
            localPreferences = guest.preferences;
            hasLocalPreferences = true;
          }
        }
      } catch {
        localLoadFailed = true;
      }

      if (!active || generation !== loadGenerationRef.current) return;
      setCurrentPreferences(localPreferences);

      if (!userId || !role) {
        initialSyncPendingRef.current = false;
        setPreferencesLoadError(localLoadFailed);
        setPreferencesLoading(false);
        return;
      }

      try {
        const server = await getNotificationPreferences();
        if (!active || generation !== loadGenerationRef.current) return;

        const synchronized = server.configured
          ? {
              ...localPreferences,
              ...server.preferences,
            }
          : await (async () => {
              const initialized = await saveNotificationPreferences(
                projectNotificationPreferences(localPreferences, role),
                true,
              );
              return {
                ...localPreferences,
                ...initialized.preferences,
              };
            })();

        if (!active || generation !== loadGenerationRef.current) return;
        initialSyncPendingRef.current = false;
        setCurrentPreferences(synchronized);
        setPreferencesLoadError(localLoadFailed);
        try {
          await saveGeneralSettings(userId, synchronized);
        } catch {
          setPreferencesSaveError(true);
        }
        if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
        setSyncStatus("saved");
        statusTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) setSyncStatus("idle");
        }, 1800);
      } catch {
        if (active && generation === loadGenerationRef.current) {
          setPreferencesLoadError(false);
          setPreferencesSaveError(true);
          setSyncStatus("error");
        }
      } finally {
        if (active && generation === loadGenerationRef.current) {
          setPreferencesLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [loadRequest, role, setCurrentPreferences, userId]);

  useEffect(() => {
    isMountedRef.current = true;
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") void flushSyncRef.current();
    });

    return () => {
      isMountedRef.current = false;
      subscription.remove();
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
        void flushSyncRef.current();
      }
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  return {
    preferences,
    preferencesLoading,
    preferencesLoadError,
    isSavingPreferences,
    preferencesSaveError,
    syncStatus,
    updatePreference,
    retrySync,
    reloadPreferences,
  };
}
