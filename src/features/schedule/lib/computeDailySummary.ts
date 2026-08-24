import type { ScheduleDayItem } from "@/types/schedule";
import type { DailySummary } from "@/types/activity-log";
import { minutesBetween } from "@/lib/datetime/time";

/**
 * Derives the daily completion summary (frontend-requirements 02 §11) from the
 * already-fetched day-schedule response instead of a dedicated endpoint — see
 * the comment in lib/api/tracking.ts for why. Every count here reflects the
 * ActivityLog status the backend returned; only "upcoming" is inferred (no log
 * yet / still PLANNED), which is presentational, not a business calculation.
 */
export function computeDailySummary(date: string, items: ScheduleDayItem[]): DailySummary {
  let completedCount = 0;
  let skippedCount = 0;
  let missedCount = 0;
  let adjustedCount = 0;
  let upcomingCount = 0;
  let plannedDurationMinutes = 0;
  let actualDurationMinutes = 0;

  for (const item of items) {
    // Timeless items (no fixed slot) have no planned duration to count.
    if (item.startTime && item.endTime) {
      plannedDurationMinutes += minutesBetween(item.startTime, item.endTime);
    }

    const status = item.activityLog?.status;
    switch (status) {
      case "COMPLETED":
        completedCount++;
        break;
      case "SKIPPED":
        skippedCount++;
        break;
      case "MISSED":
        missedCount++;
        break;
      case "ADJUSTED":
        adjustedCount++;
        completedCount++;
        break;
      case "CANCELLED":
        break;
      default:
        upcomingCount++;
    }

    const log = item.activityLog;
    if (log?.actualStart && log?.actualEnd) {
      const start = new Date(log.actualStart).getTime();
      const end = new Date(log.actualEnd).getTime();
      if (end > start) actualDurationMinutes += (end - start) / 60_000;
    }
  }

  const trackedCount = completedCount + skippedCount + missedCount;
  const completionPercentage = trackedCount === 0 ? 0 : Math.round((completedCount / trackedCount) * 100);

  return {
    date,
    completedCount,
    skippedCount,
    missedCount,
    upcomingCount,
    adjustedCount,
    plannedDurationMinutes,
    actualDurationMinutes: Math.round(actualDurationMinutes),
    completionPercentage,
  };
}
