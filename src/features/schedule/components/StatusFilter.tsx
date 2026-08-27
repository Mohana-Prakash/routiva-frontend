"use client";

import { Button } from "@/components/ui/button";
import { TIMELINE_STATUS_PRESENTATION } from "./timelineStatusPresentation";
import type { TimelineDisplayStatus } from "@/types/activity-log";

const STATUS_FILTER_ORDER: TimelineDisplayStatus[] = [
  "CURRENT",
  "UPCOMING",
  "COMPLETED",
  "MISSED",
  "SKIPPED",
  "ADJUSTED",
  "CANCELLED",
];

interface StatusFilterProps {
  value: TimelineDisplayStatus[];
  onChange: (next: TimelineDisplayStatus[]) => void;
}

/** Filter the Daily View down to one or more statuses (frontend-requirements 02 §4 statuses),
 * chip-toggle pattern matching DateRangePicker's preset row for consistency. */
export function StatusFilter({ value, onChange }: StatusFilterProps) {
  function toggle(status: TimelineDisplayStatus) {
    onChange(
      value.includes(status)
        ? value.filter((s) => s !== status)
        : [...value, status],
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Filter by status">
      <Button
        type="button"
        size="sm"
        variant={value.length === 0 ? "default" : "outline"}
        onClick={() => onChange([])}
      >
        All
      </Button>
      {STATUS_FILTER_ORDER.map((status) => {
        const { label, icon: Icon } = TIMELINE_STATUS_PRESENTATION[status];
        const active = value.includes(status);
        return (
          <Button
            key={status}
            type="button"
            size="sm"
            variant={active ? "default" : "outline"}
            aria-pressed={active}
            onClick={() => toggle(status)}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
          </Button>
        );
      })}
    </div>
  );
}
