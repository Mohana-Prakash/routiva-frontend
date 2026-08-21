/**
 * Stable machine-readable error codes documented in the backend's API contract
 * (backend-requirements/08-api-contracts-and-validation.md). The frontend must
 * switch on `code`, never on the human-readable `message`.
 */
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "AUTH_REQUIRED"
  | "INVALID_CREDENTIALS"
  | "SESSION_EXPIRED"
  | "RESOURCE_NOT_FOUND"
  | "RESOURCE_FORBIDDEN"
  | "SCHEDULE_CONFLICT"
  | "DUPLICATE_RESOURCE"
  | "INVALID_STATE"
  | "RESOURCE_IN_USE"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorPayload {
  code: ApiErrorCode | string;
  message: string;
  status: number;
  fieldErrors?: ApiFieldError[];
  /** Present for SCHEDULE_CONFLICT — the entries the request collided with. */
  conflicts?: ScheduleConflictEntry[];
}

/** Normalized shape every failed API call rejects with, regardless of the raw axios error. */
export class ApiError extends Error {
  code: ApiErrorCode | string;
  status: number;
  fieldErrors?: ApiFieldError[];
  conflicts?: ScheduleConflictEntry[];

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.code = payload.code;
    this.status = payload.status;
    this.fieldErrors = payload.fieldErrors;
    this.conflicts = payload.conflicts;
  }
}

export interface ScheduleConflictEntry {
  id: string;
  activityName: string;
  startTime: string;
  endTime: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
