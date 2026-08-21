"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Archive, ArchiveRestore, Trash2, Tag } from "lucide-react";
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
import { useDeleteCategory, useUpdateCategory } from "../hooks/useCategoryMutations";
import { CategoryFormDialog } from "./CategoryFormDialog";
import type { Category } from "@/types/category";

export function CategoryList() {
  const { data: categories, isLoading, isError, error, refetch } = useCategories();
  const [editing, setEditing] = useState<Category | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const deleteCategory = useDeleteCategory();
  const updateCategory = useUpdateCategory();
  const confirm = useConfirmDialog();

  if (isLoading) return <LoadingSkeletonList count={4} />;
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />;

  function handleToggleActive(category: Category) {
    updateCategory.mutate(
      { id: category.id, input: { isActive: !category.isActive } },
      { onError: (err) => toast.error(getFriendlyErrorMessage(err)) },
    );
  }

  function handleDelete() {
    if (!deleting) return;
    deleteCategory.mutate(deleting.id, {
      onSuccess: () => {
        toast.success("Category deleted");
        confirm.hide();
        setDeleting(null);
      },
      onError: (err) => toast.error(getFriendlyErrorMessage(err)),
    });
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
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                          setDeleting(category);
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
        </>
      )}

      <CategoryFormDialog open={editing !== undefined} onOpenChange={(open) => !open && setEditing(undefined)} category={editing} />

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={confirm.onOpenChange}
        title={`Delete "${deleting?.name}"?`}
        description="Existing historical activity records will be preserved."
        confirmLabel="Delete"
        destructive
        isConfirming={deleteCategory.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
