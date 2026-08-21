"use client";

import { toast } from "sonner";
import { BellRing, BellOff, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotificationPermission } from "../hooks/useNotificationPermission";
import { usePushSubscription } from "../hooks/usePushSubscription";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";

/**
 * Explains why notification permission is needed before asking for it
 * (frontend-requirements 03 §4) and reflects the current permission/subscription
 * state without ever re-prompting automatically.
 */
export function NotificationPermissionCard() {
  const { permission, request } = useNotificationPermission();
  const { status, subscribe, unsubscribe } = usePushSubscription();

  async function handleEnable() {
    const result = await request();
    if (result === "granted") {
      subscribe.mutate(undefined, { onError: (error) => toast.error(getFriendlyErrorMessage(error)) });
    } else if (result === "denied") {
      toast.error("Notifications are blocked. Enable them in your browser's site settings to receive reminders.");
    }
  }

  function handleDisable() {
    unsubscribe.mutate(undefined, { onError: (error) => toast.error(getFriendlyErrorMessage(error)) });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BellRing className="h-4 w-4" aria-hidden="true" />
          Enable reminders
        </CardTitle>
        <CardDescription>
          Allow notifications so the app can remind you about selected activities even when you are not actively viewing the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <StatusBadge permission={permission} subscribed={status === "subscribed"} />
        </div>

        {permission === "unsupported" && <p className="text-sm text-muted-foreground">Push notifications aren&apos;t supported in this browser.</p>}

        {permission === "denied" && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Notifications are blocked for this site. Open your browser&apos;s site settings to allow them, then reload this page.</span>
          </div>
        )}

        {permission === "default" && (
          <Button size="sm" disabled={subscribe.isPending} onClick={handleEnable}>
            Enable Notifications
          </Button>
        )}

        {permission === "granted" && status === "unsubscribed" && (
          <Button size="sm" disabled={subscribe.isPending} onClick={() => subscribe.mutate(undefined, { onError: (e) => toast.error(getFriendlyErrorMessage(e)) })}>
            {subscribe.isPending ? "Enabling…" : "Enable Push on This Device"}
          </Button>
        )}

        {permission === "granted" && status === "subscribed" && (
          <Button size="sm" variant="outline" disabled={unsubscribe.isPending} onClick={handleDisable}>
            <BellOff className="h-4 w-4" />
            {unsubscribe.isPending ? "Disabling…" : "Disable Push on This Device"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ permission, subscribed }: { permission: string; subscribed: boolean }) {
  if (permission === "granted" && subscribed) return <Badge>Enabled</Badge>;
  if (permission === "granted") return <Badge variant="outline">Permission granted</Badge>;
  if (permission === "denied") return <Badge variant="outline">Blocked</Badge>;
  if (permission === "unsupported") return <Badge variant="outline">Unsupported</Badge>;
  return <Badge variant="outline">Not enabled</Badge>;
}
