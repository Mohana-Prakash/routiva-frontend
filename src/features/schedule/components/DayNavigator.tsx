"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatDateLabel } from "@/lib/datetime/time";

interface DayNavigatorProps {
  date: string;
  todayDate: string;
  onChange: (date: string) => void;
}

/** "YYYY-MM-DD" parsed as a local calendar date (no timezone shifting) for react-day-picker. */
function parseDateString(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateString(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DayNavigator({ date, todayDate, onChange }: DayNavigatorProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const isAtOrPastToday = date >= todayDate;
  const isToday = date === todayDate;

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

  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="icon-sm" aria-label="Previous day" onClick={() => shiftDay(-1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger
          render={
            <Button variant="ghost" className="min-w-36 justify-start font-medium">
              <CalendarDays className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              {isToday ? "Today" : formatDateLabel(date)}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={parseDateString(date)}
            defaultMonth={parseDateString(date)}
            disabled={{ after: parseDateString(todayDate) }}
            onSelect={(picked) => {
              if (!picked) return;
              onChange(toDateString(picked));
              setPickerOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Next day"
        disabled={isAtOrPastToday}
        onClick={() => shiftDay(1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {!isToday && (
        <Button variant="ghost" size="sm" onClick={() => onChange(todayDate)}>
          Today
        </Button>
      )}
    </div>
  );
}
