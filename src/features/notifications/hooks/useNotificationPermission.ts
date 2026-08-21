"use client";

import { useCallback, useState } from "react";
import type { NotificationPermissionState } from "@/types/notification";

function readPermission(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

/**
 * Wraps the browser Notification permission API. Requesting permission must
 * only ever happen from a direct user gesture (frontend-requirements 03 §4:
 * "Do not repeatedly request permission without user interaction") — this hook
 * exposes `request()` for a click handler, never calls it automatically.
 */
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermissionState>(() => readPermission());

  const request = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return "unsupported" as const;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  return { permission, request };
}
