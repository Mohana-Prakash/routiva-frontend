import { z } from "zod";

export const activitySchema = z
  .object({
    categoryId: z.string().optional(),
    name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
    description: z.string().trim().max(500, "Notes are too long").optional(),
    alarmEnabled: z.boolean(),
    alarmOffsetMinutes: z.number().int().min(0).max(180).optional(),
  })
  .refine((data) => !data.alarmEnabled || data.alarmOffsetMinutes !== undefined, {
    message: "Choose when the alarm should fire",
    path: ["alarmOffsetMinutes"],
  });
export type ActivityFormValues = z.infer<typeof activitySchema>;

export const ALARM_TIMING_OPTIONS = [
  { value: 0, label: "At start" },
  { value: 1, label: "1 minute before" },
  { value: 2, label: "2 minutes before" },
  { value: 5, label: "5 minutes before" },
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
] as const;
