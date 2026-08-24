import type { ReactNode } from "react";
import Image from "next/image";
import { RedirectIfAuthenticated } from "@/features/auth/RequireAuth";
import { env } from "@/lib/env";

export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return (
    <RedirectIfAuthenticated>
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-muted/30 px-4 py-12">
        <div className="overflow-hidden rounded-lg">
          <Image
            src="/logo-wordmark.png"
            alt={env.appName}
            width={200}
            height={86}
            priority
          />
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </RedirectIfAuthenticated>
  );
}
