"use client";

import { RouteErrorFallback } from "@/components/shared/RouteErrorFallback";

export default function AuthSegmentError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteErrorFallback reset={reset} />;
}
