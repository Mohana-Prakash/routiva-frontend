import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60, "Name is too long"),
  icon: z.string().min(1, "Choose an icon"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Choose a color"),
});
export type CategoryFormValues = z.infer<typeof categorySchema>;
