import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  timezone: z.string().min(1, "Timezone is required"),
});
export type ProfileFormValues = z.infer<typeof profileSchema>;
