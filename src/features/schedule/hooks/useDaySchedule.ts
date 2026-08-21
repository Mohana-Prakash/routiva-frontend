import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { schedulesApi } from "@/lib/api/schedules";
import { queryKeys } from "@/lib/query/queryKeys";
import { useAuth } from "@/features/auth/AuthProvider";
import { todayInTimeZone } from "@/lib/datetime/time";

/** The rendered timeline for today (frontend-requirements 02 §4, backend-requirements 04 §8). */
export function useTodaySchedule() {
  return useQuery({
    queryKey: queryKeys.scheduleToday(),
    queryFn: schedulesApi.today,
    // Today's schedule changes often (tracking actions, new ad-hoc activities) —
    // keep it fresher than the default staleTime.
    staleTime: 10_000,
  });
}

export function useDaySchedule(date: string) {
  return useQuery({
    queryKey: queryKeys.scheduleDate(date),
    queryFn: () => schedulesApi.byDate(date),
    enabled: !!date,
    // Each date is a distinct query key, so switching days would otherwise briefly show
    // the loading skeleton (a visible flicker) before the new day's data arrives. Keeping
    // the previous day's data on screen during that fetch avoids the flash.
    placeholderData: keepPreviousData,
  });
}

export function useTodayDateString(): string {
  const { user } = useAuth();
  return todayInTimeZone(user?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
}
