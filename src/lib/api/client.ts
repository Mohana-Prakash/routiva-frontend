import axios, { AxiosError, type AxiosInstance } from "axios";
import { env } from "@/lib/env";
import { ApiError, type ApiErrorCode, type ApiFieldError, type ScheduleConflictEntry } from "@/types/api";

/**
 * The app is a static SPA (no Next.js server/proxy), so the browser talks to the
 * Express API cross-origin. Auth is an httpOnly cookie set by the backend, which is
 * why every request carries `withCredentials: true` rather than an Authorization
 * header the frontend would have to store itself.
 */
export const httpClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Every backend response is wrapped in a `{ success, data, meta }` /
 * `{ success: false, error: { code, message, details }, requestId }` envelope
 * (backend-requirements/01-architecture-and-principles.md §3). This interceptor
 * unwraps `data` on success so every api/*.ts call site can treat `response.data`
 * as the resource itself, matching this project's typed api client contracts.
 */
interface BackendEnvelope {
  success: boolean;
  data?: unknown;
}

interface BackendErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: {
      fieldErrors?: Record<string, string[] | undefined>;
      formErrors?: string[];
      conflicts?: ScheduleConflictEntry[];
    };
  };
  requestId?: string;
}

httpClient.interceptors.response.use((response) => {
  const body = response.data as BackendEnvelope | undefined;
  if (body && typeof body === "object" && body.success === true && "data" in body) {
    response.data = body.data;
  }
  return response;
});

function fieldErrorsFromDetails(details: BackendErrorBody["error"]["details"]): ApiFieldError[] | undefined {
  if (!details?.fieldErrors) return undefined;
  return Object.entries(details.fieldErrors)
    .filter((entry): entry is [string, string[]] => Array.isArray(entry[1]) && entry[1].length > 0)
    .map(([field, messages]) => ({ field, message: messages[0] as string }));
}

function normalizeError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0;
  const body = error.response?.data as Partial<BackendErrorBody> | undefined;

  if (body?.error?.code && body?.error?.message) {
    return new ApiError({
      code: body.error.code as ApiErrorCode,
      message: body.error.message,
      status,
      fieldErrors: fieldErrorsFromDetails(body.error.details),
      conflicts: body.error.details?.conflicts,
    });
  }

  if (!error.response) {
    return new ApiError({
      code: "NETWORK_ERROR",
      message: "Unable to reach the server. Check your connection and try again.",
      status: 0,
    });
  }

  return new ApiError({
    code: "INTERNAL_ERROR",
    message: "Something went wrong. Please try again.",
    status,
  });
}

let unauthorizedHandler: (() => void) | null = null;

/** Registered once by AuthProvider so the client can react to session expiry without importing React. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

/**
 * "invalid" means the backend explicitly rejected the refresh token (expired, revoked, reused)
 * — the session really is gone, so it's correct to log the user out. "unknown" means the
 * refresh attempt never got a real answer at all (no response — a network drop, or Render's
 * free-tier backend cold-starting after being idle, which the app hits often since phones get
 * backgrounded/locked far more often than every 15 minutes, the access token's TTL). Treating
 * "unknown" the same as "invalid" was the actual cause of frequent logouts despite the refresh
 * token itself being good for 30 days (JWT_REFRESH_TTL_DAYS): any transient hiccup while
 * refreshing was enough to wipe the whole session. Only "invalid" may log the user out.
 */
type RefreshOutcome = "refreshed" | "invalid" | "unknown";

let refreshPromise: Promise<RefreshOutcome> | null = null;

async function tryRefreshSession(): Promise<RefreshOutcome> {
  if (!refreshPromise) {
    refreshPromise = httpClient
      .post("/auth/refresh")
      .then((): RefreshOutcome => "refreshed")
      .catch((err: AxiosError): RefreshOutcome => {
        const apiError = normalizeError(err);
        return apiError.status === 401 || apiError.status === 403 ? "invalid" : "unknown";
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const apiError = normalizeError(error);
    const originalRequest = error.config as (typeof error.config & { _retried?: boolean }) | undefined;
    const isAuthEndpoint = originalRequest?.url?.includes("/auth/");

    if (apiError.status === 401 && originalRequest && !originalRequest._retried && !isAuthEndpoint) {
      originalRequest._retried = true;
      const outcome = await tryRefreshSession();
      if (outcome === "refreshed") {
        return httpClient(originalRequest);
      }
      if (outcome === "invalid") {
        unauthorizedHandler?.();
      }
      // "unknown": leave the session alone — this request just fails (network/server hiccup),
      // and the next successful request naturally retries the refresh cycle from a clean state.
    }

    return Promise.reject(apiError);
  },
);
