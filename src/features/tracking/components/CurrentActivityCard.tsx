"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BellRing } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { ActivityDetailSheet } from "@/features/schedule/components/ActivityDetailSheet";
import { formatDurationMinutes, minutesUntil } from "@/lib/datetime/time";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";
import { useCompleteActivity, useSkipActivity } from "../hooks/useTrackingMutations";
import type { ScheduleDayItem } from "@/types/schedule";

interface CurrentActivityCardProps {
  item: ScheduleDayItem;
  nowTime: string;
}

export function CurrentActivityCard({ item, nowTime }: CurrentActivityCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const completeActivity = useCompleteActivity();
  const skipActivity = useSkipActivity();
  const remaining = minutesUntil(item.endTime, nowTime);

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
              <span>
                {item.startTime} – {item.endTime}
              </span>
              {item.alarmEnabled && <BellRing className="h-3.5 w-3.5" aria-label="Alarm enabled" />}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{formatDurationMinutes(remaining)} remaining</p>
          </button>
          {item.activityLog && (
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={completeActivity.isPending}
                onClick={() => completeActivity.mutate(item.activityLog!.id, { onError: (e) => toast.error(getFriendlyErrorMessage(e)) })}
              >
                Complete
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={skipActivity.isPending}
                onClick={() => skipActivity.mutate(item.activityLog!.id, { onError: (e) => toast.error(getFriendlyErrorMessage(e)) })}
              >
                Skip
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ActivityDetailSheet item={detailOpen ? item : null} nowTime={nowTime} onOpenChange={setDetailOpen} />
    </>
  );
}
