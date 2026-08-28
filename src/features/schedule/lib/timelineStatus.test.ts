import { describe, expect, it } from "vitest";
import { getTimelineDisplayStatus } from "./timelineStatus";
import type { ScheduleDayItem } from "@/types/schedule";
import type { ActivityLog, ActivityLogStatus } from "@/types/activity-log";

function makeItem(startTime: string, endTime: string, status: ActivityLogStatus | undefined): ScheduleDayItem {
  const activityLog: ActivityLog | null = status
    ? {
        id: "log-1",
        userId: "u1",
        activityId: "a1",
        scheduleEntryId: "se1",
        exceptionId: null,
        activityDate: "2026-08-21",
        plannedStart: null,
        plannedEnd: null,
        actualStart: null,
        actualEnd: null,
        status,
        notes: null,
        createdAt: "",
        updatedAt: "",
        completedAt: null,
      }
    : null;

  return {
    id: "item-1",
    date: "2026-08-21",
    activityId: "a1",
    activityName: "Meditation",
    categoryId: "c1",
    categoryName: "Spiritual",
    categoryColor: "#6366F1",
    categoryIcon: "sparkles",
    startTime,
    endTime,
    source: "BASE",
    scheduleEntryId: "se1",
    exceptionId: null,
    alarmEnabled: false,
    alarmOffsetMinutes: null,
    reminderAt: null,
    notes: null,
    hasConflict: false,
    conflictsWithIds: [],
    activityLog,
  };
}

describe("getTimelineDisplayStatus", () => {
  it("maps a tracked status directly, regardless of wall-clock time", () => {
    expect(getTimelineDisplayStatus(makeItem("06:00", "06:30", "COMPLETED"), "12:00")).toBe("COMPLETED");
    expect(getTimelineDisplayStatus(makeItem("06:00", "06:30", "SKIPPED"), "12:00")).toBe("SKIPPED");
    expect(getTimelineDisplayStatus(makeItem("06:00", "06:30", "CANCELLED"), "12:00")).toBe("CANCELLED");
    expect(getTimelineDisplayStatus(makeItem("06:00", "06:30", "ADJUSTED"), "12:00")).toBe("ADJUSTED");
    expect(getTimelineDisplayStatus(makeItem("06:00", "06:30", "MISSED"), "12:00")).toBe("MISSED");
  });

  it("treats IN_PROGRESS as current regardless of the planned window", () => {
    expect(getTimelineDisplayStatus(makeItem("06:00", "06:30", "IN_PROGRESS"), "23:00")).toBe("CURRENT");
  });

  it("derives current vs upcoming from the clock when still PLANNED", () => {
    expect(getTimelineDisplayStatus(makeItem("18:00", "18:30", "PLANNED"), "18:15")).toBe("CURRENT");
    expect(getTimelineDisplayStatus(makeItem("18:00", "18:30", "PLANNED"), "17:00")).toBe("UPCOMING");
  });

  it("shows MISSED as soon as the window closes on a still-PLANNED item, without waiting for the backend's own sweep", () => {
    expect(getTimelineDisplayStatus(makeItem("18:00", "18:30", "PLANNED"), "18:30")).toBe("MISSED");
    expect(getTimelineDisplayStatus(makeItem("18:44", "18:46", "PLANNED"), "18:48")).toBe("MISSED");
  });

  it("treats a missing log the same as PLANNED, including going straight to MISSED once its window closes", () => {
    expect(getTimelineDisplayStatus(makeItem("18:00", "18:30", undefined), "18:15")).toBe("CURRENT");
    expect(getTimelineDisplayStatus(makeItem("18:00", "18:30", undefined), "09:00")).toBe("UPCOMING");
    expect(getTimelineDisplayStatus(makeItem("18:00", "18:30", undefined), "19:00")).toBe("MISSED");
  });

  it("handles a midnight-crossing planned item", () => {
    expect(getTimelineDisplayStatus(makeItem("22:30", "06:00", "PLANNED"), "23:45")).toBe("CURRENT");
    expect(getTimelineDisplayStatus(makeItem("22:30", "06:00", "PLANNED"), "12:00")).toBe("UPCOMING");
  });
});
