"use client";

import Link from "next/link";
import { Tags, ListChecks, CalendarClock, PlayCircle, BarChart3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Stage {
  number: number;
  icon: LucideIcon;
  title: string;
  optional?: boolean;
  explanation: string;
  example: string;
  cta: string;
  href: string;
}

const STAGES: Stage[] = [
  {
    number: 1,
    icon: Tags,
    title: "Create categories",
    optional: true,
    explanation:
      "Categories group similar activities — like Health, Work, or Learning — with their own color and icon, so your timeline and reports are easy to scan at a glance.",
    example: "“Health” (red, heart icon) → Morning Run, Yoga, Meditation",
    cta: "Go to Categories",
    href: "/activities?tab=categories",
  },
  {
    number: 2,
    icon: ListChecks,
    title: "Create activities",
    explanation:
      "An activity is a reusable definition of something you do — give it a name, an optional category, and an alarm if you want a reminder.",
    example: "“Morning Run” — Health category, alarm 10 min before",
    cta: "Go to Activities",
    href: "/activities",
  },
  {
    number: 3,
    icon: CalendarClock,
    title: "Add it to your schedule",
    explanation:
      "This is where an activity gets a time. “Base Schedule” is your recurring routine (daily, weekdays, or a one-time date) — it repeats on its own. “Daily View” shows what's actually happening on one specific date, including any changes you make just for that day.",
    example:
      "Meditation repeats daily 07:00–07:15 in your Base Schedule. Skipping it just for tomorrow doesn't touch the recurring rule — that's a one-date exception.",
    cta: "Go to Schedule",
    href: "/schedule",
  },
  {
    number: 4,
    icon: PlayCircle,
    title: "Track your day",
    explanation:
      "As each scheduled activity's time arrives, mark it Start, Complete, or Skip right from the Dashboard or Schedule timeline. Status updates automatically — Upcoming, Current, Completed, Missed.",
    example: "Tap “Complete” on Morning Run once you're done — no need to tap Start first.",
    cta: "Go to Dashboard",
    href: "/dashboard",
  },
  {
    number: 5,
    icon: BarChart3,
    title: "Review your progress",
    explanation:
      "Reports roll up what you planned vs. what actually happened, broken down by category and activity, for any date range.",
    example: "See your weekly completion rate, or how consistent “Morning Run” has been this month.",
    cta: "Go to Reports",
    href: "/reports",
  },
];

const FAQS = [
  {
    q: "What's a timeless activity?",
    a: "One with no fixed start/end time — it shows under “Anytime” and can be done whenever, with an optional daily reminder time instead of a start/end alarm.",
  },
  {
    q: "Deactivate vs. delete — what's the difference?",
    a: "Deactivating hides a category, activity, or schedule entry from your active lists without losing its history, and you can reactivate it any time. This app avoids deleting things outright for exactly that reason.",
  },
  {
    q: "Where do reminders come from?",
    a: "Turn on an alarm per activity, and enable push notifications in Settings → Notifications — you'll get an alert even when the app is closed.",
  },
];

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 pb-10 md:p-6">
      <div className="space-y-1.5">
        <h1 className="font-heading text-xl font-semibold">How it all fits together</h1>
        <p className="text-sm text-muted-foreground">
          Five steps from a blank account to a tracked day. Categories are optional — everything
          else builds on the step before it.
        </p>
      </div>

      <ol className="space-y-4">
        {STAGES.map((stage) => (
          <li key={stage.number}>
            <Card>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 font-heading text-sm font-semibold text-primary"
                    aria-hidden="true"
                  >
                    {stage.number}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1 pt-1">
                    <div className="flex items-center gap-1.5">
                      <stage.icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <h2 className="text-sm font-medium">{stage.title}</h2>
                      {stage.optional && (
                        <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{stage.explanation}</p>
                  </div>
                </div>

                <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Example: </span>
                  {stage.example}
                </p>

                <Button size="sm" className="w-full sm:w-auto" nativeButton={false} render={<Link href={stage.href} />}>
                  {stage.cta}
                </Button>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>

      <div className="space-y-3">
        <h2 className="font-heading text-base font-medium">Common questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <div key={faq.q} className="rounded-lg border p-3">
              <p className="text-sm font-medium">{faq.q}</p>
              <p className="mt-1 text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
