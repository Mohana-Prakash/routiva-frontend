"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DATE_RANGE_PRESETS, resolveDateRangePreset, type DateRange, type DateRangePresetKey } from "@/features/reports/lib/dateRangePresets";
import type { WeekStartDay } from "@/types/user";

interface DateRangePickerProps {
  preset: DateRangePresetKey;
  range: DateRange;
  weekStart: WeekStartDay;
  today: Date;
  onChange: (preset: DateRangePresetKey, range: DateRange) => void;
}

/** frontend-requirements 04 §1, §9 — easy on desktop and mobile, no hard-coded week/month assumptions. */
export function DateRangePicker({ preset, range, weekStart, today, onChange }: DateRangePickerProps) {
  function selectPreset(key: Exclude<DateRangePresetKey, "CUSTOM">) {
    onChange(key, resolveDateRangePreset(key, today, weekStart));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Date range preset">
        {DATE_RANGE_PRESETS.map((option) => (
          <Button
            key={option.key}
            type="button"
            size="sm"
            variant={preset === option.key ? "default" : "outline"}
            onClick={() => selectPreset(option.key)}
          >
            {option.label}
          </Button>
        ))}
        <Button type="button" size="sm" variant={preset === "CUSTOM" ? "default" : "outline"} onClick={() => onChange("CUSTOM", range)}>
          Custom
        </Button>
      </div>

      <div className={cn("grid grid-cols-2 gap-3 sm:w-72", preset !== "CUSTOM" && "opacity-60")}>
        <div className="space-y-1">
          <Label htmlFor="range-from">From</Label>
          <Input
            id="range-from"
            type="date"
            value={range.from}
            max={range.to}
            disabled={preset !== "CUSTOM"}
            onChange={(e) => onChange("CUSTOM", { ...range, from: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="range-to">To</Label>
          <Input
            id="range-to"
            type="date"
            value={range.to}
            min={range.from}
            disabled={preset !== "CUSTOM"}
            onChange={(e) => onChange("CUSTOM", { ...range, to: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
