import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDurationMinutes, minutesBetween } from "@/lib/datetime/time";
import type { ScheduleDayItem } from "@/types/schedule";

interface CategorySlice {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  minutes: number;
}

function aggregateByCategory(items: ScheduleDayItem[]): CategorySlice[] {
  const byCategory = new Map<string, CategorySlice>();

  for (const item of items) {
    // Timeless items have no fixed slot, so there's no duration to attribute to a slice.
    if (!item.startTime || !item.endTime) continue;
    const minutes = minutesBetween(item.startTime, item.endTime);
    const existing = byCategory.get(item.categoryId);
    if (existing) {
      existing.minutes += minutes;
    } else {
      byCategory.set(item.categoryId, {
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        categoryColor: item.categoryColor,
        minutes,
      });
    }
  }

  return [...byCategory.values()].sort((a, b) => b.minutes - a.minutes);
}

const RADIUS = 40;
const STROKE_WIDTH = 12;
// Visual gap between adjacent ring segments, in the same 0-100 units as pathLength — keeps
// slices from bleeding into each other without needing real circumference/π math.
const GAP = 1.2;

/**
 * Today's scheduled time split by category (frontend-requirements 02/04's daily views). Ring
 * segments use each category's own color — same override CategoryBreakdownChart.tsx already
 * carries out from the dataviz skill's generic-palette guidance, for the same reason: these
 * colors are the user's own, already meaningful everywhere else in the app (badges, timeline
 * items), so consistency with the rest of the UI wins over a generated categorical order.
 * `pathLength="100"` on each circle turns the arc-length math into plain percentages instead of
 * real circumference/angle trig.
 */
export function CategoryTimeDonut({ items }: { items: ScheduleDayItem[] }) {
  const slices = aggregateByCategory(items);
  const totalMinutes = slices.reduce((sum, s) => sum + s.minutes, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Today&apos;s Time by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalMinutes === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing with a fixed time scheduled today yet.
          </p>
        ) : (
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <svg viewBox="0 0 100 100" className="h-36 w-36 -rotate-90" role="img" aria-label="Today's time by category">
                <circle
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="none"
                  stroke="var(--muted)"
                  strokeWidth={STROKE_WIDTH}
                />
                {(() => {
                  let cumulative = 0;
                  return slices.map((slice) => {
                    const sharePercent = (slice.minutes / totalMinutes) * 100;
                    const dash = Math.max(0, sharePercent - GAP);
                    const offset = -cumulative;
                    cumulative += sharePercent;
                    return (
                      <circle
                        key={slice.categoryId}
                        cx="50"
                        cy="50"
                        r={RADIUS}
                        fill="none"
                        stroke={slice.categoryColor}
                        strokeWidth={STROKE_WIDTH}
                        strokeLinecap="round"
                        pathLength={100}
                        strokeDasharray={`${dash} ${100 - dash}`}
                        strokeDashoffset={offset}
                      >
                        <title>{`${slice.categoryName}: ${formatDurationMinutes(slice.minutes)}`}</title>
                      </circle>
                    );
                  });
                })()}
              </svg>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-semibold tabular-nums">
                  {formatDurationMinutes(totalMinutes)}
                </span>
                <span className="text-[11px] text-muted-foreground">scheduled</span>
              </div>
            </div>

            <ul className="w-full min-w-0 space-y-1.5">
              {slices.map((slice) => (
                <li key={slice.categoryId} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: slice.categoryColor }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate">{slice.categoryName}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatDurationMinutes(slice.minutes)}
                  </span>
                  <span className="w-10 shrink-0 text-right tabular-nums text-xs text-muted-foreground">
                    {Math.round((slice.minutes / totalMinutes) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
