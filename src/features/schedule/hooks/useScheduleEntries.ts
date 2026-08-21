import { useQuery } from "@tanstack/react-query";
import { schedulesApi } from "@/lib/api/schedules";
import { queryKeys } from "@/lib/query/queryKeys";

export function useScheduleEntries() {
  return useQuery({
    queryKey: queryKeys.scheduleEntries(),
    queryFn: schedulesApi.list,
  });
}
