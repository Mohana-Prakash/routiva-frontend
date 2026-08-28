import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { Topbar } from "./Topbar";
import { NetworkStatusBanner } from "./NetworkStatusBanner";
import { NotificationStatusBanner } from "@/features/notifications/components/NotificationStatusBanner";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />
      {/* This column, not the page body, owns the scroll — so the sidebar
          (and the sticky topbar within this column) stay pinned to the
          viewport instead of scrolling away with tall page content. */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />
        <NetworkStatusBanner />
        <NotificationStatusBanner />
        <main className="flex-1 pb-20 md:pb-6">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
