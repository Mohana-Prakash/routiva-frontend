"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { Button } from "@/components/ui/button";
import { LoadingSkeletonList } from "@/components/shared/LoadingSkeleton";
import { DailyTimeline } from "@/features/schedule/components/DailyTimeline";
import { AdHocActivityDialog } from "@/features/schedule/components/AdHocActivityDialog";
import { CurrentActivityCard } from "@/features/tracking/components/CurrentActivityCard";
import { NextActivityCard } from "@/features/tracking/components/NextActivityCard";
import { DailySummaryCard } from "@/features/tracking/components/DailySummaryCard";
import { useTodaySchedule } from "@/features/schedule/hooks/useDaySchedule";
import { computeDailySummary } from "@/features/schedule/lib/computeDailySummary";
import { useAuth } from "@/features/auth/AuthProvider";
import { useNow } from "@/hooks/useNow";
import { nowTimeInTimeZone, minutesUntil, todayInTimeZone } from "@/lib/datetime/time";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-4 md:p-6"><LoadingSkeletonList count={4} /></div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const timezone = user?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = useNow();
  const nowTime = nowTimeInTimeZone(timezone);
  const [adHocOpen, setAdHocOpen] = useState(false);
  // Set by the service worker's notification click handler (worker/index.js),
  // which opens "/dashboard?logId=<activityLogId>" (frontend-requirements 03 §6-7).
  const notificationLogId = useSearchParams().get("logId");

  const { data, isLoading, isError, error, refetch } = useTodaySchedule();
  const items = data?.items;

  const current = useMemo(() => items?.find((item) => item.activityLog?.status === "IN_PROGRESS"), [items]);

  const next = useMemo(() => {
    // Timeless items have no "starts in X" to rank by, so they never compete for this slot —
    // they're always available and show up in the timeline instead.
    const upcoming =
      items?.filter(
        (item) => item.startTime && item.endTime && (!item.activityLog || item.activityLog.status === "PLANNED"),
      ) ?? [];
    if (upcoming.length === 0) return undefined;
    return [...upcoming].sort(
      (a, b) => minutesUntil(a.startTime as string, nowTime) - minutesUntil(b.startTime as string, nowTime),
    )[0];
  }, [items, nowTime]);

  const summary = useMemo(() => (items ? computeDailySummary(data!.date, items) : undefined), [items, data]);

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{formatInTimeZone(now, timezone, "EEEE, MMMM d")}</p>
          <p className="text-2xl font-semibold tabular-nums">{formatInTimeZone(now, timezone, "HH:mm")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/reports" />}>
            Today&apos;s Report
          </Button>
          <Button size="sm" onClick={() => setAdHocOpen(true)}>
            + Add Activity
          </Button>
        </div>
      </div>

      {current && <CurrentActivityCard item={current} nowTime={nowTime} />}
      {next && <NextActivityCard item={next} nowTime={nowTime} />}
      {summary && <DailySummaryCard summary={summary} />}

      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">Today&apos;s Timeline</h2>
        <DailyTimeline
          items={items}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
          nowTime={nowTime}
          date={data?.date ?? todayInTimeZone(timezone)}
          timezone={timezone}
          emptyAction={{ label: "+ Add Activity", onAction: () => setAdHocOpen(true) }}
          initialLogId={notificationLogId}
        />
      </div>

      <AdHocActivityDialog open={adHocOpen} onOpenChange={setAdHocOpen} date={data?.date} />
    </div>
  );
}
