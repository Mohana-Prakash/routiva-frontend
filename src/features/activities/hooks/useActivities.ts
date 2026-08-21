import { useQuery } from "@tanstack/react-query";
import { activitiesApi } from "@/lib/api/activities";
import { queryKeys } from "@/lib/query/queryKeys";

export function useActivities() {
  return useQuery({
    queryKey: queryKeys.activities(),
    queryFn: activitiesApi.list,
  });
}

export function useActiveActivities() {
  const query = useActivities();
  return { ...query, data: query.data?.filter((a) => a.isActive) };
}
