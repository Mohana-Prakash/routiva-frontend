"use client";

import { useEffect, useState } from "react";

/**
 * A ticking clock for display and status derivation (current/upcoming) only —
 * never the source of truth for reminders, which are backend push-scheduled
 * (frontend-requirements 03 §8).
 */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
