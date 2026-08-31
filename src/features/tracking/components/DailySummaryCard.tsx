import type { ComponentType } from "react";
import { CheckCircle2, Loader2, Clock, XCircle, AlertTriangle, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDurationMinutes } from "@/lib/datetime/time";
import type { DailySummary } from "@/types/activity-log";

interface StatChip {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  colorClass: string;
}

export function DailySummaryCard({ summary }: { summary: DailySummary }) {
  const stats: StatChip[] = [
    { label: "Completed", value: summary.completedCount, icon: CheckCircle2, colorClass: "text-chart-2 bg-chart-2/12" },
    { label: "Current", value: summary.currentCount, icon: Loader2, colorClass: "text-primary bg-primary/12" },
    { label: "Upcoming", value: summary.upcomingCount, icon: Clock, colorClass: "text-chart-3 bg-chart-3/15" },
    { label: "Skipped", value: summary.skippedCount, icon: XCircle, colorClass: "text-muted-foreground bg-muted" },
    { label: "Missed", value: summary.missedCount, icon: AlertTriangle, colorClass: "text-chart-4 bg-chart-4/12" },
    { label: "Adjusted", value: summary.adjustedCount, icon: Pencil, colorClass: "text-chart-5 bg-chart-5/12" },
  ];

  const plannedVsActualPercent =
    summary.plannedDurationMinutes > 0
      ? Math.round((summary.actualDurationMinutes / summary.plannedDurationMinutes) * 100)
      : summary.actualDurationMinutes > 0
        ? 100
        : 0;
  const diffMinutes = summary.actualDurationMinutes - summary.plannedDurationMinutes;
  const diffLabel = diffMinutes === 0 ? "On plan" : diffMinutes > 0 ? "Over plan" : "Under plan";

  return (
    <Card className="overflow-hidden py-0">
      <div className="flex items-center justify-between gap-2 bg-primary/10 px-4 py-3">
        <p className="text-sm font-medium text-foreground">Today&apos;s Summary</p>
        <span className="shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          {summary.completionPercentage}% complete
        </span>
      </div>

      <CardContent className="space-y-4 p-4">
        <div className="grid grid-cols-3 gap-2.5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1.5 rounded-xl bg-secondary/50 px-2 py-3 text-center"
            >
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-full", stat.colorClass)}>
                <stat.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="text-lg font-semibold leading-none">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-1.5 rounded-xl bg-secondary/40 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Planned vs Actual</span>
            <span className="font-medium">
              {formatDurationMinutes(summary.actualDurationMinutes)} / {formatDurationMinutes(summary.plannedDurationMinutes)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-background">
            <div
              className={cn("h-full rounded-full transition-[width]", diffMinutes > 0 ? "bg-chart-4" : "bg-primary")}
              style={{ width: `${Math.min(100, plannedVsActualPercent)}%` }}
            />
          </div>
          {diffMinutes !== 0 && (
            <p className="text-xs text-muted-foreground">
              {formatDurationMinutes(Math.abs(diffMinutes))} {diffLabel.toLowerCase()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
