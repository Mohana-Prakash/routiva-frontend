"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BellRing } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { ActivityDetailSheet } from "@/features/schedule/components/ActivityDetailSheet";
import {
  combineDateAndEndTime,
  combineDateAndTime,
  formatDurationMinutes,
  minutesBetween,
  minutesUntil,
} from "@/lib/datetime/time";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";
import { useSkipActivity, useStartActivity } from "../hooks/useTrackingMutations";
import { CompleteActivityDialog } from "./CompleteActivityDialog";
import { useNow } from "@/hooks/useNow";
import { useTrackingAvailability } from "@/features/schedule/hooks/useTrackingAvailability";
import type { ScheduleDayItem } from "@/types/schedule";

interface CurrentActivityCardProps {
  item: ScheduleDayItem;
  nowTime: string;
  date: string;
  timezone: string;
}

export function CurrentActivityCard({ item, nowTime, date, timezone }: CurrentActivityCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [completingItem, setCompletingItem] = useState<ScheduleDayItem | null>(null);
  const startActivity = useStartActivity();
  const skipActivity = useSkipActivity();
  const now = useNow();
  const logStatus = item.activityLog?.status;
  const { isTimeless, canStart, canComplete, canSkip } = useTrackingAvailability(item, date, timezone);
  const isPending = startActivity.isPending || skipActivity.isPending;

  const remaining = isTimeless ? null : minutesUntil(item.endTime as string, nowTime);
  // How far through the planned window we are, for the progress bar — 0 before it starts
  // (shouldn't normally render then, but clamped just in case), 100 once it's over.
  const progressPercent = (() => {
    if (isTimeless || !item.startTime || !item.endTime) return null;
    const startMs = combineDateAndTime(date, item.startTime, timezone).getTime();
    const endMs = combineDateAndEndTime(date, item.startTime, item.endTime, timezone).getTime();
    if (endMs <= startMs) return null;
    return Math.min(100, Math.max(0, ((now.getTime() - startMs) / (endMs - startMs)) * 100));
  })();

  function handleAction(action: "start" | "skip") {
    if (!item.activityLog) return;
    const mutation = action === "start" ? startActivity : skipActivity;
    mutation.mutate(item.activityLog.id, {
      onError: (error) => toast.error(getFriendlyErrorMessage(error)),
    });
  }

  return (
    <>
      <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card ring-1 ring-primary/20">
        <CardContent className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            {logStatus === "IN_PROGRESS" ? "IN PROGRESS" : "HAPPENING NOW"}
          </div>

          <button type="button" className="block w-full text-left" onClick={() => setDetailOpen(true)}>
            <p className="text-xl font-bold">{item.activityName}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <CategoryBadge name={item.categoryName} color={item.categoryColor} icon={item.categoryIcon} />
              {!isTimeless && (
                <span>
                  {item.startTime} – {item.endTime} (
                  {formatDurationMinutes(minutesBetween(item.startTime as string, item.endTime as string))})
                </span>
              )}
              {item.alarmEnabled && <BellRing className="h-3.5 w-3.5" aria-label="Alarm enabled" />}
            </div>

            {isTimeless ? (
              <p className="mt-1 text-sm text-muted-foreground">Anytime today</p>
            ) : (
              <div className="mt-2.5 space-y-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/15">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progressPercent ?? 0}%` }}
                  />
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  {(remaining as number) >= 0
                    ? `${formatDurationMinutes(remaining as number)} remaining`
                    : "Running over the planned time"}
                </p>
              </div>
            )}
          </button>

          {(canStart || canComplete || canSkip) && (
            <div className="flex gap-2">
              {canStart && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => handleAction("start")}
                >
                  Start
                </Button>
              )}
              {canComplete && (
                <Button size="sm" onClick={() => setCompletingItem(item)}>
                  {logStatus === "IN_PROGRESS" ? "End" : "Complete"}
                </Button>
              )}
              {canSkip && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => handleAction("skip")}
                >
                  {isTimeless ? "Close" : "Skip"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ActivityDetailSheet item={detailOpen ? item : null} nowTime={nowTime} onOpenChange={setDetailOpen} />

      <CompleteActivityDialog
        item={completingItem}
        onOpenChange={(open) => !open && setCompletingItem(null)}
      />
    </>
  );
}
