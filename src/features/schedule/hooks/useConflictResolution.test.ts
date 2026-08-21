import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useConflictResolution } from "./useConflictResolution";
import { ApiError } from "@/types/api";

const CONFLICT_ERROR = new ApiError({
  code: "SCHEDULE_CONFLICT",
  message: "overlap",
  status: 409,
  conflicts: [{ id: "c1", activityName: "Dinner", startTime: "20:45", endTime: "21:30" }],
});

describe("useConflictResolution", () => {
  it("captures a SCHEDULE_CONFLICT error and exposes the conflicting entries", () => {
    const { result } = renderHook(() => useConflictResolution());
    const retry = vi.fn();

    act(() => {
      const handled = result.current.captureIfConflict(CONFLICT_ERROR, retry);
      expect(handled).toBe(true);
    });

    expect(result.current.conflict?.conflicts).toEqual(CONFLICT_ERROR.conflicts);
    expect(retry).not.toHaveBeenCalled();
  });

  it("ignores a non-conflict error, leaving the caller to handle it", () => {
    const { result } = renderHook(() => useConflictResolution());
    const retry = vi.fn();
    const otherError = new ApiError({ code: "VALIDATION_ERROR", message: "bad", status: 422 });

    let handled;
    act(() => {
      handled = result.current.captureIfConflict(otherError, retry);
    });

    expect(handled).toBe(false);
    expect(result.current.conflict).toBeNull();
  });

  it("resolving with a real choice calls retry with that resolution and clears the dialog", () => {
    const { result } = renderHook(() => useConflictResolution());
    const retry = vi.fn();

    act(() => {
      result.current.captureIfConflict(CONFLICT_ERROR, retry);
    });
    act(() => {
      result.current.resolve("SHIFT_AFFECTED");
    });

    expect(retry).toHaveBeenCalledWith("SHIFT_AFFECTED");
    expect(result.current.conflict).toBeNull();
  });

  it("resolving with CANCEL never calls retry — the user backed out, nothing should be submitted", () => {
    const { result } = renderHook(() => useConflictResolution());
    const retry = vi.fn();

    act(() => {
      result.current.captureIfConflict(CONFLICT_ERROR, retry);
    });
    act(() => {
      result.current.resolve("CANCEL");
    });

    expect(retry).not.toHaveBeenCalled();
    expect(result.current.conflict).toBeNull();
  });
});
