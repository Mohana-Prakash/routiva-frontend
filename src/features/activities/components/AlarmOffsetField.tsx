"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ALARM_TIMING_OPTIONS } from "@/lib/validation/activity";

const CUSTOM = "custom";

interface AlarmOffsetFieldProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  id?: string;
}

/** Alarm timing presets + custom offset (frontend-requirements 03 §3). */
export function AlarmOffsetField({ value, onChange, id }: AlarmOffsetFieldProps) {
  const presetValues = ALARM_TIMING_OPTIONS.map((o) => o.value) as number[];
  const isPreset = value !== undefined && presetValues.includes(value);
  const [mode, setMode] = useState<string>(value === undefined ? "" : isPreset ? String(value) : CUSTOM);

  function handleSelect(next: string) {
    setMode(next);
    if (next === CUSTOM) {
      onChange(value && !presetValues.includes(value) ? value : 20);
    } else {
      onChange(Number(next));
    }
  }

  return (
    <div className="flex gap-2">
      <Select
        value={mode}
        onValueChange={(next) => next && handleSelect(next)}
        items={{ ...Object.fromEntries(ALARM_TIMING_OPTIONS.map((o) => [String(o.value), o.label])), [CUSTOM]: "Custom" }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Choose timing" />
        </SelectTrigger>
        <SelectContent>
          {ALARM_TIMING_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM}>Custom</SelectItem>
        </SelectContent>
      </Select>
      {mode === CUSTOM && (
        <div className="flex shrink-0 items-center gap-1.5">
          <Input
            type="number"
            min={0}
            max={180}
            className="w-20"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
            aria-label="Minutes before start"
          />
          <span className="text-sm text-muted-foreground">min before</span>
        </div>
      )}
    </div>
  );
}
