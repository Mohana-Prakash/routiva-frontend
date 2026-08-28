import type { ScheduleDayItem } from "@/types/schedule";
import type { TimelineDisplayStatus } from "@/types/activity-log";
import { isTimeNowAfterRange, isTimeNowWithinRange } from "@/lib/datetime/time";

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
      // Timeless (no fixed slot) is always available today — never "Upcoming".
      if (!item.startTime || !item.endTime) return "CURRENT";
      // PLANNED or no log yet — derive upcoming/current/missed-looking from wall-clock time.
      // The backend only actually flips a log to MISSED on its own sweep (every 10 minutes),
      // so without this, an item whose window just closed would sit labeled "Upcoming" — and
      // still offer Start — for up to 10 minutes after it's clearly no longer upcoming.
      if (isTimeNowWithinRange(item.startTime, item.endTime, nowTime)) return "CURRENT";
      if (isTimeNowAfterRange(item.startTime, item.endTime, nowTime)) return "MISSED";
      return "UPCOMING";
  }
}
