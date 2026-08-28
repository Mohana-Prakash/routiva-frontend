import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { addDays, format, parseISO } from "date-fns";

/** "HH:mm" in 24-hour time, per frontend-requirements 01 §3.4. */
export type TimeString = string;
/** "YYYY-MM-DD" */
export type DateString = string;

export function todayInTimeZone(timezone: string): DateString {
  return formatInTimeZone(new Date(), timezone, "yyyy-MM-dd");
}

export function nowTimeInTimeZone(timezone: string): TimeString {
  return formatInTimeZone(new Date(), timezone, "HH:mm");
}

/**
 * Combines a date + "HH:mm" into the correct UTC instant for that wall-clock
 * moment in the given IANA timezone. Uses `fromZonedTime` deliberately —
 * `toZonedTime` does the opposite conversion (UTC instant -> wall-clock display)
 * and would silently depend on the runtime's local system timezone when parsing
 * the plain (offset-less) date-time string, producing a wrong instant on any
 * machine whose local timezone isn't UTC.
 */
export function combineDateAndTime(date: DateString, time: TimeString, timezone: string): Date {
  return fromZonedTime(`${date}T${time}:00`, timezone);
}

/**
 * Like `combineDateAndTime`, but for an occurrence's END time specifically — rolls onto the
 * next calendar day when `endTime <= startTime` (an overnight range, e.g. 22:00-03:55 Sleep).
 * Plain `combineDateAndTime(date, endTime, timezone)` would otherwise combine the end time with
 * the *same* date the occurrence started on, landing hours in the past for the entire time the
 * activity is actually meant to be running.
 */
export function combineDateAndEndTime(date: DateString, startTime: TimeString, endTime: TimeString, timezone: string): Date {
  const crossesMidnight = toMinutes(endTime) <= toMinutes(startTime);
  const effectiveDate = crossesMidnight ? format(addDays(parseISO(date), 1), "yyyy-MM-dd") : date;
  return combineDateAndTime(effectiveDate, endTime, timezone);
}

export function formatIsoToTime(iso: string, timezone: string): TimeString {
  return formatInTimeZone(parseISO(iso), timezone, "HH:mm");
}

export function formatIsoToDateLabel(iso: string, timezone: string): string {
  return formatInTimeZone(parseISO(iso), timezone, "EEEE, MMMM d");
}

function toMinutes(time: TimeString): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Minutes between two "HH:mm" values, treating `end <= start` as crossing midnight. */
export function minutesBetween(start: TimeString, end: TimeString): number {
  const [startMinutes, endMinutes] = toDaySegments(start, end)[0];
  return endMinutes - startMinutes;
}

export function formatDurationMinutes(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (hours === 0) return `${remaining}m`;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

/**
 * Advisory-only overlap check used for instant form feedback while the user is
 * typing. The backend remains the sole authority on real conflicts (409
 * SCHEDULE_CONFLICT) — this must never be used to silently block or auto-resolve
 * a submission, only to hint at a likely conflict before the round trip.
 *
 * Each range is represented on a 48h timeline (once as-is, once shifted a full
 * day later) so two independently midnight-crossing ranges compare correctly
 * regardless of which one wraps.
 */
export function timeRangesOverlap(aStart: TimeString, aEnd: TimeString, bStart: TimeString, bEnd: TimeString): boolean {
  const aSegments = toDaySegments(aStart, aEnd);
  const bSegments = toDaySegments(bStart, bEnd);
  return aSegments.some((a) => bSegments.some((b) => a[0] < b[1] && b[0] < a[1]));
}

/** Whether `nowTime` falls within [start, end), correctly handling a midnight-crossing range. */
export function isTimeNowWithinRange(start: TimeString, end: TimeString, nowTime: TimeString): boolean {
  const [startMin, endMin] = toDaySegments(start, end)[0];
  const now = toMinutes(nowTime);
  return (now >= startMin && now < endMin) || (now + 24 * 60 >= startMin && now + 24 * 60 < endMin);
}

/**
 * Whether `nowTime` is past `end`, for a same-day (non-midnight-crossing) range only. Deliberately
 * returns false for a range where `end <= start` (e.g. an overnight 22:00–06:00 slot) rather than
 * guessing — from bare "HH:mm" strings with no date, there's no way to tell "just past this
 * morning's end" apart from "well before tonight's start", and getting that wrong would wrongly
 * flag an upcoming overnight occurrence as already missed.
 */
export function isTimeNowAfterRange(start: TimeString, end: TimeString, nowTime: TimeString): boolean {
  const startMin = toMinutes(start);
  const endMin = toMinutes(end);
  if (endMin <= startMin) return false;
  return toMinutes(nowTime) >= endMin;
}

function toDaySegments(start: TimeString, end: TimeString): [number, number][] {
  const startMinutes = toMinutes(start);
  let endMinutes = toMinutes(end);
  if (endMinutes <= startMinutes) endMinutes += 24 * 60;
  return [
    [startMinutes, endMinutes],
    [startMinutes + 24 * 60, endMinutes + 24 * 60],
  ];
}

/** Minutes from `nowTime` until the next occurrence of `targetTime` (0–1439), wrapping past midnight. */
export function minutesUntil(targetTime: TimeString, nowTime: TimeString): number {
  const diff = toMinutes(targetTime) - toMinutes(nowTime);
  return diff < 0 ? diff + 24 * 60 : diff;
}

export function formatDateLabel(date: DateString): string {
  return format(parseISO(date), "EEEE, MMMM d");
}

export function isValidTimeString(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}
