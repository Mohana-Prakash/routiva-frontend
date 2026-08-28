export type AlarmTimingPreset = "AT_START" | "5_MIN_BEFORE" | "10_MIN_BEFORE" | "15_MIN_BEFORE" | "CUSTOM";

export interface NotificationPreferences {
  pushEnabled: boolean;
  defaultAlarmOffsetMinutes: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string | null; // "HH:mm"
  quietHoursEnd: string | null;
  /** Whether the backend has at least one active push subscription on file for this user —
   * only present on GET (not the PATCH response); the source of truth for "will a reminder
   * actually reach me anywhere", since a browser can still think it's subscribed locally after
   * the backend silently revoked that subscription. */
  hasActiveSubscription?: boolean;
}

export interface UpdateNotificationPreferencesInput {
  pushEnabled?: boolean;
  defaultAlarmOffsetMinutes?: number;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
}

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: PushSubscriptionKeys;
}

export type NotificationPermissionState = "default" | "granted" | "denied" | "unsupported";
