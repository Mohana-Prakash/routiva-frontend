import { ApiError, type ApiErrorCode } from "@/types/api";

/**
 * Maps backend error codes / HTTP status to user-friendly copy
 * (frontend-requirements 05 §13). Never surface `error.message` from an
 * unrecognized code directly — it may be an internal backend string.
 */
const CODE_MESSAGES: Record<ApiErrorCode | "NETWORK_ERROR", string> = {
  VALIDATION_ERROR: "Please check the highlighted fields and try again.",
  AUTH_REQUIRED: "Please sign in to continue.",
  INVALID_CREDENTIALS: "Incorrect email or password.",
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  RESOURCE_NOT_FOUND: "We couldn't find what you were looking for.",
  RESOURCE_FORBIDDEN: "You do not have permission to do that.",
  SCHEDULE_CONFLICT: "This overlaps with another activity.",
  DUPLICATE_RESOURCE: "That already exists.",
  INVALID_STATE: "That action can't be performed right now. Please refresh and try again.",
  RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
  INTERNAL_ERROR: "Something went wrong on our end. Please try again.",
  NETWORK_ERROR: "Unable to reach the server. Check your connection and try again.",
};

const STATUS_MESSAGES: Record<number, string> = {
  401: CODE_MESSAGES.SESSION_EXPIRED,
  403: CODE_MESSAGES.RESOURCE_FORBIDDEN,
  404: CODE_MESSAGES.RESOURCE_NOT_FOUND,
  409: CODE_MESSAGES.SCHEDULE_CONFLICT,
  422: CODE_MESSAGES.VALIDATION_ERROR,
  429: CODE_MESSAGES.RATE_LIMITED,
  500: CODE_MESSAGES.INTERNAL_ERROR,
  503: "The service is temporarily unavailable. Please try again shortly.",
};

export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return CODE_MESSAGES[error.code as keyof typeof CODE_MESSAGES] ?? STATUS_MESSAGES[error.status] ?? CODE_MESSAGES.INTERNAL_ERROR;
  }
  if (error instanceof Error && error.message) {
    return CODE_MESSAGES.INTERNAL_ERROR;
  }
  return CODE_MESSAGES.INTERNAL_ERROR;
}
