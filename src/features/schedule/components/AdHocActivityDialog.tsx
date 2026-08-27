"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import {
  adHocActivitySchema,
  type AdHocActivityFormValues,
} from "@/lib/validation/schedule";
import { useActiveActivities } from "@/features/activities/hooks/useActivities";
import { useCreateScheduleException } from "../hooks/useScheduleExceptionMutations";
import { useConflictResolution } from "../hooks/useConflictResolution";
import { ScheduleConflictDialog } from "./ScheduleConflictDialog";
import { ActivityFormDialog } from "@/features/activities/components/ActivityFormDialog";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";
import { formatDurationMinutes, isValidTimeString, minutesBetween, nowTimeInTimeZone } from "@/lib/datetime/time";
import { useAuth } from "@/features/auth/AuthProvider";
import type { ConflictResolution } from "@/types/schedule";

interface AdHocActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Defaults to today in the user's timezone. */
  date?: string;
}

/**
 * Quick "+ Add Activity" flow for date-specific, non-recurring activities
 * (frontend-requirements 02 §10) — e.g. Play, Travel, a one-off appointment.
 * Creates a schedule exception (action=ADD) so it never touches the recurring
 * base schedule.
 */
export function AdHocActivityDialog({
  open,
  onOpenChange,
  date,
}: AdHocActivityDialogProps) {
  const { user } = useAuth();
  const timezone =
    user?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { data: activities, isLoading: activitiesLoading } =
    useActiveActivities();
  const createException = useCreateScheduleException();
  const conflict = useConflictResolution();
  const [newActivityOpen, setNewActivityOpen] = useState(false);

  const form = useForm<AdHocActivityFormValues>({
    resolver: zodResolver(adHocActivitySchema),
    defaultValues: {
      activityId: "",
      date: date ?? "",
      timeless: false,
      startTime: "",
      endTime: "",
      timelessReminderTime: "",
      reason: "",
    },
  });

  useEffect(() => {
    if (open) {
      const now = nowTimeInTimeZone(timezone);
      form.reset({
        activityId: activities?.[0]?.id ?? "",
        date: date ?? "",
        timeless: false,
        startTime: now,
        endTime: now,
        timelessReminderTime: "",
        reason: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, date]);

  const isTimeless = form.watch("timeless");
  const watchedStart = form.watch("startTime");
  const watchedEnd = form.watch("endTime");
  const liveDuration =
    !isTimeless && watchedStart && watchedEnd && isValidTimeString(watchedStart) && isValidTimeString(watchedEnd)
      ? formatDurationMinutes(minutesBetween(watchedStart, watchedEnd))
      : null;

  function submit(
    values: AdHocActivityFormValues,
    resolution?: Exclude<ConflictResolution, "CANCEL">,
  ) {
    createException.mutate(
      {
        activityId: values.activityId,
        date: values.date,
        startTime: values.timeless ? null : values.startTime ?? null,
        endTime: values.timeless ? null : values.endTime ?? null,
        timelessReminderTime: values.timeless
          ? values.timelessReminderTime || null
          : null,
        action: "ADD",
        reason: values.reason || null,
        resolution,
      },
      {
        onSuccess: () => {
          toast.success("Activity added");
          onOpenChange(false);
        },
        onError: (error) => {
          if (
            !resolution &&
            conflict.captureIfConflict(error, (nextResolution) =>
              submit(values, nextResolution),
            )
          )
            return;
          toast.error(getFriendlyErrorMessage(error));
        },
      },
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Activity</DialogTitle>
            <DialogDescription>
              A one-off activity for this date — it won&apos;t become part of
              your recurring schedule.
            </DialogDescription>
          </DialogHeader>

          {activitiesLoading ? (
            <LoadingSkeleton className="h-48 w-full" />
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => submit(values))}
                className="space-y-4"
                noValidate
              >
                <FormField
                  control={form.control}
                  name="activityId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Activity</FormLabel>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() => setNewActivityOpen(true)}
                        >
                          + New activity
                        </Button>
                      </div>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(v) => v && field.onChange(v)}
                          items={Object.fromEntries(
                            (activities ?? []).map((activity) => [
                              activity.id,
                              activity.name,
                            ]),
                          )}
                        >
                          <SelectTrigger id={field.name} className="w-full">
                            <SelectValue placeholder="Choose an activity" />
                          </SelectTrigger>
                          <SelectContent>
                            {activities?.map((activity) => (
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
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeless"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel htmlFor="adhoc-timeless">Timeless</FormLabel>
                        <Switch id="adhoc-timeless" checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        No fixed time — available anytime during this date instead of a specific slot.
                      </p>
                    </FormItem>
                  )}
                />
                {!isTimeless && (
                  <>
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
                    {liveDuration && <p className="text-xs text-muted-foreground">Duration: {liveDuration}</p>}
                  </>
                )}
                {isTimeless && (
                  <FormField
                    control={form.control}
                    name="timelessReminderTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remind me at (optional)</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Since this activity has no fixed time, pick a time of day to get
                          reminded — leave blank for no reminder.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note (optional)</FormLabel>
                      <FormControl>
                        <Textarea rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createException.isPending || !activities?.length}
                  >
                    {createException.isPending ? "Adding…" : "Add Activity"}
                  </Button>
                </DialogFooter>
                {!activities?.length && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Create an activity first, using the link above.
                  </p>
                )}
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      <ActivityFormDialog
        open={newActivityOpen}
        onOpenChange={setNewActivityOpen}
      />
      <ScheduleConflictDialog
        conflicts={conflict.conflict?.conflicts ?? null}
        onResolve={conflict.resolve}
      />
    </>
  );
}
