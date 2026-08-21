export interface ReportRangeParams {
  from: string; // "YYYY-MM-DD"
  to: string; // "YYYY-MM-DD"
  timezone?: string;
}

/** `GET /reports/summary` */
export interface ReportSummary {
  totalPlannedMinutes: number;
  totalActualMinutes: number;
  completionRate: number; // 0-100
  completedCount: number;
  skippedCount: number;
  adjustedCount: number;
  missedCount: number;
  plannedVsActualDiffMinutes: number;
}

/** One row of `GET /reports/categories` */
export interface CategoryReportItem {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  plannedMinutes: number;
  actualMinutes: number;
  completionRate: number;
}

/** One row of `GET /reports/activities` (planned vs actual + consistency per activity). */
export interface ActivityReportItem {
  activityId: string;
  activityName: string;
  categoryId: string;
  categoryName: string;
  plannedMinutes: number;
  actualMinutes: number;
  achievementRate: number; // actual/planned, 0-100
  consistencyCompletedSessions: number;
  consistencyTotalSessions: number;
  consistencyRate: number; // 0-100
  skippedSessions: number;
}

/** One point of `GET /reports/daily-trend` */
export interface DailyTrendPoint {
  date: string;
  plannedMinutes: number;
  actualMinutes: number;
  completionPercentage: number;
}

export interface DailyTrendResponse {
  points: DailyTrendPoint[];
}
