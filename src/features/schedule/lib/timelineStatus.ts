import type { ScheduleDayItem } from "@/types/schedule";
import type { TimelineDisplayStatus } from "@/types/activity-log";
import { isTimeNowWithinRange } from "@/lib/datetime/time";

/**
 * Derives the UI-facing timeline status (frontend-requirements 02 §4) from the
 * item's tracked log status plus, for still-planned items, the current time.
 * Purely presentational — never used as the source of truth for tracking state.
 */
export function getTimelineDisplayStatus(item: ScheduleDayItem, nowTime: string): TimelineDisplayStatus {
  const status = item.activityLog?.status;

  switch (status) {
    case "COMPLETED":
      return "COMPLETED";
    case "SKIPPED":
      return "SKIPPED";
    case "CANCELLED":
      return "CANCELLED";
    case "ADJUSTED":
      return "ADJUSTED";
    case "MISSED":
      return "MISSED";
    case "IN_PROGRESS":
      return "CURRENT";
    default:
      // PLANNED or no log yet — derive upcoming/current from wall-clock time.
      return isTimeNowWithinRange(item.startTime, item.endTime, nowTime) ? "CURRENT" : "UPCOMING";
  }
}
