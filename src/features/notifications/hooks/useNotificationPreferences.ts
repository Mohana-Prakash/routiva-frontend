import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications";
import { queryKeys } from "@/lib/query/queryKeys";
import type { UpdateNotificationPreferencesInput } from "@/types/notification";

export function useNotificationPreferences() {
  return useQuery({
    queryKey: queryKeys.notificationPreferences(),
    queryFn: notificationsApi.getPreferences,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateNotificationPreferencesInput) => notificationsApi.updatePreferences(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notificationPreferences() }),
  });
}
