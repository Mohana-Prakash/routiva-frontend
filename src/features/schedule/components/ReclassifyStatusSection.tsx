"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReclassifyActivity } from "@/features/tracking/hooks/useTrackingMutations";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";
import type { ActivityLog, ActivityLogStatus, ReclassifyLogInput } from "@/types/activity-log";

interface ReclassifyStatusSectionProps {
  log: ActivityLog;
}

const TARGETS: { status: ReclassifyLogInput["status"]; label: string; matches: ActivityLogStatus[] }[] = [
  { status: "COMPLETED", label: "Completed", matches: ["COMPLETED", "ADJUSTED"] },
  { status: "SKIPPED", label: "Skipped", matches: ["SKIPPED"] },
  { status: "MISSED", label: "Missed", matches: ["MISSED"] },
];

/**
 * Fixes an already-resolved log marked wrong by mistake (e.g. tapped Complete, meant Skip).
 * Moving off Completed clears the recorded actual minutes; moving onto it without a known
 * actual duration falls back to the planned window server-side — refine via "Correct actual
 * timing" below if needed.
 */
export function ReclassifyStatusSection({ log }: ReclassifyStatusSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const reclassify = useReclassifyActivity();

  return (
    <div>
      {!isEditing ? (
        <Button size="sm" variant="ghost" className="w-fit" onClick={() => setIsEditing(true)}>
          <Pencil className="h-4 w-4" />
          Wrong status? Fix it
        </Button>
      ) : (
        <div className="space-y-2 rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">What actually happened?</p>
          <div className="flex flex-wrap gap-2">
            {TARGETS.map((target) => {
              const isCurrent = target.matches.includes(log.status);
              return (
                <Button
                  key={target.status}
                  size="sm"
                  variant={isCurrent ? "default" : "outline"}
                  disabled={isCurrent || reclassify.isPending}
                  onClick={() =>
                    reclassify.mutate(
                      { logId: log.id, input: { status: target.status } },
                      {
                        onSuccess: () => {
                          toast.success(`Marked ${target.label.toLowerCase()}`);
                          setIsEditing(false);
                        },
                        onError: (error) => toast.error(getFriendlyErrorMessage(error)),
                      },
                    )
                  }
                >
                  {target.label}
                </Button>
              );
            })}
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4" /> Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
