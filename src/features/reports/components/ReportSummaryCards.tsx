import { Card, CardContent } from "@/components/ui/card";
import { formatDurationMinutes } from "@/lib/datetime/time";
import type { ReportSummary } from "@/types/reports";

export function ReportSummaryCards({ summary }: { summary: ReportSummary }) {
  const diffLabel = summary.plannedVsActualDiffMinutes === 0 ? "On plan" : summary.plannedVsActualDiffMinutes > 0 ? "Under plan" : "Over plan";

  const stats = [
    { label: "Planned time", value: formatDurationMinutes(summary.totalPlannedMinutes) },
    { label: "Actual time", value: formatDurationMinutes(summary.totalActualMinutes) },
    { label: "Completion rate", value: `${summary.completionRate}%` },
    { label: "Completed", value: summary.completedCount },
    { label: "Skipped", value: summary.skippedCount },
    { label: "Adjusted", value: summary.adjustedCount },
    { label: "Missed", value: summary.missedCount },
    { label: "Planned vs actual", value: `${formatDurationMinutes(Math.abs(summary.plannedVsActualDiffMinutes))} ${diffLabel}` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-lg font-semibold">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
