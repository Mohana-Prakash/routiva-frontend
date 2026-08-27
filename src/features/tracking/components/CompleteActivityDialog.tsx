"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCompleteActivity } from "../hooks/useTrackingMutations";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";
import { formatDurationMinutes, minutesBetween } from "@/lib/datetime/time";
import type { ScheduleDayItem } from "@/types/schedule";

const MAX_MINUTES = 24 * 60;

interface CompleteActivityDialogProps {
  /** The item being completed; `null` closes the dialog (mirrors ActivityDetailSheet's
   * item-as-open-flag convention). */
  item: ScheduleDayItem | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Asks how long the activity actually took before marking it complete, instead of silently
 * assuming the full planned duration (or "right now") happened — a fixed 30-minute slot might
 * only have taken 15. Reused across the timeline row, the detail sheet, and the current-activity
 * card, since all three offer the same Complete/End action.
 */
export function CompleteActivityDialog({ item, onOpenChange }: CompleteActivityDialogProps) {
  const completeActivity = useCompleteActivity();
  const plannedDurationMinutes =
    item?.startTime && item?.endTime ? minutesBetween(item.startTime, item.endTime) : null;
  const [mode, setMode] = useState<"full" | "custom">("full");
  const [customMinutes, setCustomMinutes] = useState("");

  useEffect(() => {
    if (item) {
      setMode(plannedDurationMinutes !== null ? "full" : "custom");
      setCustomMinutes(plannedDurationMinutes !== null ? String(plannedDurationMinutes) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  if (!item?.activityLog) return null;
  const log = item.activityLog;

  function confirm() {
    const minutes = mode === "full" ? plannedDurationMinutes : Number(customMinutes);
    if (!minutes || minutes <= 0) {
      toast.error("Enter how many minutes you spent");
      return;
    }
    if (minutes > MAX_MINUTES) {
      toast.error("That's more than 24 hours");
      return;
    }

    // If it was actually started, anchor to that real timestamp and add the reported duration.
    // Otherwise (one-tap complete with no Start) there's no real start to anchor to, so work
    // backward from now instead.
    const knownStart = log.actualStart ? new Date(log.actualStart) : null;
    const actualStart = knownStart ?? new Date(Date.now() - minutes * 60_000);
    const actualEnd = knownStart ? new Date(knownStart.getTime() + minutes * 60_000) : new Date();

    completeActivity.mutate(
      {
        logId: log.id,
        input: { actualStart: actualStart.toISOString(), actualEnd: actualEnd.toISOString() },
      },
      {
        onSuccess: () => {
          toast.success("Marked complete");
          onOpenChange(false);
        },
        onError: (error) => toast.error(getFriendlyErrorMessage(error)),
      },
    );
  }

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Complete &quot;{item.activityName}&quot;</DialogTitle>
          <DialogDescription>
            How long did you actually spend on this
            {plannedDurationMinutes !== null
              ? ` — the plan was ${formatDurationMinutes(plannedDurationMinutes)}`
              : ""}
            ?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {plannedDurationMinutes !== null && (
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={mode === "full" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setMode("full")}
              >
                Full planned duration ({formatDurationMinutes(plannedDurationMinutes)})
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mode === "custom" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setMode("custom")}
              >
                Different amount
              </Button>
            </div>
          )}
          {(mode === "custom" || plannedDurationMinutes === null) && (
            <div className="space-y-1.5">
              <Label htmlFor="complete-minutes">Minutes spent</Label>
              <Input
                id="complete-minutes"
                type="number"
                min={1}
                max={MAX_MINUTES}
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button disabled={completeActivity.isPending} onClick={confirm}>
            {completeActivity.isPending ? "Saving…" : "Mark Complete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
