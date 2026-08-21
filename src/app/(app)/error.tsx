"use client";

import { RouteErrorFallback } from "@/components/shared/RouteErrorFallback";

export default function AppSegmentError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteErrorFallback reset={reset} />;
}
