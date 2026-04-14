import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import {
  normalizeNotificationIntent,
  type NotificationIntent,
} from "../domain/notifications";

type NotificationsState = {
  intents: NotificationIntent[];
  hydrated: boolean;
  enqueueIntent: (intent: NotificationIntent) => void;
  markIntentLocallyDelivered: (
    intentId: string,
    localNotificationId: string,
    deliveredAtISO?: string,
  ) => void;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
  clearAll: () => Promise<void>;
};

const STORAGE_KEY = "tiopet_notification_intents_v1";
const MAX_STORED_NOTIFICATION_INTENTS = 50;

function sortNotificationIntents(intents: NotificationIntent[]) {
  return [...intents].sort((a, b) => {
    const byDate = a.createdAtISO.localeCompare(b.createdAtISO);
    if (byDate !== 0) {
      return byDate;
    }

    return a.id.localeCompare(b.id);
  });
}

function capNotificationIntents(intents: NotificationIntent[]) {
  const sorted = sortNotificationIntents(intents);
  return sorted.slice(-MAX_STORED_NOTIFICATION_INTENTS);
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  intents: [],
  hydrated: false,

  enqueueIntent: (intent) => {
    console.info("[notifications] intent queued", intent);

    set((state) => ({
      intents: capNotificationIntents([...state.intents, intent]),
    }));

    void get().persist();
  },

  markIntentLocallyDelivered: (intentId, localNotificationId, deliveredAtISO) => {
    const safeNotificationId = localNotificationId.trim();

    if (safeNotificationId.length === 0) {
      return;
    }

    let didChange = false;

    set((state) => ({
      intents: capNotificationIntents(
        state.intents.map((intent) => {
          if (intent.id !== intentId || intent.localDeliveredAtISO) {
            return intent;
          }

          didChange = true;

          return {
            ...intent,
            localDeliveredAtISO: deliveredAtISO ?? new Date().toISOString(),
            localNotificationId: safeNotificationId,
          };
        }),
      ),
    }));

    if (didChange) {
      void get().persist();
    }
  },

  persist: async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(get().intents));
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      const intents = capNotificationIntents(
        list
          .map((item) => normalizeNotificationIntent(item))
          .filter((item): item is NotificationIntent => item !== null),
      );

      set({
        intents,
        hydrated: true,
      });

      if (raw !== JSON.stringify(intents)) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(intents));
      }
    } catch {
      set({ hydrated: true });
    }
  },

  clearAll: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ intents: [] });
  },
}));
