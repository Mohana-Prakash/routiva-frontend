"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useWeekStartPreference } from "../hooks/useWeekStartPreference";
import type { WeekStartDay } from "@/types/user";

export function ScheduleDefaultsSettings() {
  const { weekStart, setWeekStart } = useWeekStartPreference();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Schedule</CardTitle>
        <CardDescription>Stored on this device only.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1.5">
        <Label htmlFor="week-start">Week starts on</Label>
        <Select value={weekStart} onValueChange={(v) => v && setWeekStart(v as WeekStartDay)} items={{ MONDAY: "Monday", SUNDAY: "Sunday" }}>
          <SelectTrigger id="week-start" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MONDAY">Monday</SelectItem>
            <SelectItem value="SUNDAY">Sunday</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
