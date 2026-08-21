"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { setUnauthorizedHandler } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/queryKeys";
import { ApiError } from "@/types/api";
import type { User } from "@/types/user";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading, isFetched } = useQuery({
    queryKey: queryKeys.me(),
    queryFn: authApi.me,
    retry: false,
    staleTime: 60_000,
    // A 401 here just means "not logged in yet" — not a query error to surface.
    throwOnError: false,
  });

  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.setQueryData(queryKeys.me(), null);
      queryClient.clear();
    });
    return () => setUnauthorizedHandler(null);
  }, [queryClient]);

  const status: AuthStatus = isLoading || !isFetched ? "loading" : user ? "authenticated" : "unauthenticated";

  const value = useMemo<AuthContextValue>(() => ({ user: user ?? null, status }), [user, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function isSessionExpiredError(error: unknown): boolean {
  return error instanceof ApiError && (error.code === "SESSION_EXPIRED" || error.status === 401);
}
