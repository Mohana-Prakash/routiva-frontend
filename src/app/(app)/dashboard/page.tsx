"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSkeletonList } from "@/components/shared/LoadingSkeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { GettingStartedChecklist } from "@/components/shared/GettingStartedChecklist";
import { AdHocActivityDialog } from "@/features/schedule/components/AdHocActivityDialog";
import { ActivityDetailSheet } from "@/features/schedule/components/ActivityDetailSheet";
import { CategoryTimeDonut } from "@/features/schedule/components/CategoryTimeDonut";
import { CurrentActivityCard } from "@/features/tracking/components/CurrentActivityCard";
import { NextActivityCard } from "@/features/tracking/components/NextActivityCard";
import { DailySummaryCard } from "@/features/tracking/components/DailySummaryCard";
import { useTodaySchedule } from "@/features/schedule/hooks/useDaySchedule";
import { computeDailySummary } from "@/features/schedule/lib/computeDailySummary";
import { getTimelineDisplayStatus } from "@/features/schedule/lib/timelineStatus";
import { useAuth } from "@/features/auth/AuthProvider";
import { useNow } from "@/hooks/useNow";
import { nowTimeInTimeZone, minutesUntil, todayInTimeZone } from "@/lib/datetime/time";
import type { ScheduleDayItem } from "@/types/schedule";

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
  const date = data?.date ?? todayInTimeZone(timezone);

  const current = useMemo(() => {
    if (!items) return undefined;
    // An activity you've actually tapped Start on always wins the slot. Otherwise, fall back to
    // whatever timed activity's planned window is active *right now* even if you never tapped
    // Start — previously this card only ever showed a truly IN_PROGRESS activity, so anything
    // still PLANNED just sat invisible until its window closed. Timeless items ("anytime today")
    // are deliberately excluded here — they're always "current" in that sense, which would just
    // permanently occupy this slot instead of reflecting what's actually happening right now.
    const inProgress = items.find((item) => item.activityLog?.status === "IN_PROGRESS");
    if (inProgress) return inProgress;
    const activeNow = items
      .filter((item) => item.startTime && item.endTime && getTimelineDisplayStatus(item, nowTime) === "CURRENT")
      .sort((a, b) => (a.startTime as string).localeCompare(b.startTime as string));
    return activeNow[0];
  }, [items, nowTime]);

  const next = useMemo(() => {
    if (!items) return undefined;
    // Timeless items have no "starts in X" to rank by, so they never compete for this slot.
    // Excludes whatever's already claimed the Current slot above, and anything not genuinely
    // still-upcoming (current/missed/resolved), so the two cards never show the same activity.
    const upcoming = items.filter(
      (item) =>
        item.id !== current?.id &&
        item.startTime &&
        item.endTime &&
        getTimelineDisplayStatus(item, nowTime) === "UPCOMING",
    );
    if (upcoming.length === 0) return undefined;
    return [...upcoming].sort(
      (a, b) => minutesUntil(a.startTime as string, nowTime) - minutesUntil(b.startTime as string, nowTime),
    )[0];
  }, [items, nowTime, current]);

  const summary = useMemo(() => (items ? computeDailySummary(data!.date, items) : undefined), [items, data]);

  // Set by the service worker's notification click handler (worker/index.js), which opens
  // "/dashboard?logId=<activityLogId>" (frontend-requirements 03 §6-7). The dashboard no longer
  // lists every activity, so this opens the detail sheet directly for whichever one the
  // notification was about, even if it isn't the current/next card shown above.
  const [deepLinkedItem, setDeepLinkedItem] = useState<ScheduleDayItem | null>(null);
  const consumedDeepLink = useRef(false);
  useEffect(() => {
    if (consumedDeepLink.current || !notificationLogId || !items) return;
    const match = items.find((item) => item.activityLog?.id === notificationLogId);
    if (!match) return;
    consumedDeepLink.current = true;
    setDeepLinkedItem(match);
  }, [notificationLogId, items]);

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

      <GettingStartedChecklist />

      {isLoading && <LoadingSkeletonList count={2} />}
      {isError && <ErrorState error={error} onRetry={() => refetch()} title="Unable to load today's schedule." />}

      {current && <CurrentActivityCard item={current} nowTime={nowTime} date={date} timezone={timezone} />}
      {next && <NextActivityCard item={next} nowTime={nowTime} />}
      {!isLoading && !isError && !current && !next && (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Nothing happening right now. Check the full schedule for what&apos;s planned today.
          </CardContent>
        </Card>
      )}
      {summary && <DailySummaryCard summary={summary} />}
      {items && items.length > 0 && <CategoryTimeDonut items={items} />}

      <Button
        variant="outline"
        className="w-full justify-between"
        nativeButton={false}
        render={<Link href="/schedule" />}
      >
        View full schedule
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>

      <AdHocActivityDialog open={adHocOpen} onOpenChange={setAdHocOpen} date={data?.date} />

      <ActivityDetailSheet
        item={deepLinkedItem}
        nowTime={nowTime}
        onOpenChange={(open) => !open && setDeepLinkedItem(null)}
      />
    </div>
  );
}
