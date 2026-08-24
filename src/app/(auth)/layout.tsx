import type { ReactNode } from "react";
import Image from "next/image";
import { RedirectIfAuthenticated } from "@/features/auth/RequireAuth";
import { env } from "@/lib/env";

export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return (
    <RedirectIfAuthenticated>
      <div className="relative flex min-h-dvh flex-col items-center overflow-hidden bg-background px-5 pt-[max(3rem,calc(env(safe-area-inset-top)+1.5rem))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:justify-center sm:bg-muted/30 sm:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-radial from-indigo-500/15 via-fuchsia-500/5 to-transparent sm:hidden"
        />
        <div className="relative mb-10 overflow-hidden rounded-xl sm:mb-8">
          <Image
            src="/logo-wordmark.png"
            alt={env.appName}
            width={190}
            height={82}
            priority
          />
        </div>
        <div className="relative w-full max-w-sm">{children}</div>
      </div>
    </RedirectIfAuthenticated>
  );
}
