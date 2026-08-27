export type ActivityLogStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "SKIPPED"
  | "CANCELLED"
  | "MISSED"
  | "ADJUSTED";

/** Immutable-once-recorded historical record (backend-requirements 05). */
export interface ActivityLog {
  id: string;
  userId: string;
  activityId: string;
  scheduleEntryId: string | null;
  exceptionId: string | null;
  activityDate: string; // "YYYY-MM-DD"
  plannedStart: string | null;
  plannedEnd: string | null;
  actualStart: string | null;
  actualEnd: string | null;
  status: ActivityLogStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  activityNameSnapshot?: string;
  categoryNameSnapshot?: string;
}

export interface CorrectActualTimingInput {
  actualStart?: string | null;
  actualEnd?: string | null;
  notes?: string | null;
}

/** Optional actuals for the "how long did you actually spend on this" completion prompt —
 * omitted entirely for a simple one-tap complete (e.g. a headless notification-button tap). */
export interface CompleteActivityInput {
  actualStart?: string;
  actualEnd?: string;
}

export interface ActivityLogFilters {
  from: string;
  to: string;
  status?: ActivityLogStatus;
}

export interface DailySummary {
  date: string;
  completedCount: number;
  skippedCount: number;
  missedCount: number;
  /** Not yet started (PLANNED, no log yet) — distinct from currentCount below. */
  upcomingCount: number;
  /** Actually in progress right now (IN_PROGRESS) — was previously folded into upcomingCount. */
  currentCount: number;
  adjustedCount: number;
  plannedDurationMinutes: number;
  actualDurationMinutes: number;
  completionPercentage: number;
}

/**
 * UI-only presentational status derived from ActivityLogStatus plus the current
 * wall-clock time (frontend-requirements 02 §4). This is presentation logic, not a
 * duplicated business calculation: "is this now / in the future" is inherently a
 * client-side concern.
 */
export type TimelineDisplayStatus =
  | "UPCOMING"
  | "CURRENT"
  | "COMPLETED"
  | "SKIPPED"
  | "CANCELLED"
  | "ADJUSTED"
  | "MISSED";
