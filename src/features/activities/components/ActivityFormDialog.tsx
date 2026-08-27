"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { activitySchema, type ActivityFormValues } from "@/lib/validation/activity";
import { useActiveCategories } from "@/features/categories/hooks/useCategories";
import { useCreateActivity, useUpdateActivity } from "../hooks/useActivityMutations";
import { AlarmOffsetField } from "./AlarmOffsetField";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import type { Activity } from "@/types/activity";

const NO_CATEGORY = "__none__";

interface ActivityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: Activity | null;
}

export function ActivityFormDialog({ open, onOpenChange, activity }: ActivityFormDialogProps) {
  const isEditing = !!activity;
  const router = useRouter();
  const { data: categories, isLoading: categoriesLoading } = useActiveCategories();
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const isPending = createActivity.isPending || updateActivity.isPending;

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      categoryId: NO_CATEGORY,
      name: "",
      description: "",
      alarmEnabled: false,
      alarmOffsetMinutes: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        categoryId: activity?.categoryId ?? NO_CATEGORY,
        name: activity?.name ?? "",
        description: activity?.description ?? "",
        alarmEnabled: activity?.alarmEnabled ?? false,
        alarmOffsetMinutes: activity?.alarmOffsetMinutes ?? undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activity]);

  const alarmEnabled = form.watch("alarmEnabled");

  function goToSchedule() {
    if (!activity) return;
    onOpenChange(false);
    router.push(`/schedule?tab=base&activityId=${activity.id}`);
  }

  function onSubmit(values: ActivityFormValues) {
    // On edit, an explicit `null` clears an existing category; omitting the field entirely
    // (undefined) leaves it untouched, which is only ever correct for a brand-new activity.
    const categoryId =
      values.categoryId === NO_CATEGORY ? (isEditing ? null : undefined) : values.categoryId;
    const payload = {
      categoryId,
      name: values.name,
      description: values.description || null,
      alarmEnabled: values.alarmEnabled,
      alarmOffsetMinutes: values.alarmEnabled ? values.alarmOffsetMinutes ?? null : undefined,
    };
    const onSuccess = () => {
      toast.success(isEditing ? "Activity updated" : "Activity created");
      onOpenChange(false);
    };
    const onError = (error: unknown) => toast.error(getFriendlyErrorMessage(error));

    if (isEditing && activity) {
      updateActivity.mutate({ id: activity.id, input: payload }, { onSuccess, onError });
    } else {
      createActivity.mutate(payload, { onSuccess, onError });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Activity" : "New Activity"}</DialogTitle>
          <DialogDescription>Activities are reusable — you&apos;ll assign them to time slots on the Schedule screen.</DialogDescription>
        </DialogHeader>

        {isEditing && (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto self-start p-0 text-xs"
            onClick={goToSchedule}
          >
            <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
            Manage schedule for this activity
          </Button>
        )}

        {categoriesLoading ? (
          <LoadingSkeleton className="h-48 w-full" />
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Meditation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (optional)</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(v) => v && field.onChange(v)}
                        items={{
                          [NO_CATEGORY]: "No category",
                          ...Object.fromEntries((categories ?? []).map((category) => [category.id, category.name])),
                        }}
                      >
                        <SelectTrigger id={field.name} className="w-full">
                          <SelectValue placeholder="No category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NO_CATEGORY}>No category</SelectItem>
                          {(categories ?? []).map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="alarmEnabled"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel htmlFor="alarm-enabled">Alarm</FormLabel>
                      <Switch id="alarm-enabled" checked={field.value} onCheckedChange={field.onChange} />
                    </div>
                    <FormDescription>Reminders are delivered via push notification even when the app is closed.</FormDescription>
                  </FormItem>
                )}
              />
              {alarmEnabled && (
                <FormField
                  control={form.control}
                  name="alarmOffsetMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remind me</FormLabel>
                      <FormControl>
                        <AlarmOffsetField value={field.value} onChange={field.onChange} id={field.name} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving…" : isEditing ? "Save Changes" : "Create Activity"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
