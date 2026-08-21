"use client";

import { useState } from "react";
import {
  MoreVertical,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
  BellRing,
  BellOff,
  ListChecks,
} from "lucide-react";
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
import { formatDurationMinutes } from "@/lib/datetime/time";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";
import { useActivities } from "../hooks/useActivities";
import { useCategories } from "@/features/categories/hooks/useCategories";
import {
  useDeleteActivity,
  useUpdateActivity,
} from "../hooks/useActivityMutations";
import { ActivityFormDialog } from "./ActivityFormDialog";
import type { Activity } from "@/types/activity";

export function ActivityList() {
  const {
    data: activities,
    isLoading,
    isError,
    error,
    refetch,
  } = useActivities();
  const { data: categories } = useCategories();
  const [editing, setEditing] = useState<Activity | null | undefined>(
    undefined,
  );
  const [deleting, setDeleting] = useState<Activity | null>(null);
  const deleteActivity = useDeleteActivity();
  const updateActivity = useUpdateActivity();
  const confirm = useConfirmDialog();

  if (isLoading) return <LoadingSkeletonList count={4} />;
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (!activities || activities.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="No activities yet"
        description="Create an activity, then assign it to a time slot on the Schedule screen."
        actionLabel="New Activity"
        onAction={() => setEditing(null)}
      />
    );
  }

  function categoryFor(categoryId: string) {
    return categories?.find((c) => c.id === categoryId);
  }

  function handleToggleActive(activity: Activity) {
    updateActivity.mutate(
      { id: activity.id, input: { isActive: !activity.isActive } },
      { onError: (err) => toast.error(getFriendlyErrorMessage(err)) },
    );
  }

  function handleDelete() {
    if (!deleting) return;
    deleteActivity.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Activity deleted");
        confirm.hide();
        setDeleting(null);
      },
      onError: (err) => toast.error(getFriendlyErrorMessage(err)),
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setEditing(null)}>
          New Activity
        </Button>
      </div>
      <ul className="divide-y rounded-lg border">
        {activities.map((activity) => {
          const category = categoryFor(activity.categoryId);
          return (
            <li key={activity.id} className="flex items-center gap-3 p-3">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium">
                    {activity.name}
                  </p>
                  {!activity.isActive && (
                    <Badge variant="outline" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                  {category && (
                    <CategoryBadge
                      name={category.name}
                      color={category.color}
                      icon={category.icon}
                    />
                  )}
                  {activity.defaultDurationMinutes && (
                    <span>
                      {formatDurationMinutes(activity.defaultDurationMinutes)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    {activity.alarmEnabled ? (
                      <>
                        <BellRing className="h-3.5 w-3.5" aria-hidden="true" />{" "}
                        Alarm on
                      </>
                    ) : (
                      <>
                        <BellOff className="h-3.5 w-3.5" aria-hidden="true" />{" "}
                        No alarm
                      </>
                    )}
                  </span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Actions for ${activity.name}`}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setEditing(activity)}>
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => handleToggleActive(activity)}
                  >
                    {activity.isActive ? (
                      <>
                        <Archive className="h-4 w-4" aria-hidden="true" />
                        Archive
                      </>
                    ) : (
                      <>
                        <ArchiveRestore
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        Reactivate
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => {
                      setDeleting(activity);
                      confirm.show();
                    }}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          );
        })}
      </ul>

      <ActivityFormDialog
        open={editing !== undefined}
        onOpenChange={(open) => !open && setEditing(undefined)}
        activity={editing}
      />

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={confirm.onOpenChange}
        title={`Delete "${deleting?.name}"?`}
        description="Existing historical activity records will be preserved."
        confirmLabel="Delete"
        destructive
        isConfirming={deleteActivity.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
