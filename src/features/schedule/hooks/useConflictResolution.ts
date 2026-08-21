import { useState } from "react";
import { ApiError, type ScheduleConflictEntry } from "@/types/api";
import type { ConflictResolution } from "@/types/schedule";

interface ConflictState {
  conflicts: ScheduleConflictEntry[];
  retry: (resolution: Exclude<ConflictResolution, "CANCEL">) => void;
}

/**
 * Shared conflict-handling flow for schedule entry / exception / ad-hoc forms
 * (frontend-requirements 02 §8). The backend is the sole authority on what
 * counts as a conflict — this hook only captures the 409 response and lets the
 * user pick one of the choices the backend supports, then resubmits with that
 * choice. It never silently retries or drops the conflict.
 */
export function useConflictResolution() {
  const [conflict, setConflict] = useState<ConflictState | null>(null);

  /** Returns true if the error was a schedule conflict and has been captured for the dialog. */
  function captureIfConflict(error: unknown, retry: ConflictState["retry"]): boolean {
    if (error instanceof ApiError && error.code === "SCHEDULE_CONFLICT") {
      setConflict({ conflicts: error.conflicts ?? [], retry });
      return true;
    }
    return false;
  }

  function resolve(resolution: ConflictResolution) {
    if (!conflict) return;
    if (resolution !== "CANCEL") {
      conflict.retry(resolution);
    }
    setConflict(null);
  }

  return { conflict, captureIfConflict, resolve, dismiss: () => setConflict(null) };
}
