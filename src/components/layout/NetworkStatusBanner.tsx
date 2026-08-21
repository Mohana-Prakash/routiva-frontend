"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function NetworkStatusBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div role="status" className="flex items-center justify-center gap-2 bg-amber-500/15 px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-400">
      <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
      You&apos;re offline. Changes can&apos;t be saved until you&apos;re back online.
    </div>
  );
}
