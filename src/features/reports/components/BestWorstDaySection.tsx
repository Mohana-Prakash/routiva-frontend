import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateLabel } from "@/lib/datetime/time";
import type { DailyTrendPoint } from "@/types/reports";

/** "Best day" / "lowest-completion day" (frontend-requirements 04 §8) — derived from the daily trend the chart already renders. */
export function BestWorstDaySection({ points }: { points: DailyTrendPoint[] }) {
  const withActivity = points.filter((p) => p.plannedMinutes > 0 || p.actualMinutes > 0);
  if (withActivity.length < 2) return null;

  const best = [...withActivity].sort((a, b) => b.completionPercentage - a.completionPercentage)[0];
  const worst = [...withActivity].sort((a, b) => a.completionPercentage - b.completionPercentage)[0];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Best Day</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {formatDateLabel(best.date)} · {best.completionPercentage}%
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Lowest-Completion Day</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {formatDateLabel(worst.date)} · {worst.completionPercentage}%
        </CardContent>
      </Card>
    </div>
  );
}
