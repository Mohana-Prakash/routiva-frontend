"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { useScheduleEntries } from "../hooks/useScheduleEntries";
import { useDeleteScheduleEntry } from "../hooks/useScheduleEntryMutations";
import { useActivities } from "@/features/activities/hooks/useActivities";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { ScheduleEntryFormDialog } from "./ScheduleEntryFormDialog";
import type { ScheduleEntry, ScheduleUpdateScope } from "@/types/schedule";

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
  const [deleting, setDeleting] = useState<ScheduleEntry | null>(null);
  const [deleteScope, setDeleteScope] =
    useState<ScheduleUpdateScope>("THIS_AND_FUTURE");
  const deleteEntry = useDeleteScheduleEntry();
  const confirm = useConfirmDialog();

  if (isLoading) return <LoadingSkeletonList count={4} />;
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (!entries || entries.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No recurring schedule yet"
        description="Add an activity to build your daily routine."
        actionLabel="Add to Schedule"
        onAction={() => setEditing(null)}
      />
    );
  }

  function handleDelete() {
    if (!deleting) return;
    deleteEntry.mutate(
      { id: deleting.id, scope: deleteScope },
      {
        onSuccess: () => {
          toast.success("Removed from your schedule");
          confirm.hide();
          setDeleting(null);
        },
        onError: (err) => toast.error(getFriendlyErrorMessage(err)),
      },
    );
  }

  return (
    <div className="space-y-2">
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
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {activity?.name ?? "Unknown activity"}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mt-1">
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
                  <DropdownMenuItem onSelect={() => setEditing(entry)}>
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => {
                      setDeleting(entry);
                      setDeleteScope("THIS_AND_FUTURE");
                      confirm.show();
                    }}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          );
        })}
      </ul>

      <ScheduleEntryFormDialog
        open={editing !== undefined}
        onOpenChange={(open) => !open && setEditing(undefined)}
        entry={editing}
      />

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={confirm.onOpenChange}
        title={`Remove this from your schedule?`}
        description={
          <div className="space-y-2 text-left">
            <p>
              Historical activity records are preserved either way. Choose what
              this affects:
            </p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={deleteScope === "THIS_AND_FUTURE"}
                onChange={() => setDeleteScope("THIS_AND_FUTURE")}
              />
              From today onward
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={deleteScope === "ENTIRE_RULE"}
                onChange={() => setDeleteScope("ENTIRE_RULE")}
              />
              Entire recurring rule
            </label>
          </div>
        }
        confirmLabel="Remove"
        destructive
        isConfirming={deleteEntry.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
