"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Recurrence, RecurrenceType } from "@/types/schedule";

const WEEKDAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

interface RecurrenceFieldProps {
  value: Recurrence;
  onChange: (value: Recurrence) => void;
}

/** Daily / selected weekdays / one-time (frontend-requirements 02 §7, backend-requirements 04 §3). */
export function RecurrenceField({ value, onChange }: RecurrenceFieldProps) {
  function setType(type: RecurrenceType) {
    onChange({
      type,
      daysOfWeek: type === "WEEKDAYS" ? (value.daysOfWeek ?? []) : undefined,
      date: type === "ONE_TIME" ? value.date : undefined,
    });
  }

  function toggleDay(day: number) {
    const current = value.daysOfWeek ?? [];
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    onChange({ ...value, daysOfWeek: next });
  }

  return (
    <div className="space-y-3">
      <RadioGroup value={value.type} onValueChange={(v) => v && setType(v as RecurrenceType)} className="flex flex-wrap gap-4">
        <label className="flex items-center gap-1.5 text-sm">
          <RadioGroupItem value="DAILY" /> Daily
        </label>
        <label className="flex items-center gap-1.5 text-sm">
          <RadioGroupItem value="WEEKDAYS" /> Selected weekdays
        </label>
        <label className="flex items-center gap-1.5 text-sm">
          <RadioGroupItem value="ONE_TIME" /> One-time
        </label>
      </RadioGroup>

      {value.type === "WEEKDAYS" && (
        <div role="group" aria-label="Weekdays" className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map((day) => {
            const selected = (value.daysOfWeek ?? []).includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleDay(day.value)}
                className={cn(
                  "h-8 rounded-md border px-2.5 text-xs font-medium transition-colors",
                  selected ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
                )}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      )}

      {value.type === "ONE_TIME" && (
        <div className="space-y-1.5">
          <Label htmlFor="one-time-date">Date</Label>
          <Input id="one-time-date" type="date" value={value.date ?? ""} onChange={(e) => onChange({ ...value, date: e.target.value })} />
        </div>
      )}
    </div>
  );
}
