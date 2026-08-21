import { useMutation, useQueryClient } from "@tanstack/react-query";
import { schedulesApi, type WithConflictResolution } from "@/lib/api/schedules";
import type { CreateScheduleExceptionInput, UpdateScheduleExceptionInput } from "@/types/schedule";

function invalidateScheduleQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["schedule"] });
}

export function useCreateScheduleException() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateScheduleExceptionInput & WithConflictResolution) => schedulesApi.createException(input),
    onSuccess: () => invalidateScheduleQueries(queryClient),
  });
}

export function useUpdateScheduleException() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateScheduleExceptionInput & WithConflictResolution }) =>
      schedulesApi.updateException(id, input),
    onSuccess: () => invalidateScheduleQueries(queryClient),
  });
}

export function useDeleteScheduleException() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schedulesApi.removeException(id),
    onSuccess: () => invalidateScheduleQueries(queryClient),
  });
}
