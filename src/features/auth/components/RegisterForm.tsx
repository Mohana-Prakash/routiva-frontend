"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TimezoneSelect, guessBrowserTimezone } from "@/components/shared/TimezoneSelect";
import { registerSchema, type RegisterFormValues } from "@/lib/validation/auth";
import { useRegister } from "../hooks/useAuthMutations";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";
import { ApiError } from "@/types/api";

export function RegisterForm() {
  const router = useRouter();
  const register = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", timezone: guessBrowserTimezone() },
  });

  function onSubmit(values: RegisterFormValues) {
    register.mutate(
      { name: values.name, email: values.email, password: values.password, timezone: values.timezone },
      {
        onSuccess: () => {
          toast.success("Account created. Welcome!");
          router.replace("/dashboard");
        },
        onError: (error) => {
          if (error instanceof ApiError && error.code === "DUPLICATE_RESOURCE") {
            form.setError("email", { message: "An account with this email already exists." });
            return;
          }
          if (error instanceof ApiError && error.fieldErrors) {
            error.fieldErrors.forEach((fe) => {
              if (fe.field in form.getValues()) {
                form.setError(fe.field as keyof RegisterFormValues, { message: fe.message });
              }
            });
            return;
          }
          toast.error(getFriendlyErrorMessage(error));
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Start building your daily routine.</CardDescription>
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
                    <Input autoComplete="name" placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <Button type="submit" className="w-full" disabled={register.isPending}>
              {register.isPending ? "Creating account…" : "Create Account"}
            </Button>
          </form>
        </Form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
