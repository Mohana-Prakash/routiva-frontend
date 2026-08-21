import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityReportItem } from "@/types/reports";

interface TopActivitiesSectionProps {
  items: ActivityReportItem[];
}

/**
 * "Most consistent activities" / "most skipped activities" (frontend-requirements
 * 04 §7-8) — a client-side sort of the already-fetched /reports/activities
 * response, not a separate calculation duplicated from the backend.
 */
export function TopActivitiesSection({ items }: TopActivitiesSectionProps) {
  const withSessions = items.filter((item) => item.consistencyTotalSessions > 0);
  const mostConsistent = [...withSessions].sort((a, b) => b.consistencyRate - a.consistencyRate).slice(0, 3);
  const mostSkipped = [...items]
    .filter((item) => item.skippedSessions > 0)
    .sort((a, b) => b.skippedSessions - a.skippedSessions)
    .slice(0, 3);

  if (mostConsistent.length === 0 && mostSkipped.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {mostConsistent.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Consistent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            {mostConsistent.map((item) => (
              <div key={item.activityId} className="flex justify-between">
                <span>{item.activityName}</span>
                <span className="text-muted-foreground">{Math.round(item.consistencyRate)}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {mostSkipped.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Skipped</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            {mostSkipped.map((item) => (
              <div key={item.activityId} className="flex justify-between">
                <span>{item.activityName}</span>
                <span className="text-muted-foreground">{item.skippedSessions}x</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
