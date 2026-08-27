import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimelineItem } from "./TimelineItem";
import { renderWithQueryClient } from "@/test/renderWithQueryClient";
import { trackingApi } from "@/lib/api/tracking";
import type { ScheduleDayItem } from "@/types/schedule";

vi.mock("@/lib/api/tracking", () => ({
  trackingApi: {
    start: vi.fn(),
    complete: vi.fn(),
    skip: vi.fn(),
  },
}));

// Start/Complete/Skip are now gated on both a lower bound (startTime arrived) and an upper
// bound (endTime not yet passed) relative to the real wall clock. Rather than mocking the
// clock (which fights userEvent's own timers), these offsets are computed from the actual
// current UTC time so "arrived but not ended" and "ended" are both deterministic regardless
// of when the suite runs — matching timezone="UTC" used in every render below.
function pad(n: number) {
  return String(n).padStart(2, "0");
}
function hhmm(d: Date) {
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}
const now = new Date();
const TODAY = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
const ARRIVED_START = hhmm(new Date(now.getTime() - 5 * 60_000)); // 5 min ago
const NOT_ENDED_END = hhmm(new Date(now.getTime() + 55 * 60_000)); // 55 min from now
const ENDED_START = hhmm(new Date(now.getTime() - 60 * 60_000)); // 1h ago
const ENDED_END = hhmm(new Date(now.getTime() - 1 * 60_000)); // 1 min ago
const NOT_ARRIVED_START = hhmm(new Date(now.getTime() + 60 * 60_000)); // 1h from now
const NOT_ARRIVED_END = hhmm(new Date(now.getTime() + 120 * 60_000)); // 2h from now

const plannedItem: ScheduleDayItem = {
  id: "item-1",
  date: TODAY,
  activityId: "a1",
  activityName: "Meditation",
  categoryId: "c1",
  categoryName: "Spiritual",
  categoryColor: "#6366F1",
  categoryIcon: "sparkles",
  startTime: ARRIVED_START,
  endTime: NOT_ENDED_END,
  source: "BASE",
  scheduleEntryId: "se1",
  exceptionId: null,
  alarmEnabled: false,
  alarmOffsetMinutes: null,
  reminderAt: null,
  notes: null,
  hasConflict: false,
  conflictsWithIds: [],
  activityLog: {
    id: "log-1",
    userId: "u1",
    activityId: "a1",
    scheduleEntryId: "se1",
    exceptionId: null,
    activityDate: TODAY,
    plannedStart: null,
    plannedEnd: null,
    actualStart: null,
    actualEnd: null,
    status: "PLANNED",
    notes: null,
    createdAt: "",
    updatedAt: "",
    completedAt: null,
  },
};

describe("TimelineItem", () => {
  beforeEach(() => {
    vi.mocked(trackingApi.complete).mockReset().mockResolvedValue({} as never);
    vi.mocked(trackingApi.skip).mockReset().mockResolvedValue({} as never);
    vi.mocked(trackingApi.start).mockReset().mockResolvedValue({} as never);
  });

  it("shows Start/Complete/Skip for a planned activity and calls the right API on each", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <TimelineItem item={plannedItem} nowTime="18:15" date={TODAY} timezone="UTC" onSelect={() => {}} />,
    );

    expect(screen.getByText("Meditation")).toBeInTheDocument();

    // Complete opens a "how long did you actually spend on this" prompt rather than
    // completing immediately — confirming it with the default (full planned duration) is
    // what calls the API.
    await user.click(screen.getByRole("button", { name: "Complete" }));
    await user.click(await screen.findByRole("button", { name: "Mark Complete" }));
    await waitFor(() => expect(trackingApi.complete).toHaveBeenCalled());
    const [completedLogId, completeInput] = vi.mocked(trackingApi.complete).mock.calls[0]!;
    expect(completedLogId).toBe("log-1");
    expect(completeInput?.actualStart).toBeTruthy();
    expect(completeInput?.actualEnd).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Skip" }));
    await waitFor(() => expect(trackingApi.skip).toHaveBeenCalledWith("log-1"));
  });

  it('shows "End" instead of "Complete" once the activity is in progress', () => {
    const inProgressItem: ScheduleDayItem = {
      ...plannedItem,
      activityLog: { ...plannedItem.activityLog!, status: "IN_PROGRESS", actualStart: new Date().toISOString() },
    };
    renderWithQueryClient(
      <TimelineItem item={inProgressItem} nowTime="18:15" date={TODAY} timezone="UTC" onSelect={() => {}} />,
    );

    expect(screen.getByRole("button", { name: "End" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Complete" })).not.toBeInTheDocument();
  });

  it("calls onSelect with the item when the card body is activated, not when an action button is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithQueryClient(
      <TimelineItem item={plannedItem} nowTime="18:15" date={TODAY} timezone="UTC" onSelect={onSelect} />,
    );

    await user.click(screen.getByRole("button", { name: "Skip" }));
    expect(onSelect).not.toHaveBeenCalled();

    await user.click(screen.getByText("Meditation"));
    expect(onSelect).toHaveBeenCalledWith(plannedItem);
  });

  it("does not show tracking actions for a completed activity, and shows its actual duration", () => {
    const completedItem: ScheduleDayItem = {
      ...plannedItem,
      activityLog: {
        ...plannedItem.activityLog!,
        status: "COMPLETED",
        actualStart: "2020-01-01T18:02:00Z",
        actualEnd: "2020-01-01T18:29:00Z",
      },
    };
    renderWithQueryClient(
      <TimelineItem item={completedItem} nowTime="19:00" date={TODAY} timezone="UTC" onSelect={() => {}} />,
    );

    expect(screen.queryByRole("button", { name: "Start" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Complete" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "End" })).not.toBeInTheDocument();
    expect(screen.getByText(/Actual: 27m/)).toBeInTheDocument();
  });

  it("hides Start and Complete until the scheduled time arrives, but keeps Skip available", () => {
    const futureItem: ScheduleDayItem = { ...plannedItem, startTime: NOT_ARRIVED_START, endTime: NOT_ARRIVED_END };
    renderWithQueryClient(
      <TimelineItem item={futureItem} nowTime="18:15" date={TODAY} timezone="UTC" onSelect={() => {}} />,
    );

    expect(screen.queryByRole("button", { name: "Start" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Complete" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skip" })).toBeInTheDocument();
  });

  it("keeps Start/Complete available once the scheduled end time has passed, but drops Skip for a still-PLANNED (never started) activity", () => {
    const overdueItem: ScheduleDayItem = { ...plannedItem, startTime: ENDED_START, endTime: ENDED_END };
    renderWithQueryClient(
      <TimelineItem item={overdueItem} nowTime="18:15" date={TODAY} timezone="UTC" onSelect={() => {}} />,
    );

    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Complete" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Skip" })).not.toBeInTheDocument();
  });

  it("drops Skip (but keeps End) once an in-progress activity's window has closed — skipping something you already started is meaningless", () => {
    const overdueInProgress: ScheduleDayItem = {
      ...plannedItem,
      startTime: ENDED_START,
      endTime: ENDED_END,
      activityLog: { ...plannedItem.activityLog!, status: "IN_PROGRESS", actualStart: new Date().toISOString() },
    };
    renderWithQueryClient(
      <TimelineItem item={overdueInProgress} nowTime="18:15" date={TODAY} timezone="UTC" onSelect={() => {}} />,
    );

    expect(screen.getByRole("button", { name: "End" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Skip" })).not.toBeInTheDocument();
  });

  it("still offers Complete and Skip (but not Start) once the backend has marked it Missed", () => {
    const missedItem: ScheduleDayItem = {
      ...plannedItem,
      startTime: ENDED_START,
      endTime: ENDED_END,
      activityLog: { ...plannedItem.activityLog!, status: "MISSED" },
    };
    renderWithQueryClient(
      <TimelineItem item={missedItem} nowTime="18:15" date={TODAY} timezone="UTC" onSelect={() => {}} />,
    );

    expect(screen.queryByRole("button", { name: "Start" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Complete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skip" })).toBeInTheDocument();
  });
});
