import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { queryKeys } from "@/lib/query/queryKeys";
import type { LoginInput, RegisterInput } from "@/types/auth";

/**
 * Fetches the canonical user via GET /auth/me right after login/register instead
 * of trusting the login/register response body's shape. This makes the
 * mutation fail loudly (a toast, no navigation) if the session cookie didn't
 * actually stick — e.g. a cross-origin cookie/CORS issue — instead of
 * optimistically believing the user is authenticated and then silently
 * bouncing back to /login the moment RequireAuth or any other request
 * discovers otherwise.
 */
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      await authApi.login(input);
      return authApi.me();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.me(), user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      await authApi.register(input);
      return authApi.me();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.me(), user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      queryClient.setQueryData(queryKeys.me(), null);
      queryClient.clear();
    },
  });
}

export function useLogoutAll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logoutAll,
    onSettled: () => {
      queryClient.setQueryData(queryKeys.me(), null);
      queryClient.clear();
    },
  });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: authApi.forgotPassword });
}

export function useResetPassword() {
  return useMutation({ mutationFn: authApi.resetPassword });
}
