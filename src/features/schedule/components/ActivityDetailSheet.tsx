"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ConfirmDialog,
  useConfirmDialog,
} from "@/components/shared/ConfirmDialog";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import {
  combineDateAndTime,
  formatDateLabel,
  formatDurationMinutes,
  formatIsoToTime,
  minutesBetween,
} from "@/lib/datetime/time";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";
import { useAuth } from "@/features/auth/AuthProvider";
import {
  useSkipActivity,
  useStartActivity,
} from "@/features/tracking/hooks/useTrackingMutations";
import { CompleteActivityDialog } from "@/features/tracking/components/CompleteActivityDialog";
import {
  useCreateScheduleException,
  useDeleteScheduleException,
} from "../hooks/useScheduleExceptionMutations";
import { getTimelineDisplayStatus } from "../lib/timelineStatus";
import { TIMELINE_STATUS_PRESENTATION } from "./timelineStatusPresentation";
import { AdjustTimeSection } from "./AdjustTimeSection";
import { CorrectActualTimingSection } from "./CorrectActualTimingSection";
import { useNow } from "@/hooks/useNow";
import type { ScheduleDayItem } from "@/types/schedule";

interface ActivityDetailSheetProps {
  item: ScheduleDayItem | null;
  nowTime: string;
  onOpenChange: (open: boolean) => void;
}

const SOURCE_LABEL: Record<ScheduleDayItem["source"], string> = {
  BASE: "Recurring (base schedule)",
  EXCEPTION: "One-time change for this date",
  ONE_TIME: "One-time",
};

export function ActivityDetailSheet({
  item,
  nowTime,
  onOpenChange,
}: ActivityDetailSheetProps) {
  const { user } = useAuth();
  const removeConfirm = useConfirmDialog();

  const startActivity = useStartActivity();
  const skipActivity = useSkipActivity();
  const createException = useCreateScheduleException();
  const deleteException = useDeleteScheduleException();
  const now = useNow();
  const [completingItem, setCompletingItem] = useState<ScheduleDayItem | null>(null);

  if (!item) return null;

  const displayStatus = getTimelineDisplayStatus(item, nowTime);
  const presentation = TIMELINE_STATUS_PRESENTATION[displayStatus];
  const log = item.activityLog;
  const timezone =
    user?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  function handleRemoveForToday() {
    if (item!.exceptionId) {
      deleteException.mutate(item!.exceptionId, {
        onSuccess: () => {
          toast.success("Removed for this date");
          removeConfirm.hide();
          onOpenChange(false);
        },
        onError: (error) => toast.error(getFriendlyErrorMessage(error)),
      });
      return;
    }
    createException.mutate(
      {
        sourceScheduleEntryId: item!.scheduleEntryId,
        activityId: item!.activityId,
        date: item!.date,
        action: "SKIP",
      },
      {
        onSuccess: () => {
          toast.success("Skipped for this date");
          removeConfirm.hide();
          onOpenChange(false);
        },
        onError: (error) => toast.error(getFriendlyErrorMessage(error)),
      },
    );
  }

  const isTrackingPending = startActivity.isPending || skipActivity.isPending;
  // Same gates as the timeline row: Start/Complete only once the scheduled time has actually
  // arrived, and Complete has no upper bound — the system never assumes an outcome just
  // because the planned window passed (including on a MISSED log, which just means the window
  // passed without being acted on, not a final verdict). Timeless items are available all day.
  const isTimeless = !item.startTime || !item.endTime;
  const timeHasArrived =
    isTimeless ||
    combineDateAndTime(item.date, item.startTime as string, timezone).getTime() <=
      now.getTime();
  const timeHasEnded =
    !isTimeless &&
    combineDateAndTime(item.date, item.endTime as string, timezone).getTime() < now.getTime();
  const canStart = log?.status === "PLANNED" && timeHasArrived;
  const canComplete =
    log?.status === "IN_PROGRESS" ||
    log?.status === "MISSED" ||
    (log?.status === "PLANNED" && timeHasArrived);
  // Skip has an upper bound Complete doesn't: once actually started, skipping after the window
  // closed is meaningless — the only honest options left are Complete or leaving it as is.
  // MISSED (never started) is the exception, since acknowledging it as skipped is still
  // meaningful even after the window closed.
  const canSkip =
    (log?.status === "PLANNED" && !timeHasEnded) ||
    (log?.status === "IN_PROGRESS" && !timeHasEnded) ||
    log?.status === "MISSED";
  // Once tracking has moved past PLANNED (started, completed, or skipped), the planned time is
  // historical — editing it would retroactively contradict data already recorded against it.
  const canAdjustTime = !log || log.status === "PLANNED";

  return (
    <>
      <Sheet open={!!item} onOpenChange={onOpenChange}>
        <SheetContent className="flex flex-col overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{item.activityName}</SheetTitle>
            <SheetDescription>{formatDateLabel(item.date)}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-5 overflow-y-auto px-4">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge
                name={item.categoryName}
                color={item.categoryColor}
                icon={item.categoryIcon}
              />
              <Badge variant="outline" className={presentation.className}>
                {presentation.label}
              </Badge>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground mt-1">Planned</dt>
                <dd>
                  {isTimeless ? (
                    "Anytime today"
                  ) : (
                    <>
                      {item.startTime} – {item.endTime} (
                      {formatDurationMinutes(
                        minutesBetween(item.startTime as string, item.endTime as string),
                      )}
                      )
                    </>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground mt-1">Actual</dt>
                <dd>
                  {log?.actualStart ? (
                    <>
                      {formatIsoToTime(log.actualStart, timezone)} –{" "}
                      {log.actualEnd ? formatIsoToTime(log.actualEnd, timezone) : "…"}
                      {log.actualEnd && (
                        <>
                          {" "}
                          (
                          {formatDurationMinutes(
                            (new Date(log.actualEnd).getTime() - new Date(log.actualStart).getTime()) / 60_000,
                          )}
                          )
                        </>
                      )}
                    </>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground mt-1">Alarm</dt>
                <dd>
                  {item.alarmEnabled
                    ? `${item.alarmOffsetMinutes ?? 0} min before`
                    : "Off"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground mt-1">Source</dt>
                <dd>{SOURCE_LABEL[item.source]}</dd>
              </div>
            </dl>

            {item.notes && (
              <div>
                <p className="text-xs text-muted-foreground mt-1">Notes</p>
                <p className="text-sm">{item.notes}</p>
              </div>
            )}

            {(canStart || canComplete || canSkip) && (
              <div className="flex flex-wrap gap-2">
                {canStart && log && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isTrackingPending}
                    onClick={() =>
                      startActivity.mutate(log.id, {
                        onError: (e) => toast.error(getFriendlyErrorMessage(e)),
                      })
                    }
                  >
                    Start
                  </Button>
                )}
                {canComplete && log && (
                  <Button size="sm" onClick={() => setCompletingItem(item)}>
                    {log.status === "IN_PROGRESS" ? "End" : "Complete"}
                  </Button>
                )}
                {canSkip && log && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isTrackingPending}
                    onClick={() =>
                      skipActivity.mutate(log.id, {
                        onError: (e) => toast.error(getFriendlyErrorMessage(e)),
                      })
                    }
                  >
                    {isTimeless ? "Close" : "Skip"}
                  </Button>
                )}
              </div>
            )}

            {log &&
              (log.status === "COMPLETED" || log.status === "ADJUSTED") && (
                <CorrectActualTimingSection
                  key={item.id}
                  date={item.date}
                  log={log}
                />
              )}

            {!isTimeless && canAdjustTime && (
              <AdjustTimeSection key={item.id} item={item} />
            )}
          </div>

          <SheetFooter>
            <Button variant="destructive" onClick={removeConfirm.show}>
              <Trash2 className="h-4 w-4" />
              {item.source === "BASE" ? "Skip for this date" : "Remove"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={removeConfirm.open}
        onOpenChange={removeConfirm.onOpenChange}
        title={
          item.source === "BASE"
            ? `Skip "${item.activityName}" for this date?`
            : `Remove "${item.activityName}"?`
        }
        description="Your recurring schedule and historical records are not affected."
        confirmLabel={item.source === "BASE" ? "Skip" : "Remove"}
        destructive
        isConfirming={deleteException.isPending || createException.isPending}
        onConfirm={handleRemoveForToday}
      />

      <CompleteActivityDialog
        item={completingItem}
        onOpenChange={(open) => !open && setCompletingItem(null)}
      />
    </>
  );
}
