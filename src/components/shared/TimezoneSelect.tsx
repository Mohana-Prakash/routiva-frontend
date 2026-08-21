"use client";

import * as React from "react";
import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

function getSupportedTimezones(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return ["UTC"];
  }
}

export function guessBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

interface TimezoneSelectProps extends React.ComponentPropsWithoutRef<typeof SelectTrigger> {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function TimezoneSelect({ value, onValueChange, disabled, className, ...triggerProps }: TimezoneSelectProps) {
  const timezones = useMemo(() => getSupportedTimezones(), []);
  const items = useMemo(() => Object.fromEntries(timezones.map((tz) => [tz, tz.replace(/_/g, " ")])), [timezones]);

  return (
    <Select value={value} onValueChange={(next) => next && onValueChange(next)} disabled={disabled} items={items}>
      <SelectTrigger className={cn("w-full", className)} {...triggerProps}>
        <SelectValue placeholder="Select timezone" />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {timezones.map((tz) => (
          <SelectItem key={tz} value={tz}>
            {tz.replace(/_/g, " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
