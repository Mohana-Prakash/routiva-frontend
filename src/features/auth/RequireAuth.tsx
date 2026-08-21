"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

/**
 * Client-side route guard for the protected app shell. There is no Next.js
 * middleware in this build (the app is a static SPA with no server runtime),
 * so route protection happens here after the session-restoration query settles.
 * The backend remains the real authorization boundary for every API call —
 * this guard only prevents flashing protected UI to a signed-out visitor.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      const redirectTo = pathname ? `?redirectTo=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${redirectTo}`);
    }
  }, [status, router, pathname]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <LoadingSkeleton className="h-40 w-full max-w-md" />
      </div>
    );
  }

  return <>{children}</>;
}

/** Keeps a signed-in user off the auth screens (login/register/forgot/reset). */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "authenticated") {
    return null;
  }

  return <>{children}</>;
}
