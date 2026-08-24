import type { ActivityLog } from "./activity-log";

export type RecurrenceType = "DAILY" | "WEEKDAYS" | "ONE_TIME";

/**
 * `daysOfWeek` uses 0 = Sunday ... 6 = Saturday, required when type is WEEKDAYS.
 * `date` ("YYYY-MM-DD") anchors a ONE_TIME entry to the single day it occurs on —
 * backend-requirements 02 §7 lists schedule_entries' fields as non-exhaustive
 * ("should include") and doesn't show an anchor date, but a ONE_TIME entry is
 * meaningless without one, so this is assumed pending the published schema.
 */
export interface Recurrence {
  type: RecurrenceType;
  daysOfWeek?: number[];
  date?: string;
}

/** The user's normal recurring routine (backend-requirements 04 §2-3). */
export interface ScheduleEntry {
  id: string;
  userId: string;
  activityId: string;
  startTime: string | null; // "HH:mm"; null (with endTime) means timeless — no fixed slot
  endTime: string | null; // "HH:mm"; null (with startTime) means timeless
  /** "HH:mm" — timeless-only: the absolute time of day to send the reminder at. */
  timelessReminderTime: string | null;
  recurrence: Recurrence;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleEntryInput {
  activityId: string;
  startTime: string | null;
  endTime: string | null;
  timelessReminderTime?: string | null;
  recurrence: Recurrence;
}

export type ScheduleUpdateScope = "THIS_OCCURRENCE" | "THIS_AND_FUTURE" | "ENTIRE_RULE";

export interface UpdateScheduleEntryInput {
  activityId?: string;
  // Omitted = unchanged (independently, for either field). To switch to timeless, set
  // `timeless: true` instead — it wins over whatever startTime/endTime are also sent.
  startTime?: string;
  endTime?: string;
  timeless?: boolean;
  timelessReminderTime?: string | null;
  recurrence?: Recurrence;
  isActive?: boolean;
  /** Required by backend-requirements 04 §11 whenever a recurring entry changes. */
  scope: ScheduleUpdateScope;
  /** Date the scoped update applies from, required for THIS_OCCURRENCE / THIS_AND_FUTURE. */
  effectiveDate?: string;
}

export type ScheduleExceptionAction = "MOVE" | "SKIP" | "ADD" | "REPLACE";

/** A date-specific deviation from the base schedule (backend-requirements 04 §7). */
export interface ScheduleException {
  id: string;
  userId: string;
  sourceScheduleEntryId: string | null;
  activityId: string;
  date: string; // "YYYY-MM-DD"
  startTime: string | null;
  endTime: string | null;
  timelessReminderTime: string | null;
  action: ScheduleExceptionAction;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleExceptionInput {
  sourceScheduleEntryId?: string | null;
  activityId: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  timelessReminderTime?: string | null;
  action: ScheduleExceptionAction;
  reason?: string | null;
}

export interface UpdateScheduleExceptionInput {
  startTime?: string | null;
  endTime?: string | null;
  timelessReminderTime?: string | null;
  reason?: string | null;
}

export type ScheduleItemSource = "BASE" | "EXCEPTION" | "ONE_TIME";

/**
 * One entry in the rendered day timeline returned by `GET /schedules/date/:date`
 * (backend-requirements 04 §8: base + exceptions + one-time activities merged into
 * a single deterministic chronological list). Exact backend field names are not yet
 * published via OpenAPI — this is the frontend's expected integration contract and
 * should be reconciled against the real schema once available.
 */
export interface ScheduleDayItem {
  id: string;
  date: string;
  activityId: string;
  activityName: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string | null;
  startTime: string | null;
  endTime: string | null;
  source: ScheduleItemSource;
  scheduleEntryId: string | null;
  exceptionId: string | null;
  alarmEnabled: boolean;
  alarmOffsetMinutes: number | null;
  /** Timeless items only: the resolved instant timelessReminderTime falls on for this date. */
  reminderAt: string | null;
  notes: string | null;
  activityLog: ActivityLog | null;
  hasConflict: boolean;
  conflictsWithIds: string[];
}

export interface DayScheduleResponse {
  date: string;
  timezone: string;
  items: ScheduleDayItem[];
}

/** User-facing choices offered when the backend reports 409 SCHEDULE_CONFLICT. */
export type ConflictResolution = "KEEP_BOTH" | "SHIFT_AFFECTED" | "SKIP_AFFECTED_TODAY" | "CANCEL";
