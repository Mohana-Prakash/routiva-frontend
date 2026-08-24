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

// Unlike `timeField`, this doesn't validate time format itself — when `timeless` is true the
// field is left at its default "" and must NOT be format-checked, so format is checked only
// by the outer `.refine()`s below (which know whether timeless applies) rather than here.
const optionalTimeField = z.string().optional();

export const scheduleEntrySchema = z
  .object({
    activityId: z.string().min(1, "Choose an activity"),
    // Timeless: no fixed slot, available all day. Timed: startTime/endTime required below.
    timeless: z.boolean(),
    startTime: optionalTimeField,
    endTime: optionalTimeField,
    // Timeless-only, and itself optional even then — leaving it blank just means no reminder
    // for this activity, same as leaving the alarm off.
    timelessReminderTime: optionalTimeField,
    recurrence: recurrenceSchema,
  })
  .refine((data) => data.timeless || isValidTimeString(data.startTime ?? ""), { message: "Enter a valid time", path: ["startTime"] })
  .refine((data) => data.timeless || isValidTimeString(data.endTime ?? ""), { message: "Enter a valid time", path: ["endTime"] })
  .refine((data) => data.timeless || !data.startTime || !data.endTime || minutesBetween(data.startTime, data.endTime) > 0, {
    message: "End time must be after start time",
    path: ["endTime"],
  })
  .refine((data) => !data.timelessReminderTime || isValidTimeString(data.timelessReminderTime), {
    message: "Enter a valid time",
    path: ["timelessReminderTime"],
  });
export type ScheduleEntryFormValues = z.infer<typeof scheduleEntrySchema>;

export const adHocActivitySchema = z
  .object({
    activityId: z.string().min(1, "Choose an activity"),
    date: z.string().min(1, "Choose a date"),
    timeless: z.boolean(),
    startTime: optionalTimeField,
    endTime: optionalTimeField,
    timelessReminderTime: optionalTimeField,
    reason: z.string().trim().max(300, "Note is too long").optional(),
  })
  .refine((data) => data.timeless || isValidTimeString(data.startTime ?? ""), { message: "Enter a valid time", path: ["startTime"] })
  .refine((data) => data.timeless || isValidTimeString(data.endTime ?? ""), { message: "Enter a valid time", path: ["endTime"] })
  .refine((data) => data.timeless || !data.startTime || !data.endTime || minutesBetween(data.startTime, data.endTime) > 0, {
    message: "End time must be after start time",
    path: ["endTime"],
  })
  .refine((data) => !data.timelessReminderTime || isValidTimeString(data.timelessReminderTime), {
    message: "Enter a valid time",
    path: ["timelessReminderTime"],
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
