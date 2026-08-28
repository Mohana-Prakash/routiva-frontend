"use client";

import Link from "next/link";
import { BellOff } from "lucide-react";
import { useNotificationPermission } from "../hooks/useNotificationPermission";
import { usePushSubscription } from "../hooks/usePushSubscription";
import { useNotificationPreferences } from "../hooks/useNotificationPreferences";

/**
 * Picks the single most relevant reason reminders won't arrive, checked in the order a user
 * would actually need to fix them (permission first, since nothing else matters until that's
 * granted). `hasActiveSubscription` is the one check that can't be seen from the browser alone —
 * it catches a subscription the backend silently revoked (e.g. after a 410 from the push
 * service) that the browser still thinks is fine.
 */
function reasonFor(
  permission: string,
  subscriptionStatus: string,
  pushEnabled: boolean | undefined,
  hasActiveSubscription: boolean | undefined,
): string | null {
  if (permission === "unsupported") return "This browser doesn't support reminders.";
  if (permission === "denied") return "Notifications are blocked — reminders won't arrive.";
  if (permission === "default") return "Notifications aren't turned on — you won't get reminders.";
  if (pushEnabled === false) return "Reminders are turned off in your notification settings.";
  if (subscriptionStatus === "unsubscribed") return "Push isn't enabled on this device — reminders won't arrive here.";
  if (hasActiveSubscription === false) return "Your device isn't reaching our reminder service — reminders won't arrive.";
  return null;
}

/** Global, persistent (not dismissible) warning — disappears on its own once the underlying
 * issue is actually fixed, same pattern as NetworkStatusBanner. Not dismissible on purpose:
 * the whole point is a user who doesn't realize reminders are broken should keep seeing this
 * until they fix it, not lose track of it after one glance. */
export function NotificationStatusBanner() {
  const { permission } = useNotificationPermission();
  const { status: subscriptionStatus } = usePushSubscription();
  const { data: preferences, isLoading } = useNotificationPreferences();

  if (isLoading || subscriptionStatus === "checking") return null;

  const reason = reasonFor(permission, subscriptionStatus, preferences?.pushEnabled, preferences?.hasActiveSubscription);
  if (!reason) return null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 bg-amber-500/15 px-4 py-2 text-center text-xs font-medium text-amber-700 dark:text-amber-400"
    >
      <BellOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{reason}</span>
      <Link href="/settings" className="underline underline-offset-2 hover:no-underline">
        Fix in Settings
      </Link>
    </div>
  );
}
