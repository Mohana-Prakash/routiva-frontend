"use client";

import { useEffect, useState } from "react";
import type { WeekStartDay } from "@/types/user";

const STORAGE_KEY = "my-day-tracker:week-start-day";

/**
 * frontend-requirements 05 §1 lists "Week start day" under Settings → Schedule,
 * but no backend field exists for it in the reviewed contract (users table has
 * no such column, and no API accepts it) — see backend-requirements
 * 02-database-and-data-model.md §3. Stored locally per-device pending a
 * backend field; flagged here rather than silently invented as a synced setting.
 */
export function useWeekStartPreference() {
  const [weekStart, setWeekStartState] = useState<WeekStartDay>("MONDAY");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "MONDAY" || stored === "SUNDAY") setWeekStartState(stored);
    } catch {
      // localStorage unavailable (private mode, etc.) — fall back to the default.
    }
  }, []);

  function setWeekStart(value: WeekStartDay) {
    setWeekStartState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Ignore write failures — the in-memory value still applies this session.
    }
  }

  return { weekStart, setWeekStart };
}
