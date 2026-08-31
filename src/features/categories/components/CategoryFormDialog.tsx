"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { categorySchema, type CategoryFormValues } from "@/lib/validation/category";
import { CATEGORY_COLOR_PRESETS, CATEGORY_ICON_NAMES, getCategoryIcon } from "@/lib/category-icons";
import { useCreateCategory, useUpdateCategory } from "../hooks/useCategoryMutations";
import { useCategories } from "../hooks/useCategories";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

export function CategoryFormDialog({ open, onOpenChange, category }: CategoryFormDialogProps) {
  const isEditing = !!category;
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isPending = createCategory.isPending || updateCategory.isPending;
  const { data: categories } = useCategories();
  // Every other category's color (regardless of active status, matching the backend's own
  // uniqueness check) — used to steer away from picking a color already in use.
  const takenColors = new Map(
    (categories ?? [])
      .filter((c) => c.id !== category?.id)
      .map((c) => [c.color.toLowerCase(), c.name] as const),
  );

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", icon: CATEGORY_ICON_NAMES[0], color: CATEGORY_COLOR_PRESETS[0] },
  });

  useEffect(() => {
    if (open) {
      // For a new category, default to the first preset that isn't already taken (falling
      // back to the first preset if every single one is in use) rather than always the same
      // first color, which is exactly how duplicate colors pile up in the first place.
      const firstFreePreset =
        CATEGORY_COLOR_PRESETS.find((c) => !takenColors.has(c.toLowerCase())) ?? CATEGORY_COLOR_PRESETS[0];
      form.reset({
        name: category?.name ?? "",
        icon: category?.icon ?? CATEGORY_ICON_NAMES[0],
        color: category?.color ?? firstFreePreset,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category, form]);

  function onSubmit(values: CategoryFormValues) {
    // Caught client-side for a clear inline message — the backend also enforces this, but
    // its rejection surfaces as a generic toast otherwise.
    const clashingName = takenColors.get(values.color.toLowerCase());
    if (clashingName) {
      form.setError("color", { message: `Already used by "${clashingName}" — pick a different color` });
      return;
    }

    const onSuccess = () => {
      toast.success(isEditing ? "Category updated" : "Category created");
      onOpenChange(false);
    };
    const onError = (error: unknown) => toast.error(getFriendlyErrorMessage(error));

    if (isEditing && category) {
      updateCategory.mutate({ id: category.id, input: values }, { onSuccess, onError });
    } else {
      createCategory.mutate(values, { onSuccess, onError });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Category" : "New Category"}</DialogTitle>
          <DialogDescription>Categories help you group and report on activities.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Spiritual" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <div role="radiogroup" aria-label="Icon" className="grid grid-cols-7 gap-1.5">
                      {CATEGORY_ICON_NAMES.map((name) => {
                        const Icon = getCategoryIcon(name);
                        const selected = field.value === name;
                        return (
                          <button
                            key={name}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            aria-label={name.replace(/-/g, " ")}
                            onClick={() => field.onChange(name)}
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-muted",
                              selected && "border-primary bg-primary/10 text-primary",
                            )}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div role="radiogroup" aria-label="Color" className="flex flex-wrap items-center gap-1.5">
                      {CATEGORY_COLOR_PRESETS.map((color) => {
                        const clashingName = takenColors.get(color.toLowerCase());
                        const isTakenByOther = !!clashingName && field.value !== color;
                        return (
                          <button
                            key={color}
                            type="button"
                            role="radio"
                            aria-checked={field.value === color}
                            aria-disabled={isTakenByOther}
                            aria-label={isTakenByOther ? `${color} — already used by ${clashingName}` : color}
                            title={isTakenByOther ? `Already used by "${clashingName}"` : undefined}
                            onClick={() => !isTakenByOther && field.onChange(color)}
                            className={cn(
                              "h-7 w-7 rounded-full ring-offset-2 ring-offset-background transition-shadow",
                              field.value === color && "ring-2 ring-foreground",
                              isTakenByOther && "cursor-not-allowed opacity-30",
                            )}
                            style={{ backgroundColor: color }}
                          />
                        );
                      })}
                      <label className="relative h-7 w-7 overflow-hidden rounded-full border">
                        <span className="sr-only">Custom color</span>
                        <input
                          type="color"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="absolute -top-1 -left-1 h-9 w-9 cursor-pointer border-none bg-transparent p-0"
                        />
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : isEditing ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
