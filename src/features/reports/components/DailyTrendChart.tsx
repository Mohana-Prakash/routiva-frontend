"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";
import type { DailyTrendPoint } from "@/types/reports";

/** Daily completion trend (frontend-requirements 04 §6-7) — a single series, so no legend needed. */
export function DailyTrendChart({ points }: { points: DailyTrendPoint[] }) {
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <LineChart data={points} margin={{ left: 0, right: 16, top: 8, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => format(parseISO(d), "MMM d")}
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis
            dataKey="completionPercentage"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            labelFormatter={(label) => (typeof label === "string" ? format(parseISO(label), "EEEE, MMM d") : label)}
            formatter={(value) => [`${value}%`, "Completion"]}
            contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
          />
          <Line type="monotone" dataKey="completionPercentage" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
