"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Archive, ArchiveRestore, Tag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog, useConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LoadingSkeletonList } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { getCategoryIcon } from "@/lib/category-icons";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";
import { useCategories } from "../hooks/useCategories";
import { useUpdateCategory } from "../hooks/useCategoryMutations";
import { useActivities } from "@/features/activities/hooks/useActivities";
import { CategoryFormDialog } from "./CategoryFormDialog";
import type { Category } from "@/types/category";

export function CategoryList() {
  const { data: categories, isLoading, isError, error, refetch } = useCategories();
  const { data: activities } = useActivities();
  const [editing, setEditing] = useState<Category | null | undefined>(undefined);
  const [deactivating, setDeactivating] = useState<Category | null>(null);
  const updateCategory = useUpdateCategory();
  const deactivateConfirm = useConfirmDialog();

  if (isLoading) return <LoadingSkeletonList count={4} />;
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />;

  function activeActivityCount(categoryId: string) {
    return activities?.filter((a) => a.categoryId === categoryId && a.isActive).length ?? 0;
  }

  function setCategoryActive(category: Category, isActive: boolean) {
    updateCategory.mutate(
      { id: category.id, input: { isActive } },
      { onError: (err) => toast.error(getFriendlyErrorMessage(err)) },
    );
  }

  function handleToggleActive(category: Category) {
    if (category.isActive && activeActivityCount(category.id) > 0) {
      setDeactivating(category);
      deactivateConfirm.show();
      return;
    }
    setCategoryActive(category, !category.isActive);
  }

  function handleConfirmDeactivate() {
    if (!deactivating) return;
    setCategoryActive(deactivating, false);
    deactivateConfirm.hide();
    setDeactivating(null);
  }

  return (
    <div className="space-y-2">
      {!categories || categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No categories yet"
          description="Create a category to start organizing your activities."
          actionLabel="New Category"
          onAction={() => setEditing(null)}
        />
      ) : (
        <>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setEditing(null)}>
              New Category
            </Button>
          </div>
          <ul className="divide-y rounded-lg border">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.icon);
              return (
                <li key={category.id} className="flex items-center gap-3 p-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${category.color}1A`, color: category.color }}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{category.name}</p>
                    {!category.isActive && (
                      <Badge variant="outline" className="mt-0.5 text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${category.name}`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditing(category)}>
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(category)}>
                        {category.isActive ? (
                          <>
                            <Archive className="h-4 w-4" aria-hidden="true" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <ArchiveRestore className="h-4 w-4" aria-hidden="true" />
                            Reactivate
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <CategoryFormDialog open={editing !== undefined} onOpenChange={(open) => !open && setEditing(undefined)} category={editing} />

      <ConfirmDialog
        open={deactivateConfirm.open}
        onOpenChange={deactivateConfirm.onOpenChange}
        title={`Deactivate "${deactivating?.name}"?`}
        description={
          deactivating
            ? `${activeActivityCount(deactivating.id)} ${activeActivityCount(deactivating.id) === 1 ? "activity is" : "activities are"} still active under this category. Deactivating it will also deactivate ${activeActivityCount(deactivating.id) === 1 ? "that activity" : "those activities"}.`
            : ""
        }
        confirmLabel="Deactivate"
        destructive
        isConfirming={updateCategory.isPending}
        onConfirm={handleConfirmDeactivate}
      />
    </div>
  );
}
