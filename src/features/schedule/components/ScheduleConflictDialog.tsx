"use client";

import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { formatDurationMinutes, minutesBetween } from "@/lib/datetime/time";
import type { ScheduleConflictEntry } from "@/types/api";
import type { ConflictResolution } from "@/types/schedule";

interface ScheduleConflictDialogProps {
  conflicts: ScheduleConflictEntry[] | null;
  onResolve: (resolution: ConflictResolution) => void;
}

/**
 * Shown whenever the backend returns 409 SCHEDULE_CONFLICT
 * (frontend-requirements 02 §8). Never auto-resolves — the user must
 * explicitly pick one of the backend-supported outcomes.
 */
export function ScheduleConflictDialog({ conflicts, onResolve }: ScheduleConflictDialogProps) {
  return (
    <AlertDialog open={!!conflicts} onOpenChange={(open) => !open && onResolve("CANCEL")}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
            Schedule conflict
          </AlertDialogTitle>
          <AlertDialogDescription>
            This overlaps with {conflicts?.length === 1 ? "an existing activity" : "existing activities"}:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ul className="space-y-1.5 rounded-lg border bg-muted/40 p-3 text-sm">
          {conflicts?.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2">
              <span className="font-medium">{c.activityName}</span>
              <span className="text-muted-foreground">
                {c.startTime} – {c.endTime} ({formatDurationMinutes(minutesBetween(c.startTime, c.endTime))})
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2">
          <AlertDialogAction variant="outline" className="w-full justify-start" onClick={() => onResolve("KEEP_BOTH")}>
            Keep both — allow the overlap
          </AlertDialogAction>
          <AlertDialogAction variant="outline" className="w-full justify-start" onClick={() => onResolve("SHIFT_AFFECTED")}>
            Shift the affected activities
          </AlertDialogAction>
          <AlertDialogAction variant="outline" className="w-full justify-start" onClick={() => onResolve("SKIP_AFFECTED_TODAY")}>
            Skip the affected activities for this date
          </AlertDialogAction>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onResolve("CANCEL")}>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
