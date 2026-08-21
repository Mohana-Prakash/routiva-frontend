/**
 * Centralized, predictable query keys (frontend-requirements 06 §8). Every hook
 * that reads or invalidates a query must go through these factories so keys never
 * drift out of sync between a query and the mutation that should invalidate it.
 */
export const queryKeys = {
  me: () => ["me"] as const,

  categories: () => ["categories"] as const,

  activities: () => ["activities"] as const,
  activity: (id: string) => ["activities", id] as const,

  scheduleEntries: () => ["schedule-entries"] as const,

  scheduleExceptions: (date: string) => ["schedule-exceptions", date] as const,

  scheduleToday: () => ["schedule", "today"] as const,
  scheduleDate: (date: string) => ["schedule", date] as const,

  activityLogs: (from: string, to: string) => ["activity-logs", from, to] as const,
  activityLog: (id: string) => ["activity-logs", "detail", id] as const,

  notificationPreferences: () => ["notifications", "preferences"] as const,

  reportSummary: (from: string, to: string) => ["reports", "summary", from, to] as const,
  reportCategories: (from: string, to: string) => ["reports", "categories", from, to] as const,
  reportActivities: (from: string, to: string) => ["reports", "activities", from, to] as const,
  reportDailyTrend: (from: string, to: string) => ["reports", "daily-trend", from, to] as const,
};
