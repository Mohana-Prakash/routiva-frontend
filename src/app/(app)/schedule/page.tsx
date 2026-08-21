"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DailyTimeline } from "@/features/schedule/components/DailyTimeline";
import { DayNavigator } from "@/features/schedule/components/DayNavigator";
import { ScheduleEntryList } from "@/features/schedule/components/ScheduleEntryList";
import { AdHocActivityDialog } from "@/features/schedule/components/AdHocActivityDialog";
import { useDaySchedule, useTodayDateString } from "@/features/schedule/hooks/useDaySchedule";
import { useAuth } from "@/features/auth/AuthProvider";
import { nowTimeInTimeZone } from "@/lib/datetime/time";

export default function SchedulePage() {
  const { user } = useAuth();
  const timezone = user?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const todayDate = useTodayDateString();
  const [date, setDate] = useState(todayDate);
  const [adHocOpen, setAdHocOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useDaySchedule(date);

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
      <Tabs defaultValue="daily">
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
          <DailyTimeline
            items={data?.items}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onRetry={() => refetch()}
            nowTime={date === todayDate ? nowTimeInTimeZone(timezone) : "00:00"}
            emptyAction={{ label: "+ Add Activity", onAction: () => setAdHocOpen(true) }}
          />
        </TabsContent>

        <TabsContent value="base" className="mt-4">
          <ScheduleEntryList />
        </TabsContent>
      </Tabs>

      <AdHocActivityDialog open={adHocOpen} onOpenChange={setAdHocOpen} date={date} />
    </div>
  );
}
