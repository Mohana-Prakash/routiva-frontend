"use client";

import { BellRing, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { combineDateAndTime, formatDurationMinutes, minutesBetween } from "@/lib/datetime/time";
import { getTimelineDisplayStatus } from "../lib/timelineStatus";
import { TIMELINE_STATUS_PRESENTATION } from "./timelineStatusPresentation";
import {
  useCompleteActivity,
  useSkipActivity,
  useStartActivity,
} from "@/features/tracking/hooks/useTrackingMutations";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNow } from "@/hooks/useNow";
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
  const logStatus = item.activityLog?.status;

  const startActivity = useStartActivity();
  const completeActivity = useCompleteActivity();
  const skipActivity = useSkipActivity();
  const now = useNow();

  function handleAction(action: "start" | "complete" | "skip") {
    if (!item.activityLog) return;
    const mutation =
      action === "start"
        ? startActivity
        : action === "complete"
          ? completeActivity
          : skipActivity;
    mutation.mutate(item.activityLog.id, {
      onError: (error) => toast.error(getFriendlyErrorMessage(error)),
    });
  }

  const isPending =
    startActivity.isPending ||
    completeActivity.isPending ||
    skipActivity.isPending;
  // Start/Complete only become available once the activity's scheduled time has
  // actually arrived — you can't log time for something that hasn't happened yet.
  // Skip is exempt: you can always skip ahead, planned or not.
  const timeHasArrived =
    combineDateAndTime(date, item.startTime, timezone).getTime() <= now.getTime();
  // Planned items can be started, or completed directly for quick one-tap tracking
  // (frontend-requirements 03 §10) — actual timing may legitimately differ from plan.
  const canStart = logStatus === "PLANNED" && timeHasArrived;
  const canComplete =
    logStatus === "IN_PROGRESS" || (logStatus === "PLANNED" && timeHasArrived);
  const canSkip = logStatus === "PLANNED" || logStatus === "IN_PROGRESS";

  return (
    <li className="flex gap-3 py-2">
      <div className="w-14 shrink-0 pt-2 text-right text-xs text-muted-foreground tabular-nums">
        <div>{item.startTime}</div>
        <div>{item.endTime}</div>
        <div className="mt-0.5 text-[10px] text-muted-foreground/70">
          {formatDurationMinutes(minutesBetween(item.startTime, item.endTime))}
        </div>
      </div>

      {/* A real <button> can't contain the Start/Complete/Skip buttons below without
          invalid nested-button HTML, so this is a div with the same keyboard/role
          semantics instead. */}
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

        {(canStart || canComplete || canSkip) && (
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
            {canComplete && (
              <Button
                size="sm"
                disabled={isPending}
                onClick={() => handleAction("complete")}
              >
                Complete
              </Button>
            )}
            {canSkip && (
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => handleAction("skip")}
              >
                Skip
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
