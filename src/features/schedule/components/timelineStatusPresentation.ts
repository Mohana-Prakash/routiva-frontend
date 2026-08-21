import { CheckCircle2, CircleDashed, CircleDot, CircleSlash, MinusCircle, PenLine, XCircle, type LucideIcon } from "lucide-react";
import type { TimelineDisplayStatus } from "@/types/activity-log";

interface StatusPresentation {
  label: string;
  icon: LucideIcon;
  className: string;
}

/** Status is always paired with an icon + label, never conveyed by color alone (frontend-requirements 01 §7). */
export const TIMELINE_STATUS_PRESENTATION: Record<TimelineDisplayStatus, StatusPresentation> = {
  UPCOMING: { label: "Upcoming", icon: CircleDashed, className: "text-muted-foreground" },
  CURRENT: { label: "Current", icon: CircleDot, className: "text-primary" },
  COMPLETED: { label: "Completed", icon: CheckCircle2, className: "text-emerald-600 dark:text-emerald-400" },
  SKIPPED: { label: "Skipped", icon: MinusCircle, className: "text-muted-foreground" },
  CANCELLED: { label: "Cancelled", icon: XCircle, className: "text-muted-foreground" },
  ADJUSTED: { label: "Adjusted", icon: PenLine, className: "text-amber-600 dark:text-amber-400" },
  MISSED: { label: "Missed", icon: CircleSlash, className: "text-destructive" },
};
