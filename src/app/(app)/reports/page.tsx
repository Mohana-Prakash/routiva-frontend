"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingSkeleton, LoadingSkeletonList } from "@/components/shared/LoadingSkeleton";
import { ReportSummaryCards } from "@/features/reports/components/ReportSummaryCards";
import { CategoryBreakdownChart } from "@/features/reports/components/CategoryBreakdownChart";
import { CategoryPerformanceList } from "@/features/reports/components/CategoryPerformanceList";
import { ActivityPerformanceList } from "@/features/reports/components/ActivityPerformanceList";
import { DailyTrendChart } from "@/features/reports/components/DailyTrendChart";
import { TopActivitiesSection } from "@/features/reports/components/TopActivitiesSection";
import { BestWorstDaySection } from "@/features/reports/components/BestWorstDaySection";
import { useActivityReport, useCategoryReport, useDailyTrendReport, useReportSummary } from "@/features/reports/hooks/useReports";
import { resolveDateRangePreset, type DateRange, type DateRangePresetKey } from "@/features/reports/lib/dateRangePresets";
import { useWeekStartPreference } from "@/features/settings/hooks/useWeekStartPreference";
import { useTodayDateString } from "@/features/schedule/hooks/useDaySchedule";

export default function ReportsPage() {
  const { weekStart } = useWeekStartPreference();
  const todayDate = useTodayDateString();
  const today = new Date(`${todayDate}T00:00:00`);

  const [preset, setPreset] = useState<DateRangePresetKey>("THIS_WEEK");
  const [range, setRange] = useState<DateRange>(() => resolveDateRangePreset("THIS_WEEK", today, weekStart));

  function handleRangeChange(nextPreset: DateRangePresetKey, nextRange: DateRange) {
    setPreset(nextPreset);
    setRange(nextRange);
  }

  const summary = useReportSummary(range);
  const categories = useCategoryReport(range);
  const activities = useActivityReport(range);
  const dailyTrend = useDailyTrendReport(range);

  const isRangeValid = range.from <= range.to;
  const hasAnyData = summary.data
    ? summary.data.totalPlannedMinutes > 0 || summary.data.completedCount + summary.data.skippedCount + summary.data.missedCount + summary.data.adjustedCount > 0
    : false;

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 md:p-6">
      <DateRangePicker preset={preset} range={range} weekStart={weekStart} today={today} onChange={handleRangeChange} />

      {!isRangeValid ? (
        <ErrorState title="The 'From' date must be before the 'To' date." />
      ) : summary.isLoading ? (
        <LoadingSkeletonList count={4} />
      ) : summary.isError ? (
        <ErrorState error={summary.error} onRetry={() => summary.refetch()} />
      ) : !hasAnyData ? (
        <EmptyState
          icon={BarChart3}
          title="No activity data yet"
          description="Complete a few activities and your report will appear here."
        />
      ) : (
        <>
          {summary.data && <ReportSummaryCards summary={summary.data} />}

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">By Category</h2>
            {categories.isLoading ? (
              <LoadingSkeleton className="h-40 w-full" />
            ) : categories.isError ? (
              <ErrorState error={categories.error} onRetry={() => categories.refetch()} />
            ) : categories.data && categories.data.length > 0 ? (
              <>
                <CategoryBreakdownChart items={categories.data} />
                <CategoryPerformanceList items={categories.data} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No category data for this range.</p>
            )}
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">Daily Trend</h2>
            {dailyTrend.isLoading ? (
              <LoadingSkeleton className="h-56 w-full" />
            ) : dailyTrend.isError ? (
              <ErrorState error={dailyTrend.error} onRetry={() => dailyTrend.refetch()} />
            ) : dailyTrend.data && dailyTrend.data.points.length > 0 ? (
              <>
                <DailyTrendChart points={dailyTrend.data.points} />
                <BestWorstDaySection points={dailyTrend.data.points} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No daily data for this range.</p>
            )}
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">Planned vs Actual & Consistency</h2>
            {activities.isLoading ? (
              <LoadingSkeletonList count={3} />
            ) : activities.isError ? (
              <ErrorState error={activities.error} onRetry={() => activities.refetch()} />
            ) : activities.data && activities.data.length > 0 ? (
              <>
                <TopActivitiesSection items={activities.data} />
                <ActivityPerformanceList items={activities.data} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No activity data for this range.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
