import { httpClient } from "./client";
import type { ActivityLog, ActivityLogFilters, CorrectActualTimingInput } from "@/types/activity-log";
import type { PaginatedResponse, PaginationParams } from "@/types/api";

/**
 * 05-tracking-and-time-logging.md §9 asks for a daily-summary API, but
 * 08-api-contracts-and-validation.md does not list one among the tracking
 * endpoints. Rather than invent an unpublished route, the daily summary is
 * derived client-side from `GET /schedules/date/:date` — see
 * features/tracking/lib/computeDailySummary.ts. Revisit if the backend later
 * exposes a dedicated endpoint.
 */
export const trackingApi = {
  listLogs: (filters: ActivityLogFilters & PaginationParams) =>
    httpClient.get<PaginatedResponse<ActivityLog>>("/activity-logs", { params: filters }).then((r) => r.data),

  getLog: (id: string) => httpClient.get<ActivityLog>(`/activity-logs/${id}`).then((r) => r.data),

  start: (id: string) => httpClient.post<ActivityLog>(`/activity-logs/${id}/start`).then((r) => r.data),

  complete: (id: string) => httpClient.post<ActivityLog>(`/activity-logs/${id}/complete`).then((r) => r.data),

  skip: (id: string) => httpClient.post<ActivityLog>(`/activity-logs/${id}/skip`).then((r) => r.data),

  correct: (id: string, input: CorrectActualTimingInput) =>
    httpClient.patch<ActivityLog>(`/activity-logs/${id}`, input).then((r) => r.data),
};
