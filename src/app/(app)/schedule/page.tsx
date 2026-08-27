"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterX } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { DailyTimeline } from "@/features/schedule/components/DailyTimeline";
import { DayNavigator } from "@/features/schedule/components/DayNavigator";
import { StatusFilter } from "@/features/schedule/components/StatusFilter";
import { ScheduleEntryList } from "@/features/schedule/components/ScheduleEntryList";
import { AdHocActivityDialog } from "@/features/schedule/components/AdHocActivityDialog";
import { useDaySchedule, useTodayDateString } from "@/features/schedule/hooks/useDaySchedule";
import { useAuth } from "@/features/auth/AuthProvider";
import { nowTimeInTimeZone } from "@/lib/datetime/time";
import { getTimelineDisplayStatus } from "@/features/schedule/lib/timelineStatus";
import type { TimelineDisplayStatus } from "@/types/activity-log";

export default function SchedulePage() {
  const { user } = useAuth();
  const timezone = user?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const todayDate = useTodayDateString();
  const [date, setDate] = useState(todayDate);
  const [adHocOpen, setAdHocOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TimelineDisplayStatus[]>([]);
  const { data, isLoading, isError, error, refetch } = useDaySchedule(date);
  const nowTime = date === todayDate ? nowTimeInTimeZone(timezone) : "00:00";
  const filteredItems =
    statusFilter.length === 0 || !data?.items
      ? data?.items
      : data.items.filter((item) => statusFilter.includes(getTimelineDisplayStatus(item, nowTime)));
  const hidesEverything = !!data?.items.length && filteredItems?.length === 0;

  // Supports deep-linking here from the Edit Activity dialog's "Manage schedule" link
  // (?tab=base&activityId=...) — synced via effect rather than derived inline so navigating
  // here again with a new activityId while already mounted on this page still picks it up.
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") === "base" ? "base" : "daily");
  const highlightActivityId = searchParams.get("activityId");
  useEffect(() => {
    setTab(searchParams.get("tab") === "base" ? "base" : "daily");
  }, [searchParams]);

  // Once ScheduleEntryList has acted on the deep-linked activityId (matched or not), drop it
  // from the URL — otherwise it's still there the next time the user switches back to this
  // tab (which remounts ScheduleEntryList) and the same toast/dialog fires again.
  function clearActivityDeepLink() {
    router.replace("/schedule?tab=base", { scroll: false });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
      <Tabs value={tab} onValueChange={(v) => v && setTab(v as string)}>
        <TabsList>
          <TabsTrigger value="daily">Daily View</TabsTrigger>
          <TabsTrigger value="base">Base Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <DayNavigator date={date} todayDate={todayDate} onChange={setDate} />
            <Button size="sm" onClick={() => setAdHocOpen(true)}>
              + Add Activity
            </Button>
          </div>
          {!isLoading && !isError && !!data?.items.length && (
            <StatusFilter value={statusFilter} onChange={setStatusFilter} />
          )}
          {hidesEverything ? (
            <EmptyState
              icon={FilterX}
              title="No activities match this filter"
              description="Try a different status, or clear the filter to see everything."
              actionLabel="Clear filter"
              onAction={() => setStatusFilter([])}
            />
          ) : (
            <DailyTimeline
              items={filteredItems}
              isLoading={isLoading}
              isError={isError}
              error={error}
              onRetry={() => refetch()}
              nowTime={nowTime}
              date={date}
              timezone={timezone}
              emptyAction={{ label: "+ Add Activity", onAction: () => setAdHocOpen(true) }}
            />
          )}
        </TabsContent>

        <TabsContent value="base" className="mt-4">
          <ScheduleEntryList
            autoEditActivityId={tab === "base" ? highlightActivityId : null}
            onAutoEditHandled={clearActivityDeepLink}
          />
        </TabsContent>
      </Tabs>

      <AdHocActivityDialog open={adHocOpen} onOpenChange={setAdHocOpen} date={date} />
    </div>
  );
}
