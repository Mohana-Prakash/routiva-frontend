export type AlarmTimingPreset = "AT_START" | "5_MIN_BEFORE" | "10_MIN_BEFORE" | "15_MIN_BEFORE" | "CUSTOM";

export interface NotificationPreferences {
  pushEnabled: boolean;
  defaultAlarmOffsetMinutes: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string | null; // "HH:mm"
  quietHoursEnd: string | null;
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
