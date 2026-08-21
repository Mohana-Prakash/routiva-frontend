"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Archive, ArchiveRestore, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ConfirmDialog,
  useConfirmDialog,
} from "@/components/shared/ConfirmDialog";
import { LoadingSkeletonList } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";
import { formatDurationMinutes, minutesBetween } from "@/lib/datetime/time";
import { useScheduleEntries } from "../hooks/useScheduleEntries";
import { useDeleteScheduleEntry, useUpdateScheduleEntry } from "../hooks/useScheduleEntryMutations";
import { useActivities } from "@/features/activities/hooks/useActivities";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { ScheduleEntryFormDialog } from "./ScheduleEntryFormDialog";
import type { ScheduleEntry } from "@/types/schedule";

function describeRecurrence(entry: ScheduleEntry): string {
  if (entry.recurrence.type === "DAILY") return "Daily";
  if (entry.recurrence.type === "ONE_TIME")
    return entry.recurrence.date
      ? `Once on ${entry.recurrence.date}`
      : "One-time";
  const days = entry.recurrence.daysOfWeek ?? [];
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days.length
    ? days.map((d) => labels[d]).join(", ")
    : "Selected weekdays";
}

export function ScheduleEntryList() {
  const {
    data: entries,
    isLoading,
    isError,
    error,
    refetch,
  } = useScheduleEntries();
  const { data: activities } = useActivities();
  const { data: categories } = useCategories();
  const [editing, setEditing] = useState<ScheduleEntry | null | undefined>(
    undefined,
  );
  const [deactivating, setDeactivating] = useState<ScheduleEntry | null>(null);
  const deactivateEntry = useDeleteScheduleEntry();
  const updateEntry = useUpdateScheduleEntry();
  const confirm = useConfirmDialog();

  if (isLoading) return <LoadingSkeletonList count={4} />;
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />;

  function handleDeactivate() {
    if (!deactivating) return;
    // Backend semantics: this always soft-deactivates the whole recurring entry
    // (isActive:false) — nothing is ever permanently deleted, and it stays
    // visible below (marked Inactive) with a Reactivate action.
    deactivateEntry.mutate(
      { id: deactivating.id, scope: "ENTIRE_RULE" },
      {
        onSuccess: () => {
          toast.success("Deactivated");
          confirm.hide();
          setDeactivating(null);
        },
        onError: (err) => toast.error(getFriendlyErrorMessage(err)),
      },
    );
  }

  function handleReactivate(entry: ScheduleEntry) {
    updateEntry.mutate(
      { id: entry.id, input: { isActive: true, scope: "ENTIRE_RULE" } },
      {
        onSuccess: () => toast.success("Reactivated"),
        onError: (err) => toast.error(getFriendlyErrorMessage(err)),
      },
    );
  }

  return (
    <div className="space-y-2">
      {!entries || entries.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No recurring schedule yet"
          description="Add an activity to build your daily routine."
          actionLabel="Add to Schedule"
          onAction={() => setEditing(null)}
        />
      ) : (
        <>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setEditing(null)}>
              Add to Schedule
            </Button>
          </div>
          <ul className="divide-y rounded-lg border">
            {entries.map((entry) => {
              const activity = activities?.find((a) => a.id === entry.activityId);
              const category = categories?.find(
                (c) => c.id === activity?.categoryId,
              );
              return (
                <li key={entry.id} className="flex items-center gap-3 p-3">
                  <div className="w-20 shrink-0 text-xs text-muted-foreground mt-1 tabular-nums">
                    <div>{entry.startTime}</div>
                    <div>{entry.endTime}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground/70">
                      {formatDurationMinutes(minutesBetween(entry.startTime, entry.endTime))}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {activity?.name ?? "Unknown activity"}
                      </p>
                      {!entry.isActive && (
                        <Badge variant="outline" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      {category && (
                        <CategoryBadge
                          name={category.name}
                          color={category.color}
                          icon={category.icon}
                        />
                      )}
                      <span>{describeRecurrence(entry)}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Actions for ${activity?.name ?? "activity"}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditing(entry)}>
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Edit
                      </DropdownMenuItem>
                      {entry.isActive ? (
                        <DropdownMenuItem
                          onClick={() => {
                            setDeactivating(entry);
                            confirm.show();
                          }}
                        >
                          <Archive className="h-4 w-4" aria-hidden="true" />
                          Deactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleReactivate(entry)}>
                          <ArchiveRestore className="h-4 w-4" aria-hidden="true" />
                          Reactivate
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <ScheduleEntryFormDialog
        open={editing !== undefined}
        onOpenChange={(open) => !open && setEditing(undefined)}
        entry={editing}
      />

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={confirm.onOpenChange}
        title={`Deactivate "${activities?.find((a) => a.id === deactivating?.activityId)?.name ?? "this"}"?`}
        description="It stops appearing on your daily schedule, but nothing is deleted — historical activity records are kept, and you can reactivate it anytime from this list."
        confirmLabel="Deactivate"
        destructive
        isConfirming={deactivateEntry.isPending}
        onConfirm={handleDeactivate}
      />
    </div>
  );
}
