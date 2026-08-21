import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, subDays, subMonths } from "date-fns";
import type { WeekStartDay } from "@/types/user";

export type DateRangePresetKey = "TODAY" | "YESTERDAY" | "THIS_WEEK" | "LAST_WEEK" | "THIS_MONTH" | "LAST_MONTH" | "CUSTOM";

export interface DateRange {
  from: string;
  to: string;
}

export const DATE_RANGE_PRESETS: { key: Exclude<DateRangePresetKey, "CUSTOM">; label: string }[] = [
  { key: "TODAY", label: "Today" },
  { key: "YESTERDAY", label: "Yesterday" },
  { key: "THIS_WEEK", label: "This week" },
  { key: "LAST_WEEK", label: "Last week" },
  { key: "THIS_MONTH", label: "This month" },
  { key: "LAST_MONTH", label: "Last month" },
];

function fmt(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** frontend-requirements 04 §1, §9 — presets plus a fully custom range. */
export function resolveDateRangePreset(key: Exclude<DateRangePresetKey, "CUSTOM">, today: Date, weekStart: WeekStartDay): DateRange {
  const weekStartsOn = weekStart === "SUNDAY" ? 0 : 1;

  switch (key) {
    case "TODAY":
      return { from: fmt(today), to: fmt(today) };
    case "YESTERDAY": {
      const yesterday = subDays(today, 1);
      return { from: fmt(yesterday), to: fmt(yesterday) };
    }
    case "THIS_WEEK":
      return { from: fmt(startOfWeek(today, { weekStartsOn })), to: fmt(endOfWeek(today, { weekStartsOn })) };
    case "LAST_WEEK": {
      const lastWeekDay = subDays(today, 7);
      return { from: fmt(startOfWeek(lastWeekDay, { weekStartsOn })), to: fmt(endOfWeek(lastWeekDay, { weekStartsOn })) };
    }
    case "THIS_MONTH":
      return { from: fmt(startOfMonth(today)), to: fmt(endOfMonth(today)) };
    case "LAST_MONTH": {
      const lastMonthDay = subMonths(today, 1);
      return { from: fmt(startOfMonth(lastMonthDay)), to: fmt(endOfMonth(lastMonthDay)) };
    }
  }
}
