import { describe, expect, it } from "vitest";
import {
  combineDateAndEndTime,
  combineDateAndTime,
  formatDurationMinutes,
  isTimeNowAfterRange,
  isTimeNowWithinRange,
  isValidTimeString,
  minutesBetween,
  minutesUntil,
  timeRangesOverlap,
} from "./time";

describe("combineDateAndTime", () => {
  it("produces the correct UTC instant for a wall-clock time in a zone ahead of UTC", () => {
    // 18:00 in Asia/Kolkata (UTC+5:30) is 12:30 UTC.
    const result = combineDateAndTime("2026-08-21", "18:00", "Asia/Kolkata");
    expect(result.toISOString()).toBe("2026-08-21T12:30:00.000Z");
  });

  it("produces the correct UTC instant for a wall-clock time in a zone behind UTC", () => {
    // 09:00 in America/New_York (UTC-4 in August, DST) is 13:00 UTC.
    const result = combineDateAndTime("2026-08-21", "09:00", "America/New_York");
    expect(result.toISOString()).toBe("2026-08-21T13:00:00.000Z");
  });

  it("is a no-op shift for UTC itself", () => {
    const result = combineDateAndTime("2026-08-21", "18:00", "UTC");
    expect(result.toISOString()).toBe("2026-08-21T18:00:00.000Z");
  });
});

describe("combineDateAndEndTime", () => {
  it("stays on the same day for a normal (non-overnight) range", () => {
    const result = combineDateAndEndTime("2026-08-21", "18:00", "18:30", "UTC");
    expect(result.toISOString()).toBe("2026-08-21T18:30:00.000Z");
  });

  it("rolls onto the next day when the end time crosses midnight", () => {
    // e.g. a Sleep activity scheduled 22:00-03:55 — the end belongs to the following date.
    const result = combineDateAndEndTime("2026-08-21", "22:00", "03:55", "UTC");
    expect(result.toISOString()).toBe("2026-08-22T03:55:00.000Z");
  });

  it("treats an identical start/end as a full-day span rolling to the next day", () => {
    const result = combineDateAndEndTime("2026-08-21", "09:00", "09:00", "UTC");
    expect(result.toISOString()).toBe("2026-08-22T09:00:00.000Z");
  });

  it("rolls correctly across a month boundary", () => {
    const result = combineDateAndEndTime("2026-08-31", "23:00", "01:00", "UTC");
    expect(result.toISOString()).toBe("2026-09-01T01:00:00.000Z");
  });
});

describe("minutesBetween", () => {
  it("computes a same-day duration", () => {
    expect(minutesBetween("18:00", "18:30")).toBe(30);
  });

  it("treats end <= start as crossing midnight", () => {
    expect(minutesBetween("23:30", "00:30")).toBe(60);
  });

  it("treats an identical start/end as a full 24h span", () => {
    expect(minutesBetween("09:00", "09:00")).toBe(24 * 60);
  });
});

describe("formatDurationMinutes", () => {
  it("formats minutes only", () => {
    expect(formatDurationMinutes(45)).toBe("45m");
  });

  it("formats whole hours", () => {
    expect(formatDurationMinutes(120)).toBe("2h");
  });

  it("formats hours and minutes", () => {
    expect(formatDurationMinutes(90)).toBe("1h 30m");
  });

  it("clamps negative values to zero", () => {
    expect(formatDurationMinutes(-10)).toBe("0m");
  });
});

describe("timeRangesOverlap", () => {
  it("detects a direct overlap", () => {
    expect(timeRangesOverlap("20:00", "22:30", "20:45", "21:30")).toBe(true);
  });

  it("returns false for back-to-back ranges", () => {
    expect(timeRangesOverlap("18:00", "19:00", "19:00", "20:00")).toBe(false);
  });

  it("returns false for non-overlapping ranges", () => {
    expect(timeRangesOverlap("06:00", "07:00", "20:00", "21:00")).toBe(false);
  });

  it("handles a midnight-crossing range", () => {
    expect(timeRangesOverlap("23:30", "00:30", "00:15", "01:00")).toBe(true);
  });
});

describe("isTimeNowWithinRange", () => {
  it("is true for the same-day case", () => {
    expect(isTimeNowWithinRange("18:00", "18:30", "18:12")).toBe(true);
  });

  it("is false before the range starts", () => {
    expect(isTimeNowWithinRange("18:00", "18:30", "17:59")).toBe(false);
  });

  it("is false at/after the range ends (exclusive end)", () => {
    expect(isTimeNowWithinRange("18:00", "18:30", "18:30")).toBe(false);
  });

  it("is true just after midnight for a midnight-crossing range", () => {
    expect(isTimeNowWithinRange("23:30", "00:30", "00:15")).toBe(true);
  });

  it("is false before a midnight-crossing range has started", () => {
    expect(isTimeNowWithinRange("23:30", "00:30", "22:00")).toBe(false);
  });
});

describe("isTimeNowAfterRange", () => {
  it("is true once the same-day range has ended", () => {
    expect(isTimeNowAfterRange("18:44", "18:46", "18:48")).toBe(true);
  });

  it("is true at the exact end — inclusive, matching isTimeNowWithinRange's exclusive upper bound so nothing falls in a gap between the two", () => {
    expect(isTimeNowAfterRange("18:00", "18:30", "18:30")).toBe(true);
  });

  it("is false before the range has even started", () => {
    expect(isTimeNowAfterRange("18:00", "18:30", "17:00")).toBe(false);
  });

  it("is false while still within the range", () => {
    expect(isTimeNowAfterRange("18:00", "18:30", "18:15")).toBe(false);
  });

  it("is always false for a midnight-crossing range — not enough information in bare HH:mm to tell 'just past this morning's end' from 'well before tonight's start'", () => {
    expect(isTimeNowAfterRange("22:30", "06:00", "12:00")).toBe(false);
    expect(isTimeNowAfterRange("22:30", "06:00", "23:45")).toBe(false);
  });
});

describe("minutesUntil", () => {
  it("computes minutes to a later time today", () => {
    expect(minutesUntil("19:45", "19:27")).toBe(18);
  });

  it("returns 0 for the current minute", () => {
    expect(minutesUntil("19:27", "19:27")).toBe(0);
  });

  it("wraps to tomorrow when the target has already passed today", () => {
    expect(minutesUntil("00:30", "23:45")).toBe(45);
  });
});

describe("isValidTimeString", () => {
  it("accepts valid 24h times", () => {
    expect(isValidTimeString("00:00")).toBe(true);
    expect(isValidTimeString("23:59")).toBe(true);
  });

  it("rejects malformed times", () => {
    expect(isValidTimeString("24:00")).toBe(false);
    expect(isValidTimeString("9:00")).toBe(false);
    expect(isValidTimeString("09:60")).toBe(false);
  });
});
