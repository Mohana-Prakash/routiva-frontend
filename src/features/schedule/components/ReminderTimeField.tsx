"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const NONE = "none";
const CUSTOM = "custom";

const REMINDER_TIME_OPTIONS = [
  { value: "08:00", label: "Morning (8:00 AM)" },
  { value: "12:00", label: "Midday (12:00 PM)" },
  { value: "15:00", label: "Afternoon (3:00 PM)" },
  { value: "18:00", label: "Evening (6:00 PM)" },
  { value: "21:00", label: "Night (9:00 PM)" },
] as const;

interface ReminderTimeFieldProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

/**
 * Preset time-of-day picker for a timeless activity's optional reminder — mirrors
 * the preset-select + custom-fallback pattern AlarmOffsetField uses for per-activity
 * alarm timing, adapted to an absolute clock time since a timeless activity has no
 * start time to offset from.
 */
export function ReminderTimeField({ value, onChange, id }: ReminderTimeFieldProps) {
  const presetValues = REMINDER_TIME_OPTIONS.map((o) => o.value) as string[];
  const isPreset = value !== "" && presetValues.includes(value);
  const [mode, setMode] = useState<string>(value === "" ? NONE : isPreset ? value : CUSTOM);

  function handleSelect(next: string) {
    setMode(next);
    if (next === NONE) {
      onChange("");
    } else if (next === CUSTOM) {
      onChange(value && !presetValues.includes(value) ? value : "09:00");
    } else {
      onChange(next);
    }
  }

  return (
    <div className="space-y-2">
      <Select
        value={mode}
        onValueChange={(next) => next && handleSelect(next)}
        items={{
          [NONE]: "No reminder",
          ...Object.fromEntries(REMINDER_TIME_OPTIONS.map((o) => [o.value, o.label])),
          [CUSTOM]: "Custom time",
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Choose a time" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>No reminder</SelectItem>
          {REMINDER_TIME_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM}>Custom time</SelectItem>
        </SelectContent>
      </Select>
      {mode === CUSTOM && (
        <Input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Reminder time"
        />
      )}
    </div>
  );
}
