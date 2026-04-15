import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { deliverNotificationIntentLocallyAsync } from "../src/lib/localNotificationDelivery";
import { useAuthStore } from "../src/store/authStore";
import { useNotificationsStore } from "../src/store/notificationsStore";
import { useRoleSimulationStore } from "../src/store/roleSimulationStore";
import { theme } from "../src/theme/theme";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const deliveryLoopActiveRef = useRef(false);
  const deliveryLoopRerunRef = useRef(false);

  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const notificationIntents = useNotificationsStore((s) => s.intents);
  const notificationsHydrated = useNotificationsStore((s) => s.hydrated);
  const hydrateNotifications = useNotificationsStore((s) => s.hydrate);
  const roleHydrated = useRoleSimulationStore((s) => s.hydrated);
  const hydrateRoleSimulation = useRoleSimulationStore((s) => s.hydrate);
  const markIntentLocallyDelivered = useNotificationsStore(
    (s) => s.markIntentLocallyDelivered,
  );

  useEffect(() => {
    void hydrate();
    void hydrateNotifications();
    void hydrateRoleSimulation();
  }, [hydrate, hydrateNotifications, hydrateRoleSimulation]);

  useEffect(() => {
    if (!hydrated) return;

    const inLogin = segments[0] === "login"; // app/login.tsx
    if (!user && !inLogin) router.replace("/login");
    if (user && inLogin) router.replace("/(tabs)");
  }, [hydrated, user, segments, router]);

  useEffect(() => {
    if (!hydrated || !notificationsHydrated || !user) {
      return;
    }

    let cancelled = false;

    const processPendingNotificationIntents = async () => {
      if (deliveryLoopActiveRef.current) {
        deliveryLoopRerunRef.current = true;
        return;
      }

      deliveryLoopActiveRef.current = true;

      try {
        do {
          deliveryLoopRerunRef.current = false;

          const pendingIntents = useNotificationsStore
            .getState()
            .intents.filter((intent) => !intent.localDeliveredAtISO);

          if (pendingIntents.length === 0) {
            return;
          }

          for (const intent of pendingIntents) {
            if (cancelled) {
              return;
            }

            const latestIntent = useNotificationsStore
              .getState()
              .intents.find((candidate) => candidate.id === intent.id);

            if (!latestIntent || latestIntent.localDeliveredAtISO) {
              continue;
            }

            try {
              const deliveryResult = await deliverNotificationIntentLocallyAsync(latestIntent);

              if (!deliveryResult.ok) {
                if (
                  deliveryResult.reason !== "already_delivered" &&
                  deliveryResult.reason !== "permission_denied"
                ) {
                  console.warn(
                    "[notifications] local delivery skipped",
                    latestIntent.id,
                    deliveryResult.reason,
                  );
                }

                if (deliveryResult.reason === "permission_denied") {
                  return;
                }

                continue;
              }

              markIntentLocallyDelivered(
                latestIntent.id,
                deliveryResult.localNotificationId,
                deliveryResult.deliveredAtISO,
              );
            } catch (error) {
              console.warn("[notifications] local delivery failed", latestIntent.id, error);
            }
          }
        } while (deliveryLoopRerunRef.current && !cancelled);
      } finally {
        deliveryLoopActiveRef.current = false;
      }
    };

    void processPendingNotificationIntents();

    return () => {
      cancelled = true;
    };
  }, [
    hydrated,
    markIntentLocallyDelivered,
    notificationIntents,
    notificationsHydrated,
    user,
  ]);

  if (!hydrated || !roleHydrated) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return <Slot />;
}
