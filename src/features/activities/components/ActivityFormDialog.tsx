"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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

interface ActivityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: Activity | null;
}

export function ActivityFormDialog({ open, onOpenChange, activity }: ActivityFormDialogProps) {
  const isEditing = !!activity;
  const { data: categories, isLoading: categoriesLoading } = useActiveCategories();
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const isPending = createActivity.isPending || updateActivity.isPending;

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      categoryId: "",
      name: "",
      description: "",
      defaultDurationMinutes: 30,
      alarmEnabled: false,
      alarmOffsetMinutes: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        categoryId: activity?.categoryId ?? categories?.[0]?.id ?? "",
        name: activity?.name ?? "",
        description: activity?.description ?? "",
        defaultDurationMinutes: activity?.defaultDurationMinutes ?? 30,
        alarmEnabled: activity?.alarmEnabled ?? false,
        alarmOffsetMinutes: activity?.alarmOffsetMinutes ?? undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activity]);

  const alarmEnabled = form.watch("alarmEnabled");

  function onSubmit(values: ActivityFormValues) {
    const payload = {
      categoryId: values.categoryId,
      name: values.name,
      description: values.description || null,
      defaultDurationMinutes: values.defaultDurationMinutes ?? null,
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

        {categoriesLoading ? (
          <LoadingSkeleton className="h-48 w-full" />
        ) : !categories?.length ? (
          <p className="text-sm text-muted-foreground">Create a category first before adding activities.</p>
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
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(v) => v && field.onChange(v)}
                        items={Object.fromEntries(categories.map((category) => [category.id, category.name]))}
                      >
                        <SelectTrigger id={field.name} className="w-full">
                          <SelectValue placeholder="Choose a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
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
                name="defaultDurationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={24 * 60}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      />
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
