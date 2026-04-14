import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type { NotificationIntent } from "../domain/notifications";

const LOCAL_NOTIFICATION_CHANNEL_ID = "tiopet-care-events";
const LOCAL_NOTIFICATION_CHANNEL_NAME = "Eventos de cuidado";

let notificationHandlerConfigured = false;
let notificationChannelConfigured = false;

type LocalNotificationDeliveryResult =
  | {
      ok: true;
      deliveredAtISO: string;
      localNotificationId: string;
    }
  | {
      ok: false;
      reason: "already_delivered" | "permission_denied" | "unsupported_platform";
    };

function configureNotificationHandler() {
  if (notificationHandlerConfigured || Platform.OS === "web") {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  notificationHandlerConfigured = true;
}

async function ensureAndroidNotificationChannelAsync() {
  if (Platform.OS !== "android" || notificationChannelConfigured) {
    return;
  }

  await Notifications.setNotificationChannelAsync(LOCAL_NOTIFICATION_CHANNEL_ID, {
    name: LOCAL_NOTIFICATION_CHANNEL_NAME,
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 180, 120, 180],
    lightColor: "#57D7FF",
    sound: "default",
  });

  notificationChannelConfigured = true;
}

async function ensureLocalNotificationPermissionAsync() {
  if (Platform.OS === "web") {
    return false;
  }

  configureNotificationHandler();
  await ensureAndroidNotificationChannelAsync();

  const currentPermissions = await Notifications.getPermissionsAsync();

  if (currentPermissions.granted) {
    return true;
  }

  if (!currentPermissions.canAskAgain) {
    return false;
  }

  const requestedPermissions = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });

  return requestedPermissions.granted;
}

export async function deliverNotificationIntentLocallyAsync(
  intent: NotificationIntent,
): Promise<LocalNotificationDeliveryResult> {
  if (intent.localDeliveredAtISO) {
    return {
      ok: false,
      reason: "already_delivered",
    };
  }

  const hasPermission = await ensureLocalNotificationPermissionAsync();

  if (!hasPermission) {
    return {
      ok: false,
      reason: Platform.OS === "web" ? "unsupported_platform" : "permission_denied",
    };
  }

  const localNotificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: intent.title,
      body: intent.body,
      sound: "default",
      data: {
        bookingId: intent.bookingId,
        notificationIntentId: intent.id,
        notificationIntentType: intent.type,
        planId: intent.planId,
      },
    },
    trigger: Platform.OS === "android" ? { channelId: LOCAL_NOTIFICATION_CHANNEL_ID } : null,
  });

  return {
    ok: true,
    deliveredAtISO: new Date().toISOString(),
    localNotificationId,
  };
}
