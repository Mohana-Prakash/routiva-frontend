import { describe, expect, it } from "vitest";
import { formatDurationMinutes, isTimeNowWithinRange, isValidTimeString, minutesBetween, minutesUntil, timeRangesOverlap } from "./time";

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
