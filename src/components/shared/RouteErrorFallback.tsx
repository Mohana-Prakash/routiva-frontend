"use client";

import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface RouteErrorFallbackProps {
  reset: () => void;
}

/** Shared markup for Next.js `error.tsx` route-segment boundaries (frontend-requirements 01 §6). */
export function RouteErrorFallback({ reset }: RouteErrorFallbackProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <h1 className="text-lg font-medium">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          An unexpected error occurred. You can try again, or head back to the dashboard.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={reset}>
          Try Again
        </Button>
        <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
      </div>
    </div>
  );
}
