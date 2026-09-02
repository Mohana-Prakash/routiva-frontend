"use client";

import { BellRing, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { formatDurationMinutes, minutesBetween } from "@/lib/datetime/time";
import { getTimelineDisplayStatus } from "../lib/timelineStatus";
import { TIMELINE_STATUS_PRESENTATION } from "./timelineStatusPresentation";
import { SOURCE_PRESENTATION } from "./sourcePresentation";
import {
  useMarkMissedActivity,
  useSkipActivity,
  useStartActivity,
} from "@/features/tracking/hooks/useTrackingMutations";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTrackingAvailability } from "../hooks/useTrackingAvailability";
import type { ScheduleDayItem } from "@/types/schedule";

interface TimelineItemProps {
  item: ScheduleDayItem;
  nowTime: string;
  date: string;
  timezone: string;
  onSelect: (item: ScheduleDayItem) => void;
  highlighted?: boolean;
}

export function TimelineItem({
  item,
  nowTime,
  date,
  timezone,
  onSelect,
  highlighted,
}: TimelineItemProps) {
  const displayStatus = getTimelineDisplayStatus(item, nowTime);
  const presentation = TIMELINE_STATUS_PRESENTATION[displayStatus];
  const StatusIcon = presentation.icon;
  const sourcePresentation = SOURCE_PRESENTATION[item.source];
  const SourceIcon = sourcePresentation.icon;

  const startActivity = useStartActivity();
  const skipActivity = useSkipActivity();
  const markMissedActivity = useMarkMissedActivity();

  function handleAction(action: "start" | "skip" | "miss") {
    if (!item.activityLog) return;
    const mutation = action === "start" ? startActivity : action === "skip" ? skipActivity : markMissedActivity;
    mutation.mutate(item.activityLog.id, {
      onError: (error) => toast.error(getFriendlyErrorMessage(error)),
    });
  }

  const isPending = startActivity.isPending || skipActivity.isPending || markMissedActivity.isPending;
  // Complete is deliberately not offered here — it needs the "how long did you actually spend
  // on this" prompt, which belongs in the detail sheet (tap the tile to open it), not inline on
  // a tile meant for a quick glance at the day.
  const { isTimeless, canStart, canSkip, canMarkMissed } = useTrackingAvailability(item, date, timezone);

  return (
    <li className="flex gap-3 py-2">
      <div className="w-14 shrink-0 pt-2 text-right text-xs text-muted-foreground tabular-nums">
        {isTimeless ? (
          <div className="text-muted-foreground/70">Anytime</div>
        ) : (
          <>
            <div>{item.startTime}</div>
            <div>{item.endTime}</div>
            <div className="mt-0.5 text-[10px] text-muted-foreground/70">
              {formatDurationMinutes(minutesBetween(item.startTime as string, item.endTime as string))}
            </div>
          </>
        )}
      </div>

      {/* A real <button> can't contain the Start/Skip buttons below without invalid
          nested-button HTML, so this is a div with the same keyboard/role semantics instead. */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(item)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(item);
          }
        }}
        className={cn(
          "min-w-0 flex-1 cursor-pointer rounded-lg border bg-card p-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          highlighted && "border-primary ring-2 ring-primary/40",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.activityName}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <CategoryBadge
                name={item.categoryName}
                color={item.categoryColor}
                icon={item.categoryIcon}
              />
              <Badge
                variant="outline"
                className="gap-1 text-[10px] font-normal text-muted-foreground"
              >
                <SourceIcon className="h-3 w-3" aria-hidden="true" />
                {sourcePresentation.label}
              </Badge>
              {item.alarmEnabled && (
                <BellRing
                  className="h-3.5 w-3.5 text-muted-foreground"
                  aria-label="Alarm enabled"
                />
              )}
              {item.hasConflict && (
                <AlertTriangle
                  className="h-3.5 w-3.5 text-destructive"
                  aria-label="Schedule conflict"
                />
              )}
            </div>
          </div>
          <span
            className={cn(
              "flex shrink-0 items-center gap-1 text-xs font-medium",
              presentation.className,
            )}
          >
            <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {presentation.label}
          </span>
        </div>

        {item.activityLog?.actualStart && item.activityLog?.actualEnd && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Actual:{" "}
            {formatActualRange(
              item.activityLog.actualStart,
              item.activityLog.actualEnd,
            )}
          </p>
        )}

        {(canStart || canSkip || canMarkMissed) && (
          <div
            className="mt-2.5 flex gap-2"
            onClick={(e) => e.stopPropagation()}
          >
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
            {canMarkMissed && (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                disabled={isPending}
                onClick={() => handleAction("miss")}
              >
                Mark Missed
              </Button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

function formatActualRange(actualStart: string, actualEnd: string): string {
  const start = new Date(actualStart);
  const end = new Date(actualEnd);
  const minutes = Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / 60_000),
  );
  return formatDurationMinutes(minutes);
}
