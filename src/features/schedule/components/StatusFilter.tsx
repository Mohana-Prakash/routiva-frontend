"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
 * as a compact checkbox dropdown rather than a permanently-visible row of chips. */
export function StatusFilter({ value, onChange }: StatusFilterProps) {
  function setChecked(status: TimelineDisplayStatus, checked: boolean) {
    onChange(checked ? [...value, status] : value.filter((s) => s !== status));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm">
            <Filter className="h-3.5 w-3.5" aria-hidden="true" />
            {value.length === 0 ? "Filter" : `Filter (${value.length})`}
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {STATUS_FILTER_ORDER.map((status) => {
          const { label, icon: Icon } = TIMELINE_STATUS_PRESENTATION[status];
          return (
            <DropdownMenuCheckboxItem
              key={status}
              checked={value.includes(status)}
              onCheckedChange={(checked) => setChecked(status, checked)}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </DropdownMenuCheckboxItem>
          );
        })}
        {value.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onChange([])}>Clear filter</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
