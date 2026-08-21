"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/AuthProvider";
import { useCorrectActualTiming } from "@/features/tracking/hooks/useTrackingMutations";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";
import { formatIsoToTime, combineDateAndTime } from "@/lib/datetime/time";
import type { ActivityLog } from "@/types/activity-log";

interface CorrectActualTimingSectionProps {
  date: string;
  log: ActivityLog;
}

/**
 * Lets the user correct the recorded actual start/end and add a note for a
 * completed activity (frontend-requirements 03 §10). Keyed by the parent on
 * item.id, so switching activities resets local editing state for free.
 */
export function CorrectActualTimingSection({ date, log }: CorrectActualTimingSectionProps) {
  const { user } = useAuth();
  const timezone = user?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [isEditing, setIsEditing] = useState(false);
  const [actualStart, setActualStart] = useState(log.actualStart ? formatIsoToTime(log.actualStart, timezone) : "");
  const [actualEnd, setActualEnd] = useState(log.actualEnd ? formatIsoToTime(log.actualEnd, timezone) : "");
  const [notes, setNotes] = useState(log.notes ?? "");
  const correctTiming = useCorrectActualTiming();

  function handleSave() {
    correctTiming.mutate(
      {
        logId: log.id,
        input: {
          actualStart: actualStart ? combineDateAndTime(date, actualStart, timezone).toISOString() : undefined,
          actualEnd: actualEnd ? combineDateAndTime(date, actualEnd, timezone).toISOString() : undefined,
          notes: notes || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Actual timing updated");
          setIsEditing(false);
        },
        onError: (error) => toast.error(getFriendlyErrorMessage(error)),
      },
    );
  }

  if (!isEditing) {
    return (
      <Button size="sm" variant="ghost" className="w-fit" onClick={() => setIsEditing(true)}>
        <Pencil className="h-4 w-4" />
        Correct actual timing / add note
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="actual-start">Actual start</Label>
          <Input id="actual-start" type="time" value={actualStart} onChange={(e) => setActualStart(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="actual-end">Actual end</Label>
          <Input id="actual-end" type="time" value={actualEnd} onChange={(e) => setActualEnd(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="actual-notes">Note</Label>
        <Textarea id="actual-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button size="sm" disabled={correctTiming.isPending} onClick={handleSave}>
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
          <X className="h-4 w-4" /> Cancel
        </Button>
      </div>
    </div>
  );
}
