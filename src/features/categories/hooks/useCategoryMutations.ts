import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api/categories";
import { queryKeys } from "@/lib/query/queryKeys";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/types/category";

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => categoriesApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories() }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) => categoriesApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
      // Deactivating a category cascades to deactivate its activities server-side
      // (categories.service.ts), so the activities list can go stale here too.
      queryClient.invalidateQueries({ queryKey: queryKeys.activities() });
    },
  });
}
