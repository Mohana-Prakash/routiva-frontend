import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api/reports";
import { queryKeys } from "@/lib/query/queryKeys";
import { useAuth } from "@/features/auth/AuthProvider";
import type { DateRange } from "../lib/dateRangePresets";

function useTimezone(): string {
  const { user } = useAuth();
  return user?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function useReportSummary(range: DateRange) {
  const timezone = useTimezone();
  return useQuery({
    queryKey: queryKeys.reportSummary(range.from, range.to),
    queryFn: () => reportsApi.summary({ ...range, timezone }),
  });
}

export function useCategoryReport(range: DateRange) {
  const timezone = useTimezone();
  return useQuery({
    queryKey: queryKeys.reportCategories(range.from, range.to),
    queryFn: () => reportsApi.categories({ ...range, timezone }),
  });
}

export function useActivityReport(range: DateRange) {
  const timezone = useTimezone();
  return useQuery({
    queryKey: queryKeys.reportActivities(range.from, range.to),
    queryFn: () => reportsApi.activities({ ...range, timezone }),
  });
}

export function useDailyTrendReport(range: DateRange) {
  const timezone = useTimezone();
  return useQuery({
    queryKey: queryKeys.reportDailyTrend(range.from, range.to),
    queryFn: () => reportsApi.dailyTrend({ ...range, timezone }),
  });
}
