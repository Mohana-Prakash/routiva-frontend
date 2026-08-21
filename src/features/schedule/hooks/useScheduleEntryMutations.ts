import { useMutation, useQueryClient } from "@tanstack/react-query";
import { schedulesApi, type WithConflictResolution } from "@/lib/api/schedules";
import { queryKeys } from "@/lib/query/queryKeys";
import type { CreateScheduleEntryInput, ScheduleUpdateScope, UpdateScheduleEntryInput } from "@/types/schedule";

function invalidateScheduleQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.scheduleEntries() });
  queryClient.invalidateQueries({ queryKey: ["schedule"] });
}

export function useCreateScheduleEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateScheduleEntryInput & WithConflictResolution) => schedulesApi.create(input),
    onSuccess: () => invalidateScheduleQueries(queryClient),
  });
}

export function useUpdateScheduleEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateScheduleEntryInput & WithConflictResolution }) => schedulesApi.update(id, input),
    onSuccess: () => invalidateScheduleQueries(queryClient),
  });
}

export function useDeleteScheduleEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, scope }: { id: string; scope: ScheduleUpdateScope }) => schedulesApi.remove(id, scope),
    onSuccess: () => invalidateScheduleQueries(queryClient),
  });
}
