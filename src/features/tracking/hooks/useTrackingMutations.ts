import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trackingApi } from "@/lib/api/tracking";
import type { CompleteActivityInput, CorrectActualTimingInput } from "@/types/activity-log";

/** Any tracking action changes today's rendered schedule (frontend-requirements 05 §15). */
function invalidateScheduleQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["schedule"] });
}

export function useStartActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) => trackingApi.start(logId),
    onSuccess: () => invalidateScheduleQueries(queryClient),
  });
}

export function useCompleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, input }: { logId: string; input?: CompleteActivityInput }) =>
      trackingApi.complete(logId, input),
    onSuccess: () => invalidateScheduleQueries(queryClient),
  });
}

export function useSkipActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) => trackingApi.skip(logId),
    onSuccess: () => invalidateScheduleQueries(queryClient),
  });
}

export function useCorrectActualTiming() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, input }: { logId: string; input: CorrectActualTimingInput }) => trackingApi.correct(logId, input),
    onSuccess: () => invalidateScheduleQueries(queryClient),
  });
}
