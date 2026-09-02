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
    staleTime: 60_000,
    // A 401 here just means "not logged in yet" — not a query error to surface.
    throwOnError: false,
    // A definitive "not logged in" (401 that survived the client's own refresh attempt)
    // shouldn't retry — but a NETWORK_ERROR (no response at all: a dropped connection, or
    // Render's free-tier backend cold-starting after being idle, which happens often since
    // phones get backgrounded far more frequently than the 15-minute access-token TTL) says
    // nothing about whether the session is actually still good. Without a retry here, that
    // transient failure alone was enough to flash the whole app to a "logged out" screen on
    // every resume it happened to catch, even though the refresh token was still valid for
    // up to 30 days (JWT_REFRESH_TTL_DAYS).
    retry: (failureCount, error) => error instanceof ApiError && error.code === "NETWORK_ERROR" && failureCount < 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
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
