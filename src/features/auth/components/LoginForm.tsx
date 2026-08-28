"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth";
import { useLogin } from "../hooks/useAuthMutations";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";
import { ApiError } from "@/types/api";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginFormValues) {
    login.mutate(values, {
      onSuccess: () => {
        const redirectTo = searchParams.get("redirectTo");
        router.replace(redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard");
      },
      onError: (error) => {
        if (error instanceof ApiError && error.code === "EMAIL_NOT_FOUND") {
          form.setError("email", { message: "No account found with this email." });
          return;
        }
        if (error instanceof ApiError && error.code === "INVALID_CREDENTIALS") {
          form.setError("password", { message: "Incorrect password." });
          return;
        }
        toast.error(getFriendlyErrorMessage(error));
      },
    });
  }

  return (
    <Card className="rounded-2xl ring-0 sm:rounded-xl sm:ring-1 sm:ring-foreground/10 sm:shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
        <CardDescription className="text-base">Sign in to continue to your schedule.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        autoFocus
                        placeholder="you@example.com"
                        className="h-12 rounded-xl pl-10 text-base"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="-my-2 py-2 text-xs font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        className="h-12 rounded-xl px-10 text-base"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 text-base font-medium text-white shadow-md shadow-indigo-500/20 hover:opacity-90 active:opacity-95"
              disabled={login.isPending}
            >
              {login.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {login.isPending ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        </Form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Register
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
