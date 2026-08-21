"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { scheduleEntrySchema, type ScheduleEntryFormValues } from "@/lib/validation/schedule";
import { useActiveActivities } from "@/features/activities/hooks/useActivities";
import { useCreateScheduleEntry, useUpdateScheduleEntry } from "../hooks/useScheduleEntryMutations";
import { useConflictResolution } from "../hooks/useConflictResolution";
import { ScheduleConflictDialog } from "./ScheduleConflictDialog";
import { RecurrenceField } from "./RecurrenceField";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";
import type { ConflictResolution, ScheduleEntry, ScheduleUpdateScope } from "@/types/schedule";

interface ScheduleEntryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: ScheduleEntry | null;
}

export function ScheduleEntryFormDialog({ open, onOpenChange, entry }: ScheduleEntryFormDialogProps) {
  const isEditing = !!entry;
  const { data: activities, isLoading: activitiesLoading } = useActiveActivities();
  const createEntry = useCreateScheduleEntry();
  const updateEntry = useUpdateScheduleEntry();
  const conflict = useConflictResolution();
  const isPending = createEntry.isPending || updateEntry.isPending;

  const form = useForm<ScheduleEntryFormValues>({
    resolver: zodResolver(scheduleEntrySchema),
    defaultValues: {
      activityId: "",
      startTime: "",
      endTime: "",
      recurrence: { type: "DAILY" },
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        activityId: entry?.activityId ?? activities?.[0]?.id ?? "",
        startTime: entry?.startTime ?? "",
        endTime: entry?.endTime ?? "",
        recurrence: entry?.recurrence ?? { type: "DAILY" },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entry]);

  function submit(values: ScheduleEntryFormValues, scope: ScheduleUpdateScope = "THIS_AND_FUTURE", resolution?: Exclude<ConflictResolution, "CANCEL">) {
    const onSuccess = () => {
      toast.success(isEditing ? "Schedule updated" : "Activity added to your schedule");
      onOpenChange(false);
    };
    const onError = (error: unknown) => {
      if (!resolution && conflict.captureIfConflict(error, (nextResolution) => submit(values, scope, nextResolution))) return;
      toast.error(getFriendlyErrorMessage(error));
    };

    if (isEditing && entry) {
      updateEntry.mutate(
        {
          id: entry.id,
          input: {
            activityId: values.activityId,
            startTime: values.startTime,
            endTime: values.endTime,
            recurrence: values.recurrence,
            scope,
            resolution,
          },
        },
        { onSuccess, onError },
      );
    } else {
      createEntry.mutate(
        { activityId: values.activityId, startTime: values.startTime, endTime: values.endTime, recurrence: values.recurrence, resolution },
        { onSuccess, onError },
      );
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Schedule Entry" : "Add to Schedule"}</DialogTitle>
            <DialogDescription>This is your recurring routine — daily changes for one date belong on that day&apos;s timeline instead.</DialogDescription>
          </DialogHeader>

          {activitiesLoading ? (
            <LoadingSkeleton className="h-48 w-full" />
          ) : !activities?.length ? (
            <p className="text-sm text-muted-foreground">Create an activity first before adding it to your schedule.</p>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit((values) => submit(values))} className="space-y-4" noValidate>
                <FormField
                  control={form.control}
                  name="activityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(v) => v && field.onChange(v)}
                          items={Object.fromEntries(activities.map((activity) => [activity.id, activity.name]))}
                        >
                          <SelectTrigger id={field.name} className="w-full">
                            <SelectValue placeholder="Choose an activity" />
                          </SelectTrigger>
                          <SelectContent>
                            {activities.map((activity) => (
                              <SelectItem key={activity.id} value={activity.id}>
                                {activity.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="recurrence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repeat</FormLabel>
                      <FormControl>
                        <RecurrenceField value={field.value} onChange={field.onChange} />
                      </FormControl>
                      {/* recurrence.daysOfWeek / recurrence.date errors are nested under the
                          "recurrence" field — FormMessage only reads the exact field path, so
                          they're surfaced manually here instead of being silently swallowed. */}
                      {(form.formState.errors.recurrence?.daysOfWeek || form.formState.errors.recurrence?.date) && (
                        <p role="alert" className="text-xs font-medium text-destructive">
                          {form.formState.errors.recurrence?.daysOfWeek?.message ?? form.formState.errors.recurrence?.date?.message}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isEditing ? (
                  <DialogFooter className="flex-col gap-2 sm:flex-col">
                    <Button type="submit" disabled={isPending} className="w-full">
                      {isPending ? "Saving…" : "Save (this and future occurrences)"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                      className="w-full"
                      onClick={form.handleSubmit((values) => submit(values, "ENTIRE_RULE"))}
                    >
                      Save (entire recurring rule, past and future)
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Either option only changes this recurring routine — activities you&apos;ve already tracked are never altered.
                    </p>
                  </DialogFooter>
                ) : (
                  <DialogFooter>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? "Saving…" : "Add to Schedule"}
                    </Button>
                  </DialogFooter>
                )}
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      <ScheduleConflictDialog conflicts={conflict.conflict?.conflicts ?? null} onResolve={conflict.resolve} />
    </>
  );
}
