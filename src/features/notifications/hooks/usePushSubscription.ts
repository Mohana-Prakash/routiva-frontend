"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications";
import { queryKeys } from "@/lib/query/queryKeys";
import { env } from "@/lib/env";
import { getExistingPushSubscription, isPushSupported, subscribeToPush, unsubscribeFromPush } from "../lib/push";

export type PushSubscriptionStatus = "checking" | "subscribed" | "unsubscribed" | "unsupported";

/**
 * Registers/removes the browser's push subscription with the backend
 * (frontend-requirements 03 §6). Subscribing requires notification permission
 * to already be granted — callers should gate this behind useNotificationPermission.
 */
export function usePushSubscription() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<PushSubscriptionStatus>("checking");

  const refreshStatus = useCallback(async () => {
    if (!isPushSupported()) {
      setStatus("unsupported");
      return;
    }
    const existing = await getExistingPushSubscription();
    setStatus(existing ? "subscribed" : "unsubscribed");
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const subscribe = useMutation({
    mutationFn: async () => {
      const payload = await subscribeToPush(env.vapidPublicKey);
      await notificationsApi.subscribe(payload);
    },
    onSuccess: () => {
      setStatus("subscribed");
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationPreferences() });
    },
  });

  const unsubscribe = useMutation({
    mutationFn: async () => {
      const endpoint = await unsubscribeFromPush();
      if (endpoint) await notificationsApi.unsubscribe(endpoint);
    },
    onSuccess: () => {
      setStatus("unsubscribed");
      queryClient.invalidateQueries({ queryKey: queryKeys.notificationPreferences() });
    },
  });

  return { status, subscribe, unsubscribe };
}
