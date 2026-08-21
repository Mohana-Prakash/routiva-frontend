"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { formatDateLabel } from "@/lib/datetime/time";
import {
  moveExceptionSchema,
  type MoveExceptionFormValues,
} from "@/lib/validation/schedule";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";
import {
  useCreateScheduleException,
  useUpdateScheduleException,
} from "../hooks/useScheduleExceptionMutations";
import { useConflictResolution } from "../hooks/useConflictResolution";
import { ScheduleConflictDialog } from "./ScheduleConflictDialog";
import type { ConflictResolution, ScheduleDayItem } from "@/types/schedule";

interface AdjustTimeSectionProps {
  item: ScheduleDayItem;
  onSaved?: () => void;
}

/**
 * Lets the user change the time (or add a note) for one specific date without
 * touching the recurring base schedule (frontend-requirements 02 §9). The parent
 * renders this keyed by `item.id`, so switching activities remounts it and its
 * local editing state resets for free — no reset-on-prop-change effect needed.
 */
export function AdjustTimeSection({ item, onSaved }: AdjustTimeSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const createException = useCreateScheduleException();
  const updateException = useUpdateScheduleException();
  const conflict = useConflictResolution();

  const form = useForm<MoveExceptionFormValues>({
    resolver: zodResolver(moveExceptionSchema),
    defaultValues: {
      startTime: item.startTime,
      endTime: item.endTime,
      reason: item.notes ?? "",
    },
  });

  function submit(
    values: MoveExceptionFormValues,
    resolution?: Exclude<ConflictResolution, "CANCEL">,
  ) {
    const onSuccess = () => {
      toast.success("Updated for this date");
      setIsEditing(false);
      onSaved?.();
    };
    const onError = (error: unknown) => {
      if (
        !resolution &&
        conflict.captureIfConflict(error, (nextResolution) =>
          submit(values, nextResolution),
        )
      )
        return;
      toast.error(getFriendlyErrorMessage(error));
    };

    if (item.exceptionId) {
      updateException.mutate(
        {
          id: item.exceptionId,
          input: {
            startTime: values.startTime,
            endTime: values.endTime,
            reason: values.reason || null,
            resolution,
          },
        },
        { onSuccess, onError },
      );
    } else {
      createException.mutate(
        {
          sourceScheduleEntryId: item.scheduleEntryId,
          activityId: item.activityId,
          date: item.date,
          startTime: values.startTime,
          endTime: values.endTime,
          action: "MOVE",
          reason: values.reason || null,
          resolution,
        },
        { onSuccess, onError },
      );
    }
  }

  const isPending = createException.isPending || updateException.isPending;

  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium">Adjust for this date</p>
        {!isEditing && (
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Edit time for this date"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isEditing ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => submit(values))}
            className="space-y-3"
            noValidate
          >
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
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isPending}>
                Save for this date
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-4 w-4" /> Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This only changes {formatDateLabel(item.date)} — your recurring
              schedule stays the same.
            </p>
          </form>
        </Form>
      ) : (
        <p className="text-xs text-muted-foreground mt-1">
          Change the time just for {formatDateLabel(item.date)} without editing
          your recurring schedule.
        </p>
      )}

      <ScheduleConflictDialog
        conflicts={conflict.conflict?.conflicts ?? null}
        onResolve={conflict.resolve}
      />
    </div>
  );
}
