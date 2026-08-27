"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BellRing } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { ActivityDetailSheet } from "@/features/schedule/components/ActivityDetailSheet";
import { formatDurationMinutes, minutesBetween, minutesUntil } from "@/lib/datetime/time";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";
import { useSkipActivity } from "../hooks/useTrackingMutations";
import { CompleteActivityDialog } from "./CompleteActivityDialog";
import type { ScheduleDayItem } from "@/types/schedule";

interface CurrentActivityCardProps {
  item: ScheduleDayItem;
  nowTime: string;
}

export function CurrentActivityCard({ item, nowTime }: CurrentActivityCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [completingItem, setCompletingItem] = useState<ScheduleDayItem | null>(null);
  const skipActivity = useSkipActivity();
  const isTimeless = !item.startTime || !item.endTime;
  const remaining = isTimeless ? null : minutesUntil(item.endTime as string, nowTime);
  // This card only ever shows an IN_PROGRESS activity (see dashboard/page.tsx) — once you've
  // actually started it, skipping after its window closed is meaningless, since the only
  // honest options left are Complete (say how long you actually spent) or leaving it as is.
  const timeHasEnded = !isTimeless && nowTime >= (item.endTime as string);

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Current Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button type="button" className="block w-full text-left" onClick={() => setDetailOpen(true)}>
            <p className="text-lg font-semibold">{item.activityName}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <CategoryBadge name={item.categoryName} color={item.categoryColor} icon={item.categoryIcon} />
              {!isTimeless && (
                <span>
                  {item.startTime} – {item.endTime} (
                  {formatDurationMinutes(minutesBetween(item.startTime as string, item.endTime as string))})
                </span>
              )}
              {item.alarmEnabled && <BellRing className="h-3.5 w-3.5" aria-label="Alarm enabled" />}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {isTimeless ? "Anytime today" : `${formatDurationMinutes(remaining as number)} remaining`}
            </p>
          </button>
          {item.activityLog && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setCompletingItem(item)}>
                End
              </Button>
              {!timeHasEnded && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={skipActivity.isPending}
                  onClick={() => skipActivity.mutate(item.activityLog!.id, { onError: (e) => toast.error(getFriendlyErrorMessage(e)) })}
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
