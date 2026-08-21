"use client";

import { usePathname } from "next/navigation";
import { CalendarCheck } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { UserMenu } from "./UserMenu";
import { env } from "@/lib/env";

function currentTitle(pathname: string | null): string {
  return (
    NAV_ITEMS.find((item) => pathname?.startsWith(item.href))?.label ??
    env.appName
  );
}

export function Topbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <CalendarCheck className="h-5 w-5 text-primary" aria-hidden="true" />
        <span className="font-heading text-sm font-semibold">
          {env.appName}
        </span>
      </div>
      <h1 className="hidden text-base font-semibold md:block">
        {currentTitle(pathname)}
      </h1>
      <UserMenu />
    </header>
  );
}
