import { describe, expect, it } from "vitest";
import { computeDailySummary } from "./computeDailySummary";
import type { ScheduleDayItem } from "@/types/schedule";
import type { ActivityLog } from "@/types/activity-log";

const DEFAULT_LOG: ActivityLog = {
  id: "log-1",
  userId: "user-1",
  activityId: "activity-1",
  scheduleEntryId: "entry-1",
  exceptionId: null,
  activityDate: "2026-08-21",
  plannedStart: null,
  plannedEnd: null,
  actualStart: null,
  actualEnd: null,
  status: "PLANNED",
  notes: null,
  createdAt: "2026-08-21T00:00:00Z",
  updatedAt: "2026-08-21T00:00:00Z",
  completedAt: null,
};

function makeItem(overrides: Omit<Partial<ScheduleDayItem>, "activityLog"> & { activityLog?: Partial<ActivityLog> | null }): ScheduleDayItem {
  const { activityLog: activityLogOverride, ...itemOverrides } = overrides;
  return {
    id: "item-1",
    date: "2026-08-21",
    activityId: "activity-1",
    activityName: "Meditation",
    categoryId: "cat-1",
    categoryName: "Spiritual",
    categoryColor: "#6366F1",
    categoryIcon: "sparkles",
    startTime: "18:00",
    endTime: "18:30",
    source: "BASE",
    scheduleEntryId: "entry-1",
    exceptionId: null,
    alarmEnabled: false,
    alarmOffsetMinutes: null,
    reminderAt: null,
    notes: null,
    hasConflict: false,
    conflictsWithIds: [],
    ...itemOverrides,
    activityLog: activityLogOverride ? { ...DEFAULT_LOG, ...activityLogOverride } : null,
  };
}

describe("computeDailySummary", () => {
  it("counts each status bucket correctly", () => {
    const items = [
      makeItem({ id: "1", activityLog: { status: "COMPLETED", actualStart: "2026-08-21T18:00:00Z", actualEnd: "2026-08-21T18:30:00Z" } }),
      makeItem({ id: "2", activityLog: { status: "SKIPPED" } }),
      makeItem({ id: "3", activityLog: { status: "MISSED" } }),
      makeItem({ id: "4", activityLog: { status: "ADJUSTED", actualStart: "2026-08-21T19:00:00Z", actualEnd: "2026-08-21T19:20:00Z" } }),
      makeItem({ id: "5", activityLog: null }),
    ];

    const summary = computeDailySummary("2026-08-21", items);

    expect(summary.completedCount).toBe(2); // COMPLETED + ADJUSTED
    expect(summary.skippedCount).toBe(1);
    expect(summary.missedCount).toBe(1);
    expect(summary.adjustedCount).toBe(1);
    expect(summary.upcomingCount).toBe(1);
    expect(summary.plannedDurationMinutes).toBe(150); // 5 items * 30 min
    expect(summary.actualDurationMinutes).toBe(50); // 30 + 20
  });

  it("computes completion percentage against tracked items only", () => {
    const items = [
      makeItem({ id: "1", activityLog: { status: "COMPLETED" } }),
      makeItem({ id: "2", activityLog: { status: "SKIPPED" } }),
      makeItem({ id: "3", activityLog: null }), // upcoming — excluded from the denominator
    ];

    const summary = computeDailySummary("2026-08-21", items);
    expect(summary.completionPercentage).toBe(50);
  });

  it("returns 0% completion with no tracked activities", () => {
    const items = [makeItem({ id: "1", activityLog: null })];
    expect(computeDailySummary("2026-08-21", items).completionPercentage).toBe(0);
  });
});
