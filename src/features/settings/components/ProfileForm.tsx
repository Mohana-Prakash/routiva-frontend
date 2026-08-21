"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TimezoneSelect } from "@/components/shared/TimezoneSelect";
import { profileSchema, type ProfileFormValues } from "@/lib/validation/settings";
import { useAuth } from "@/features/auth/AuthProvider";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";

export function ProfileForm() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: user ? { name: user.name, timezone: user.timezone } : undefined,
  });

  if (!user) return null;

  function onSubmit(values: ProfileFormValues) {
    updateProfile.mutate(values, {
      onSuccess: () => toast.success("Profile updated"),
      onError: (error) => toast.error(getFriendlyErrorMessage(error)),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled readOnly />
            </div>
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <FormControl>
                    <TimezoneSelect value={field.value} onValueChange={field.onChange} id={field.name} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={updateProfile.isPending || !form.formState.isDirty}>
              {updateProfile.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
