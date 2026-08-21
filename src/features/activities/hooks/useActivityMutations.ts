import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activitiesApi } from "@/lib/api/activities";
import { queryKeys } from "@/lib/query/queryKeys";
import type { CreateActivityInput, UpdateActivityInput } from "@/types/activity";

function invalidateActivityQueries(queryClient: ReturnType<typeof useQueryClient>) {
  // Activities feed into today's rendered schedule, so a rename/archive should
  // refresh the timeline too (frontend-requirements 05 §15).
  queryClient.invalidateQueries({ queryKey: queryKeys.activities() });
  queryClient.invalidateQueries({ queryKey: queryKeys.scheduleToday() });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateActivityInput) => activitiesApi.create(input),
    onSuccess: () => invalidateActivityQueries(queryClient),
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateActivityInput }) => activitiesApi.update(id, input),
    onSuccess: () => invalidateActivityQueries(queryClient),
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activitiesApi.remove(id),
    onSuccess: () => invalidateActivityQueries(queryClient),
  });
}
