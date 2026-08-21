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

const plannedItem: ScheduleDayItem = {
  id: "item-1",
  date: "2026-08-21",
  activityId: "a1",
  activityName: "Meditation",
  categoryId: "c1",
  categoryName: "Spiritual",
  categoryColor: "#6366F1",
  categoryIcon: "sparkles",
  startTime: "18:00",
  endTime: "18:30",
  source: "BASE",
  scheduleEntryId: "se1",
  exceptionId: null,
  alarmEnabled: false,
  alarmOffsetMinutes: null,
  notes: null,
  hasConflict: false,
  conflictsWithIds: [],
  activityLog: {
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
    renderWithQueryClient(<TimelineItem item={plannedItem} nowTime="18:15" onSelect={() => {}} />);

    expect(screen.getByText("Meditation")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Complete" }));
    await waitFor(() => expect(trackingApi.complete).toHaveBeenCalledWith("log-1"));

    await user.click(screen.getByRole("button", { name: "Skip" }));
    await waitFor(() => expect(trackingApi.skip).toHaveBeenCalledWith("log-1"));
  });

  it("calls onSelect with the item when the card body is activated, not when an action button is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithQueryClient(<TimelineItem item={plannedItem} nowTime="18:15" onSelect={onSelect} />);

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
        actualStart: "2026-08-21T18:02:00Z",
        actualEnd: "2026-08-21T18:29:00Z",
      },
    };
    renderWithQueryClient(<TimelineItem item={completedItem} nowTime="19:00" onSelect={() => {}} />);

    expect(screen.queryByRole("button", { name: "Start" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Complete" })).not.toBeInTheDocument();
    expect(screen.getByText(/Actual: 27m/)).toBeInTheDocument();
  });
});
