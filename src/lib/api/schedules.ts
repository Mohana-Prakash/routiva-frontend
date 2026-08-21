import { httpClient } from "./client";
import type {
  ConflictResolution,
  CreateScheduleEntryInput,
  CreateScheduleExceptionInput,
  DayScheduleResponse,
  ScheduleEntry,
  ScheduleException,
  ScheduleUpdateScope,
  UpdateScheduleEntryInput,
  UpdateScheduleExceptionInput,
} from "@/types/schedule";

/**
 * When the user has already been shown a conflict dialog and picked a resolution
 * other than KEEP_BOTH, we resubmit with this flag so the backend applies it
 * instead of returning another 409. Exact wire shape (`resolution`) is an
 * assumption pending the published OpenAPI contract — see 06-api-contracts-frontend-boundary.md.
 */
export interface WithConflictResolution {
  resolution?: Exclude<ConflictResolution, "CANCEL">;
}

export const schedulesApi = {
  list: () => httpClient.get<ScheduleEntry[]>("/schedules").then((r) => r.data),

  create: (input: CreateScheduleEntryInput & WithConflictResolution) =>
    httpClient.post<ScheduleEntry>("/schedules", input).then((r) => r.data),

  update: (id: string, input: UpdateScheduleEntryInput & WithConflictResolution) =>
    httpClient.patch<ScheduleEntry>(`/schedules/${id}`, input).then((r) => r.data),

  remove: (id: string, scope: ScheduleUpdateScope) =>
    httpClient.delete<void>(`/schedules/${id}`, { params: { scope } }).then((r) => r.data),

  today: () => httpClient.get<DayScheduleResponse>("/schedules/today").then((r) => r.data),

  byDate: (date: string) => httpClient.get<DayScheduleResponse>(`/schedules/date/${date}`).then((r) => r.data),

  createException: (input: CreateScheduleExceptionInput & WithConflictResolution) =>
    httpClient.post<ScheduleException>("/schedules/exceptions", input).then((r) => r.data),

  updateException: (id: string, input: UpdateScheduleExceptionInput & WithConflictResolution) =>
    httpClient.patch<ScheduleException>(`/schedules/exceptions/${id}`, input).then((r) => r.data),

  removeException: (id: string) => httpClient.delete<void>(`/schedules/exceptions/${id}`).then((r) => r.data),
};
