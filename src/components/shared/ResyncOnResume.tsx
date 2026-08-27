"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

const MIN_RESYNC_INTERVAL_MS = 5_000;

/**
 * React Query's built-in refetchOnWindowFocus relies on `visibilitychange`/`focus` firing
 * reliably, which an installed Android PWA (standalone/WebAPK) doesn't always do once the OS
 * freezes a backgrounded page — the app can otherwise sit showing stale data indefinitely,
 * with every subsequent in-app navigation looking "dead" (no network calls at all) until the
 * user does a manual pull-to-refresh. This adds a broader, redundant set of resume signals
 * (visibilitychange, focus, bfcache-restore via pageshow, reconnecting after offline) that
 * force-invalidate every active query, so the UI resyncs on whichever one actually fires.
 */
export function ResyncOnResume() {
  const queryClient = useQueryClient();
  const lastResyncAt = useRef(0);

  useEffect(() => {
    function resync() {
      const now = Date.now();
      if (now - lastResyncAt.current < MIN_RESYNC_INTERVAL_MS) return;
      lastResyncAt.current = now;
      void queryClient.invalidateQueries();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") resync();
    }

    function handlePageShow(event: PageTransitionEvent) {
      // event.persisted: the page was restored from the back/forward cache after being frozen
      // — same document, but any state/timers may be stale.
      if (event.persisted) resync();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", resync);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("online", resync);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", resync);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("online", resync);
    };
  }, [queryClient]);

  return null;
}
