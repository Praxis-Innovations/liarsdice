// Server helper for sending push notifications to players via Expo Push API.
// Reads each player's push token from Nakama Storage (collection: "device",
// key: "push_token") and POSTs to api.expo.dev/v2/push/send.

const EXPO_PUSH_URL = "https://api.expo.dev/v2/push/send";

interface PushPayload {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// Send a push notification to one or more Expo push tokens.
export function sendPushToPlayers(
  nk: nkruntime.Nakama,
  logger: nkruntime.Logger,
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>,
): void {
  if (userIds.length === 0) return;

  // Fetch push tokens from Nakama Storage for each user.
  const readRequests: nkruntime.StorageReadRequest[] = userIds.map((uid) => ({
    collection: "device",
    key: "push_token",
    userId: uid,
  }));

  let objects: nkruntime.StorageObject[] = [];
  try {
    objects = nk.storageRead(readRequests);
  } catch {
    logger.warn("sendPushToPlayers: failed to read storage tokens");
    return;
  }

  const messages: PushPayload[] = [];
  for (const obj of objects) {
    try {
      const { token } = JSON.parse(obj.value) as { token: string; platform: string };
      if (token) messages.push({ to: token, title, body, data });
    } catch {
      // Malformed token — skip.
    }
  }

  if (messages.length === 0) return;

  try {
    nk.httpRequest(EXPO_PUSH_URL, "post", {
      "Content-Type": "application/json",
      Accept: "application/json",
    }, JSON.stringify(messages));
  } catch {
    logger.warn("sendPushToPlayers: Expo push request failed");
  }
}
