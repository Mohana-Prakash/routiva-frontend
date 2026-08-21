"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDurationMinutes } from "@/lib/datetime/time";
import type { CategoryReportItem } from "@/types/reports";

/**
 * Time by category (frontend-requirements 04 §3). Each bar uses the category's
 * own color for consistency with badges elsewhere in the app, rather than a
 * generic chart palette — see dataviz skill guidance on categorical color, which
 * this project intentionally overrides in favor of per-category brand colors the
 * user already recognizes from the timeline and activity list.
 */
export function CategoryBreakdownChart({ items }: { items: CategoryReportItem[] }) {
  const data = [...items].sort((a, b) => b.actualMinutes - a.actualMinutes);
  const height = Math.max(160, data.length * 36 + 24);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }} barCategoryGap={10}>
          <XAxis type="number" tickFormatter={(v) => formatDurationMinutes(v)} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="categoryName"
            width={88}
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            formatter={(value) => formatDurationMinutes(Number(value ?? 0))}
            contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          />
          <Bar dataKey="actualMinutes" radius={[0, 4, 4, 0]} maxBarSize={20} isAnimationActive={false}>
            {data.map((item) => (
              <Cell key={item.categoryId} fill={item.categoryColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
