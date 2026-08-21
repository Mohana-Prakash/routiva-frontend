"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { AlarmOffsetField } from "@/features/activities/components/AlarmOffsetField";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "../hooks/useNotificationPreferences";
import type { UpdateNotificationPreferencesInput } from "@/types/notification";

export function NotificationPreferencesForm() {
  const { data: preferences, isLoading, isError, error, refetch } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");

  useEffect(() => {
    if (preferences) {
      setQuietStart(preferences.quietHoursStart ?? "22:00");
      setQuietEnd(preferences.quietHoursEnd ?? "07:00");
    }
  }, [preferences]);

  if (isLoading) return <LoadingSkeleton className="h-64 w-full" />;
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (!preferences) return null;

  function save(patch: UpdateNotificationPreferencesInput) {
    updatePreferences.mutate(patch, { onError: (e) => toast.error(getFriendlyErrorMessage(e)) });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="push-enabled">Notifications enabled</Label>
            <p className="text-xs text-muted-foreground">Turn off to stop all reminders across every device.</p>
          </div>
          <Switch id="push-enabled" checked={preferences.pushEnabled} onCheckedChange={(checked) => save({ pushEnabled: checked })} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="default-alarm-offset">Default reminder timing</Label>
          <AlarmOffsetField
            id="default-alarm-offset"
            value={preferences.defaultAlarmOffsetMinutes}
            onChange={(value) => value !== undefined && save({ defaultAlarmOffsetMinutes: value })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="quiet-hours">Quiet hours</Label>
            <p className="text-xs text-muted-foreground">Reminders are suppressed during this window.</p>
          </div>
          <Switch id="quiet-hours" checked={preferences.quietHoursEnabled} onCheckedChange={(checked) => save({ quietHoursEnabled: checked })} />
        </div>

        {preferences.quietHoursEnabled && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quiet-start">From</Label>
              <Input
                id="quiet-start"
                type="time"
                value={quietStart}
                onChange={(e) => setQuietStart(e.target.value)}
                onBlur={() => save({ quietHoursStart: quietStart })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quiet-end">To</Label>
              <Input
                id="quiet-end"
                type="time"
                value={quietEnd}
                onChange={(e) => setQuietEnd(e.target.value)}
                onBlur={() => save({ quietHoursEnd: quietEnd })}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
