import { z } from "zod";
import { isValidTimeString, minutesBetween } from "@/lib/datetime/time";

const timeField = z.string().refine(isValidTimeString, "Enter a valid time");

const recurrenceSchema = z
  .object({
    type: z.enum(["DAILY", "WEEKDAYS", "ONE_TIME"]),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
    date: z.string().optional(),
  })
  .refine((data) => data.type !== "WEEKDAYS" || (data.daysOfWeek && data.daysOfWeek.length > 0), {
    message: "Choose at least one weekday",
    path: ["daysOfWeek"],
  })
  .refine((data) => data.type !== "ONE_TIME" || !!data.date, {
    message: "Choose a date",
    path: ["date"],
  });

export const scheduleEntrySchema = z
  .object({
    activityId: z.string().min(1, "Choose an activity"),
    startTime: timeField,
    endTime: timeField,
    recurrence: recurrenceSchema,
  })
  .refine((data) => minutesBetween(data.startTime, data.endTime) > 0, {
    message: "End time must be after start time",
    path: ["endTime"],
  });
export type ScheduleEntryFormValues = z.infer<typeof scheduleEntrySchema>;

export const adHocActivitySchema = z
  .object({
    activityId: z.string().min(1, "Choose an activity"),
    date: z.string().min(1, "Choose a date"),
    startTime: timeField,
    endTime: timeField,
    reason: z.string().trim().max(300, "Note is too long").optional(),
  })
  .refine((data) => minutesBetween(data.startTime, data.endTime) > 0, {
    message: "End time must be after start time",
    path: ["endTime"],
  });
export type AdHocActivityFormValues = z.infer<typeof adHocActivitySchema>;

export const moveExceptionSchema = z
  .object({
    startTime: timeField,
    endTime: timeField,
    reason: z.string().trim().max(300, "Note is too long").optional(),
  })
  .refine((data) => minutesBetween(data.startTime, data.endTime) > 0, {
    message: "End time must be after start time",
    path: ["endTime"],
  });
export type MoveExceptionFormValues = z.infer<typeof moveExceptionSchema>;
