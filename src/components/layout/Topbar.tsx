"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { HelpCircle } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";

// Routes reachable outside the primary nav (NAV_ITEMS) that still need a Topbar title.
const EXTRA_TITLES: Record<string, string> = {
  "/guide": "Guide",
};

function currentTitle(pathname: string | null): string {
  const extraTitle = Object.entries(EXTRA_TITLES).find(([href]) => pathname?.startsWith(href))?.[1];
  return (
    NAV_ITEMS.find((item) => pathname?.startsWith(item.href))?.label ?? extraTitle ?? env.appName
  );
}

export function Topbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Image src="/logo-mark.png" alt="" width={22} height={22} />
        <span className="font-heading text-sm font-semibold">
          {env.appName}
        </span>
      </div>
      <h1 className="hidden text-base font-semibold md:block">
        {currentTitle(pathname)}
      </h1>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          render={<Link href="/guide" />}
          aria-label="How this app works"
          aria-current={pathname === "/guide" ? "page" : undefined}
        >
          <HelpCircle className="h-5 w-5" aria-hidden="true" />
        </Button>
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
