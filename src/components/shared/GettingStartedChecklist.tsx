"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, CheckCircle2, ChevronRight, ListChecks, Tags, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useActiveCategories } from "@/features/categories/hooks/useCategories";
import { useActiveActivities } from "@/features/activities/hooks/useActivities";
import { useScheduleEntries } from "@/features/schedule/hooks/useScheduleEntries";

const DISMISSED_KEY = "getting-started-dismissed";

interface ChecklistStep {
  icon: LucideIcon;
  label: string;
  description: string;
  href: string;
  done: boolean;
  optional?: boolean;
}

/**
 * A first-run nudge through the app's setup order (category → activity → schedule
 * entry), which isn't otherwise obvious from the UI on first login. Only rendered
 * once we know a user hasn't already finished the two required steps, and stays
 * dismissed (localStorage) if the user closes it early — see the getting-started
 * checklist pattern discussed for onboarding.
 */
export function GettingStartedChecklist() {
  const [dismissed, setDismissed] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISSED_KEY) === "true");
    setReady(true);
  }, []);

  const { data: categories, isLoading: categoriesLoading } = useActiveCategories();
  const { data: activities, isLoading: activitiesLoading } = useActiveActivities();
  const { data: scheduleEntries, isLoading: scheduleLoading } = useScheduleEntries();

  const hasCategory = (categories?.length ?? 0) > 0;
  const hasActivity = (activities?.length ?? 0) > 0;
  const hasSchedule = (scheduleEntries?.filter((entry) => entry.isActive).length ?? 0) > 0;

  const loading = categoriesLoading || activitiesLoading || scheduleLoading;
  // Category is a nice-to-have for organizing activities/reports, not a prerequisite —
  // don't hold the checklist open just because it's unchecked.
  const requiredStepsDone = hasActivity && hasSchedule;

  if (!ready || loading || dismissed || requiredStepsDone) return null;

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
  }

  const steps: ChecklistStep[] = [
    {
      icon: Tags,
      label: "Add a category",
      description: "Groups activities like Health or Work for reports and quick filtering.",
      href: "/activities?tab=categories",
      done: hasCategory,
      optional: true,
    },
    {
      icon: ListChecks,
      label: "Create an activity",
      description: "Activities are reusable — you'll assign them to time slots next.",
      href: "/activities",
      done: hasActivity,
    },
    {
      icon: CalendarClock,
      label: "Add it to your schedule",
      description: "Give it a time slot (or mark it timeless) so it shows up on your daily timeline.",
      href: "/schedule",
      done: hasSchedule,
    },
  ];

  const doneCount = steps.filter((step) => step.done).length;
  const nextIndex = steps.findIndex((step) => !step.done);
  const progressPercent = Math.round((doneCount / steps.length) * 100);

  return (
    <Card className="ring-1 ring-primary/15">
      <CardHeader className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <p className="font-heading text-base font-medium">Getting started</p>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
              {doneCount}/{steps.length}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">A few steps to set up your day.</p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleDismiss}
          aria-label="Dismiss getting started checklist"
          className="shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {steps.map((step, index) => {
          const isNext = index === nextIndex;
          return (
            <Link
              key={step.label}
              href={step.href}
              className={cn(
                "flex items-center gap-3 rounded-lg p-2.5 transition-colors",
                isNext ? "bg-primary/8 ring-1 ring-primary/20 hover:bg-primary/12" : "hover:bg-muted",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  step.done
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : isNext
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {step.done ? (
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <step.icon className="h-4 w-4" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  {step.label}
                  {step.optional && (
                    <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                  )}
                </span>
                <span className="block text-xs text-muted-foreground">{step.description}</span>
              </span>
              {isNext ? (
                <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                  Next
                </span>
              ) : (
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-muted-foreground/50"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
