"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, X } from "lucide-react";
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
import { useReclassifyActivity } from "@/features/tracking/hooks/useTrackingMutations";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";
import { formatDurationMinutes } from "@/lib/datetime/time";
import type {
  ActivityLog,
  ActivityLogStatus,
  ReclassifyLogInput,
} from "@/types/activity-log";

interface ReclassifyStatusSectionProps {
  log: ActivityLog;
  /** Called right after a successful reclassify. The parent's `item` is a snapshot taken when
   * the sheet opened, so it won't reflect the new status on its own — close the sheet instead
   * of leaving it visibly showing the old one. */
  onReclassified: () => void;
}

const MAX_MINUTES = 24 * 60;

const NON_COMPLETE_TARGETS: {
  status: "SKIPPED" | "MISSED";
  label: string;
  matches: ActivityLogStatus[];
}[] = [
  { status: "SKIPPED", label: "Skipped", matches: ["SKIPPED"] },
  { status: "MISSED", label: "Missed", matches: ["MISSED"] },
];

const IS_COMPLETED = (status: ActivityLogStatus) =>
  status === "COMPLETED" || status === "ADJUSTED";

/**
 * Fixes an already-resolved log marked wrong by mistake (e.g. tapped Complete, meant Skip).
 * Moving off Completed clears the recorded actual minutes. Moving onto Completed pops the same
 * "how long did it actually take" dialog as the regular Complete action, rather than a
 * second design inline in the drawer — a resolved log just has no in-progress actualStart to
 * anchor to, so it goes through the reclassify mutation instead of the plain complete one.
 */
export function ReclassifyStatusSection({
  log,
  onReclassified,
}: ReclassifyStatusSectionProps) {
  const [view, setView] = useState<"closed" | "picking">("closed");
  const [completing, setCompleting] = useState(false);
  const [mode, setMode] = useState<"full" | "custom">("full");
  const [customMinutes, setCustomMinutes] = useState("");
  const reclassify = useReclassifyActivity();

  const plannedDurationMinutes =
    log.plannedStart && log.plannedEnd
      ? Math.round(
          (new Date(log.plannedEnd).getTime() -
            new Date(log.plannedStart).getTime()) /
            60_000,
        )
      : null;

  function reset() {
    setView("closed");
    setCompleting(false);
  }

  function submit(input: ReclassifyLogInput) {
    reclassify.mutate(
      { logId: log.id, input },
      {
        onSuccess: () => {
          toast.success(
            input.status === "COMPLETED"
              ? "Marked completed"
              : `Marked ${input.status.toLowerCase()}`,
          );
          reset();
          onReclassified();
        },
        onError: (error) => toast.error(getFriendlyErrorMessage(error)),
      },
    );
  }

  function startCompleting() {
    setMode(plannedDurationMinutes !== null ? "full" : "custom");
    setCustomMinutes(
      plannedDurationMinutes !== null ? String(plannedDurationMinutes) : "",
    );
    setCompleting(true);
  }

  function confirmCompletion() {
    const minutes =
      mode === "full" ? plannedDurationMinutes : Number(customMinutes);
    if (!minutes || minutes <= 0) {
      toast.error("Enter how many minutes it actually took");
      return;
    }
    if (minutes > MAX_MINUTES) {
      toast.error("That's more than 24 hours");
      return;
    }

    // Anchor to the planned start when there is one — this is a retroactive correction, not a
    // live completion, so "now" would be a worse guess than the activity's own planned time.
    const anchor = log.plannedStart
      ? new Date(log.plannedStart)
      : new Date(Date.now() - minutes * 60_000);
    const actualStart = anchor;
    const actualEnd = new Date(anchor.getTime() + minutes * 60_000);

    submit({
      status: "COMPLETED",
      actualStart: actualStart.toISOString(),
      actualEnd: actualEnd.toISOString(),
    });
  }

  if (view === "closed") {
    return (
      <Button
        size="sm"
        variant="outline"
        className="w-fit border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary dark:border-primary/40 dark:bg-primary/15 dark:hover:bg-primary/25"
        onClick={() => setView("picking")}
      >
        <Pencil className="h-4 w-4" />
        Update status
      </Button>
    );
  }

  return (
    <>
      <div className="space-y-2 rounded-lg border p-3">
        <p className="text-xs text-muted-foreground">What actually happened?</p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={IS_COMPLETED(log.status) ? "default" : "outline"}
            disabled={IS_COMPLETED(log.status) || reclassify.isPending}
            onClick={startCompleting}
          >
            Completed
          </Button>
          {NON_COMPLETE_TARGETS.map((target) => {
            const isCurrent = target.matches.includes(log.status);
            return (
              <Button
                key={target.status}
                size="sm"
                variant={isCurrent ? "default" : "outline"}
                disabled={isCurrent || reclassify.isPending}
                onClick={() => submit({ status: target.status })}
              >
                {target.label}
              </Button>
            );
          })}
          <Button size="sm" variant="ghost" onClick={reset}>
            <X className="h-4 w-4" /> Cancel
          </Button>
        </div>
      </div>

      <Dialog open={completing} onOpenChange={setCompleting}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Complete &quot;{log.activityNameSnapshot ?? "this activity"}&quot;
            </DialogTitle>
            <DialogDescription>
              How long did it actually take
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
                <Label htmlFor="reclassify-complete-minutes">Minutes spent</Label>
                <Input
                  id="reclassify-complete-minutes"
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
            <Button disabled={reclassify.isPending} onClick={confirmCompletion}>
              {reclassify.isPending ? "Saving…" : "Mark Complete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
