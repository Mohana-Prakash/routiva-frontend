import { httpClient } from "./client";
import type { NotificationPreferences, PushSubscriptionPayload, UpdateNotificationPreferencesInput } from "@/types/notification";

export const notificationsApi = {
  getPreferences: () => httpClient.get<NotificationPreferences>("/notifications/preferences").then((r) => r.data),

  updatePreferences: (input: UpdateNotificationPreferencesInput) =>
    httpClient.patch<NotificationPreferences>("/notifications/preferences", input).then((r) => r.data),

  subscribe: (subscription: PushSubscriptionPayload) =>
    httpClient.post<void>("/notifications/push/subscribe", subscription).then((r) => r.data),

  unsubscribe: (endpoint: string) =>
    httpClient.delete<void>("/notifications/push/subscribe", { data: { endpoint } }).then((r) => r.data),
};
