"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useWeekStartPreference } from "../hooks/useWeekStartPreference";
import type { WeekStartDay } from "@/types/user";

export function ScheduleDefaultsSettings() {
  const { weekStart, setWeekStart } = useWeekStartPreference();

  return (
    <div className="space-y-1.5">
      <Label htmlFor="week-start">Week starts on</Label>
      <Select value={weekStart} onValueChange={(v) => v && setWeekStart(v as WeekStartDay)} items={{ MONDAY: "Monday", SUNDAY: "Sunday" }}>
        <SelectTrigger id="week-start" className="w-full sm:w-64">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="MONDAY">Monday</SelectItem>
          <SelectItem value="SUNDAY">Sunday</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">Stored on this device only.</p>
    </div>
  );
}
