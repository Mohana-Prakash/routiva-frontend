import { combineDateAndEndTime, combineDateAndTime } from "@/lib/datetime/time";
import { useNow } from "@/hooks/useNow";
import type { ScheduleDayItem } from "@/types/schedule";

/**
 * Single source of truth for which tracking actions (Start/Complete/Skip) a schedule item
 * offers right now — previously duplicated by hand across TimelineItem, ActivityDetailSheet,
 * and (before this) a from-scratch copy in CurrentActivityCard, which is exactly how Start
 * ended up staying available past an activity's end time in one copy but not the other. Any
 * future gating change belongs here, once, not in each call site.
 */
export function useTrackingAvailability(item: ScheduleDayItem | null, date: string, timezone: string) {
  const now = useNow();
  if (!item) {
    return {
      isTimeless: true,
      timeHasArrived: false,
      timeHasEnded: false,
      canStart: false,
      canComplete: false,
      canSkip: false,
      canMarkMissed: false,
    };
  }

  const logStatus = item.activityLog?.status;
  const isTimeless = !item.startTime || !item.endTime;

  // Start/Complete only become available once the activity's scheduled time has actually
  // arrived — you can't log time for something that hasn't happened yet.
  const timeHasArrived =
    isTimeless || combineDateAndTime(date, item.startTime as string, timezone).getTime() <= now.getTime();
  // Uses combineDateAndEndTime (not a plain nowTime/endTime string compare) so an overnight
  // range like 22:00-03:55 rolls its end onto the next day instead of comparing against a
  // same-day 03:55 that's already hours in the past the moment the activity starts.
  const timeHasEnded =
    !isTimeless &&
    combineDateAndEndTime(date, item.startTime as string, item.endTime as string, timezone).getTime() <
      now.getTime();

  // Start has an upper bound Complete doesn't: once the window has closed without it being
  // started, "starting" it now is meaningless — Complete is still the honest way to log it.
  const canStart = logStatus === "PLANNED" && timeHasArrived && !timeHasEnded;
  // Complete has no upper-bound gate: the system never assumes an outcome just because the
  // planned window passed. A PLANNED log the backend has swept to MISSED still gets
  // Complete/Skip — that status is a "wasn't acted on in time" label, not a final verdict —
  // and an IN_PROGRESS log stays completable indefinitely rather than being silently
  // auto-completed.
  const canComplete =
    logStatus === "IN_PROGRESS" || logStatus === "MISSED" || (logStatus === "PLANNED" && timeHasArrived);
  // Skip has an upper bound Complete doesn't: once you've actually started something, skipping
  // it after its window closed is meaningless — you engaged with it, so the only honest options
  // left are Complete (say how long you actually spent) or leaving it as is. MISSED is excluded
  // entirely: it's already the system's own "not done" label, so Skip wouldn't add anything —
  // Complete (if it happened elsewhere) is the only useful action left.
  const canSkip =
    (logStatus === "PLANNED" && !timeHasEnded) || (logStatus === "IN_PROGRESS" && !timeHasEnded);
  // The reconcile sweep only ever auto-flips an expired PLANNED log to MISSED — it never
  // touches IN_PROGRESS, since starting something is a real signal the system shouldn't assume
  // away. That leaves this as the only route to MISSED for something started and then
  // abandoned past its window: otherwise the only option left is Complete, which would force a
  // dishonest "yes I did this" for something that in fact wasn't finished.
  const canMarkMissed = logStatus === "IN_PROGRESS" && timeHasEnded;

  return { isTimeless, timeHasArrived, timeHasEnded, canStart, canComplete, canSkip, canMarkMissed };
}
