import { Card, CardContent } from "@/components/ui/card";
import { formatDurationMinutes } from "@/lib/datetime/time";
import type { CategoryReportItem } from "@/types/reports";

/**
 * Time by category (frontend-requirements 04 §3). Each row labels its own value
 * directly rather than sharing a single axis — a shared numeric axis forced every
 * bar's height down to fit alongside cramped tick labels, which is what made this
 * feel congested. Bar length is relative to the largest category in range, and
 * each bar keeps the category's own color for consistency with badges elsewhere
 * in the app (see CategoryPerformanceList below, which already breaks this same
 * override out from the dataviz skill's generic-palette guidance).
 */
export function CategoryBreakdownChart({ items }: { items: CategoryReportItem[] }) {
  const data = [...items].sort((a, b) => b.actualMinutes - a.actualMinutes);
  const maxMinutes = Math.max(...data.map((item) => item.actualMinutes), 1);

  return (
    <Card>
      <CardContent className="space-y-5 p-4">
        {data.map((item) => (
          <div key={item.categoryId} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.categoryColor }}
                  aria-hidden="true"
                />
                <span className="truncate text-sm font-medium">{item.categoryName}</span>
              </div>
              <span className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
                {formatDurationMinutes(item.actualMinutes)}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-[width]"
                style={{
                  width: `${Math.max(3, (item.actualMinutes / maxMinutes) * 100)}%`,
                  backgroundColor: item.categoryColor,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
