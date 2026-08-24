import type { ReactNode } from "react";
import { CalendarCheck } from "lucide-react";
import { RedirectIfAuthenticated } from "@/features/auth/RequireAuth";
import { env } from "@/lib/env";

export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return (
    <RedirectIfAuthenticated>
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-muted/30 px-4 py-12">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="font-heading text-lg font-semibold capitalize">
            {env.appName}
          </span>
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </RedirectIfAuthenticated>
  );
}
