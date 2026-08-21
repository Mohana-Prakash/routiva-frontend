import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, type UpdateProfileInput } from "@/lib/api/users";
import { queryKeys } from "@/lib/query/queryKeys";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => usersApi.updateMe(input),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.me(), user);
    },
  });
}
