import { describe, expect, it } from "vitest";
import { getFriendlyErrorMessage } from "./messages";
import { ApiError } from "@/types/api";

describe("getFriendlyErrorMessage", () => {
  it("maps known error codes to friendly copy", () => {
    expect(getFriendlyErrorMessage(new ApiError({ code: "SESSION_EXPIRED", message: "jwt expired", status: 401 }))).toBe(
      "Your session has expired. Please sign in again.",
    );
    expect(getFriendlyErrorMessage(new ApiError({ code: "SCHEDULE_CONFLICT", message: "overlap", status: 409 }))).toBe(
      "This overlaps with another activity.",
    );
    expect(getFriendlyErrorMessage(new ApiError({ code: "INVALID_CREDENTIALS", message: "bad creds", status: 401 }))).toBe(
      "Incorrect password.",
    );
  });

  it("falls back to the HTTP status mapping for an unrecognized code", () => {
    expect(getFriendlyErrorMessage(new ApiError({ code: "SOME_NEW_BACKEND_CODE", message: "internal detail", status: 404 }))).toBe(
      "We couldn't find what you were looking for.",
    );
  });

  it("never leaks a raw backend message for a fully unknown error", () => {
    const message = getFriendlyErrorMessage(new ApiError({ code: "SOME_NEW_BACKEND_CODE", message: "Column users.foo does not exist", status: 500 }));
    expect(message).not.toContain("Column");
  });

  it("maps a network error", () => {
    expect(getFriendlyErrorMessage(new ApiError({ code: "NETWORK_ERROR", message: "", status: 0 }))).toBe(
      "Unable to reach the server. Check your connection and try again.",
    );
  });

  it("falls back to a generic message for a non-ApiError", () => {
    expect(getFriendlyErrorMessage(new Error("some internal detail"))).toBe("Something went wrong on our end. Please try again.");
    expect(getFriendlyErrorMessage("a plain string")).toBe("Something went wrong on our end. Please try again.");
  });
});
