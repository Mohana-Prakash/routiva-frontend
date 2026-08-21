"use client";

import { RouteErrorFallback } from "@/components/shared/RouteErrorFallback";
import "./globals.css";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <RouteErrorFallback reset={reset} />
      </body>
    </html>
  );
}
