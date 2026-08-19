// Push notification registration helper.
// Requests permission, gets the Expo push token, and stores it in Nakama
// so the server can reach this device for game events.

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { Session } from "@heroiclabs/nakama-js";
import { nakamaClient } from "./nakama";

// Configure how notifications behave while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerPushToken(session: Session): Promise<void> {
  // Push tokens only work on physical devices.
  if (!Device.isDevice) return;

  // Android requires a notification channel.
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const alreadyGranted = (existing as any).status === "granted";

  if (!alreadyGranted) {
    const requested = await Notifications.requestPermissionsAsync();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((requested as any).status !== "granted") return; // User declined — skip silently.
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;

  // Store the token in Nakama Storage so the server can retrieve it.
  // Key: "push_token", collection: "device", value: { token, platform }
  await nakamaClient.writeStorageObjects(session, [
    {
      collection: "device",
      key: "push_token",
      value: { token, platform: Platform.OS } as object,
      permission_read: 1, // owner only
      permission_write: 1,
    },
  ]);
}

// Set up a listener that handles notifications received while the app is in
// the foreground. Returns a cleanup function to call on unmount.
export function setupNotificationListeners(): () => void {
  const sub = Notifications.addNotificationReceivedListener((_notification) => {
    // In-app banner is shown by the handler above — no extra action needed.
  });
  return () => sub.remove();
}
