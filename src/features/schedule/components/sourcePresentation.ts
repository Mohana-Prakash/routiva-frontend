import { Repeat, PenLine, Sparkle, type LucideIcon } from "lucide-react";
import type { ScheduleItemSource } from "@/types/schedule";

interface SourcePresentation {
  label: string;
  icon: LucideIcon;
}

/** Compact tile-friendly labels — ActivityDetailSheet's SOURCE_LABEL has the fuller versions
 * for the detail drawer. Lets a Daily View item be told apart at a glance: part of the
 * recurring routine, a one-off change to it just for this date, or a standalone addition. */
export const SOURCE_PRESENTATION: Record<ScheduleItemSource, SourcePresentation> = {
  BASE: { label: "Recurring", icon: Repeat },
  EXCEPTION: { label: "Modified", icon: PenLine },
  ONE_TIME: { label: "One-time", icon: Sparkle },
};
