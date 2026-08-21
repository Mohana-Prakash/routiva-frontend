import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDurationMinutes } from "@/lib/datetime/time";
import type { DailySummary } from "@/types/activity-log";

export function DailySummaryCard({ summary }: { summary: DailySummary }) {
  const stats = [
    { label: "Completed", value: summary.completedCount },
    { label: "Upcoming", value: summary.upcomingCount },
    { label: "Skipped", value: summary.skippedCount },
    { label: "Adjusted", value: summary.adjustedCount },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-4 gap-2 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-lg font-semibold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t pt-3 text-sm">
          <span className="text-muted-foreground">Completion</span>
          <span className="font-medium">{summary.completionPercentage}%</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Planned vs Actual</span>
          <span className="font-medium">
            {formatDurationMinutes(summary.plannedDurationMinutes)} / {formatDurationMinutes(summary.actualDurationMinutes)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
