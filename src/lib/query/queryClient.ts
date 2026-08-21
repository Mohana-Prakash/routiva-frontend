import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/types/api";

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError) {
    // Don't retry client errors — retrying won't fix bad input, missing auth, or a 404.
    if (error.status >= 400 && error.status < 500) return false;
  }
  return failureCount < 2;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: shouldRetry,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
