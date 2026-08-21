import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api/categories";
import { queryKeys } from "@/lib/query/queryKeys";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: categoriesApi.list,
  });
}

/** Only categories a user should be able to pick when assigning a new activity. */
export function useActiveCategories() {
  const query = useCategories();
  return { ...query, data: query.data?.filter((c) => c.isActive) };
}
