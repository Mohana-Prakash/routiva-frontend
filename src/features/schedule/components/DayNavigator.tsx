"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateLabel } from "@/lib/datetime/time";

interface DayNavigatorProps {
  date: string;
  todayDate: string;
  onChange: (date: string) => void;
}

export function DayNavigator({ date, todayDate, onChange }: DayNavigatorProps) {
  const isAtOrPastToday = date >= todayDate;

  function shiftDay(offsetDays: number) {
    // Do the arithmetic entirely in UTC. Parsing `${date}T00:00:00` (no "Z") reads it as
    // local time, but toISOString() always emits UTC — for any timezone ahead of UTC that
    // round-trip silently shifts the resulting date (e.g. two days back instead of one).
    const [year, month, day] = date.split("-").map(Number);
    const next = new Date(Date.UTC(year, month - 1, day + offsetDays));
    const nextDate = next.toISOString().slice(0, 10);
    // The Next button is disabled once isAtOrPastToday, but guard here too in case this
    // is ever called some other way — the daily view never looks into the future.
    if (nextDate > todayDate) return;
    onChange(nextDate);
  }

  function handlePickDate(value: string) {
    if (!value) return;
    onChange(value > todayDate ? todayDate : value);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="icon-sm" aria-label="Previous day" onClick={() => shiftDay(-1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Input
        type="date"
        value={date}
        max={todayDate}
        onChange={(e) => handlePickDate(e.target.value)}
        className="w-40"
        aria-label="Select date"
      />
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Next day"
        disabled={isAtOrPastToday}
        onClick={() => shiftDay(1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      {date !== todayDate && (
        <Button variant="ghost" size="sm" onClick={() => onChange(todayDate)}>
          Today
        </Button>
      )}
      <span className="text-sm font-medium text-muted-foreground">{formatDateLabel(date)}</span>
    </div>
  );
}
