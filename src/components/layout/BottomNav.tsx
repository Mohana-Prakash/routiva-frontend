"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";

/**
 * Each item gets its own chart color for the active state — this app already has exactly five
 * of them (--chart-1..5, see globals.css), one per nav item, so it's a free source of distinct,
 * theme-aware accent colors rather than hardcoding new ones. Inactive items stay neutral so the
 * bar only turns colorful around whichever tab is actually selected. Classes are spelled out in
 * full (not built from a template string) so Tailwind's static scanner can find them.
 */
const NAV_ACTIVE_CLASS: Record<string, string> = {
  "/dashboard": "bg-chart-1/15 text-chart-1",
  "/schedule": "bg-chart-5/15 text-chart-5",
  "/activities": "bg-chart-2/15 text-chart-2",
  "/reports": "bg-chart-3/15 text-chart-3",
  "/settings": "bg-chart-4/15 text-chart-4",
};

/** Mobile bottom navigation (frontend-requirements 01 §4, 05 §8). Hidden at `md` and up. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] md:hidden">
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-md items-center justify-between rounded-2xl bg-background/95 p-1.5 shadow-lg shadow-black/10 ring-1 ring-foreground/10 backdrop-blur"
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const activeClass = NAV_ACTIVE_CLASS[item.href] ?? "bg-primary/15 text-primary";
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-13 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition-colors",
                active ? activeClass : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
