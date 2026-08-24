import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDurationMinutes } from "@/lib/datetime/time";
import type { CategoryReportItem } from "@/types/reports";

/** Detailed per-category breakdown alongside the time chart: planned vs actual and completion rate. */
export function CategoryPerformanceList({ items }: { items: CategoryReportItem[] }) {
  const sorted = [...items].sort((a, b) => b.actualMinutes - a.actualMinutes);

  return (
    <ul className="space-y-2">
      {sorted.map((item) => (
        <li key={item.categoryId}>
          <Card>
            <CardContent className="space-y-2 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.categoryColor }}
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium">{item.categoryName}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">{Math.round(item.completionRate)}% complete</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                <span>Planned: {formatDurationMinutes(item.plannedMinutes)}</span>
                <span>Actual: {formatDurationMinutes(item.actualMinutes)}</span>
              </div>
              <Progress value={Math.min(100, item.completionRate)} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">
                {item.completedCount} / {item.totalCount} activities completed
              </p>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
