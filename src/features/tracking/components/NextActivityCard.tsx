"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { ActivityDetailSheet } from "@/features/schedule/components/ActivityDetailSheet";
import { formatDurationMinutes, minutesUntil } from "@/lib/datetime/time";
import type { ScheduleDayItem } from "@/types/schedule";

interface NextActivityCardProps {
  item: ScheduleDayItem;
  nowTime: string;
}

export function NextActivityCard({ item, nowTime }: NextActivityCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const startsIn = minutesUntil(item.startTime, nowTime);

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Next</CardTitle>
        </CardHeader>
        <CardContent>
          <button type="button" className="block w-full text-left" onClick={() => setDetailOpen(true)}>
            <p className="text-lg font-semibold">{item.activityName}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <CategoryBadge name={item.categoryName} color={item.categoryColor} icon={item.categoryIcon} />
              {item.alarmEnabled && <BellRing className="h-3.5 w-3.5" aria-label="Alarm enabled" />}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Starts at {item.startTime} · in {formatDurationMinutes(startsIn)}
            </p>
          </button>
        </CardContent>
      </Card>

      <ActivityDetailSheet item={detailOpen ? item : null} nowTime={nowTime} onOpenChange={setDetailOpen} />
    </>
  );
}
