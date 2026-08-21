import { httpClient } from "./client";
import type { Activity, CreateActivityInput, UpdateActivityInput } from "@/types/activity";

export const activitiesApi = {
  /** Includes archived (inactive) activities — see the matching comment in lib/api/categories.ts. */
  list: () => httpClient.get<Activity[]>("/activities", { params: { includeInactive: true } }).then((r) => r.data),

  get: (id: string) => httpClient.get<Activity>(`/activities/${id}`).then((r) => r.data),

  create: (input: CreateActivityInput) => httpClient.post<Activity>("/activities", input).then((r) => r.data),

  update: (id: string, input: UpdateActivityInput) => httpClient.patch<Activity>(`/activities/${id}`, input).then((r) => r.data),

  remove: (id: string) => httpClient.delete<void>(`/activities/${id}`).then((r) => r.data),
};
