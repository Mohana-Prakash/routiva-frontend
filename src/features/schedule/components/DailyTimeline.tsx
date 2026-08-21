"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarClock } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeletonList } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { TimelineItem } from "./TimelineItem";
import { ActivityDetailSheet } from "./ActivityDetailSheet";
import type { ScheduleDayItem } from "@/types/schedule";

interface DailyTimelineProps {
  items: ScheduleDayItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry: () => void;
  nowTime: string;
  date: string;
  timezone: string;
  emptyAction?: { label: string; onAction: () => void };
  /**
   * Activity-log id to auto-open once loaded — used for notification-click
   * routing (frontend-requirements 03 §6-7: clicking a reminder should open the
   * dashboard with the relevant activity highlighted).
   */
  initialLogId?: string | null;
}

export function DailyTimeline({ items, isLoading, isError, error, onRetry, nowTime, date, timezone, emptyAction, initialLogId }: DailyTimelineProps) {
  const [selected, setSelected] = useState<ScheduleDayItem | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const consumedDeepLink = useRef(false);

  useEffect(() => {
    if (consumedDeepLink.current || !initialLogId || !items) return;
    const match = items.find((item) => item.activityLog?.id === initialLogId);
    if (!match) return;
    consumedDeepLink.current = true;
    setSelected(match);
    setHighlightedId(match.id);
  }, [initialLogId, items]);

  if (isLoading) return <LoadingSkeletonList count={5} />;
  if (isError) return <ErrorState error={error} onRetry={onRetry} title="Unable to load the schedule." />;
  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Your day is empty"
        description="Create your first activity to build your schedule."
        actionLabel={emptyAction?.label}
        onAction={emptyAction?.onAction}
      />
    );
  }

  const sorted = [...items].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <>
      <ul className="space-y-1">
        {sorted.map((item) => (
          <TimelineItem
            key={item.id}
            item={item}
            nowTime={nowTime}
            date={date}
            timezone={timezone}
            onSelect={setSelected}
            highlighted={item.id === highlightedId}
          />
        ))}
      </ul>
      <ActivityDetailSheet item={selected} nowTime={nowTime} onOpenChange={(open) => !open && setSelected(null)} />
    </>
  );
}
