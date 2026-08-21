import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDurationMinutes } from "@/lib/datetime/time";
import type { ActivityReportItem } from "@/types/reports";

/** Planned vs actual + consistency, per activity (frontend-requirements 04 §4-5). */
export function ActivityPerformanceList({ items }: { items: ActivityReportItem[] }) {
  const sorted = [...items].sort((a, b) => b.actualMinutes - a.actualMinutes);

  return (
    <ul className="space-y-2">
      {sorted.map((item) => (
        <li key={item.activityId}>
          <Card>
            <CardContent className="space-y-2 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{item.activityName}</p>
                <span className="text-xs text-muted-foreground">{item.categoryName}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Planned: {formatDurationMinutes(item.plannedMinutes)}</span>
                <span>Actual: {formatDurationMinutes(item.actualMinutes)}</span>
                <span>Achievement: {Math.round(item.achievementRate)}%</span>
              </div>
              <Progress value={Math.min(100, item.achievementRate)} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                Consistency: {item.consistencyCompletedSessions} / {item.consistencyTotalSessions} sessions ({Math.round(item.consistencyRate)}%)
              </p>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
