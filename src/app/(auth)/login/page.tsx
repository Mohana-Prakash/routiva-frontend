import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSkeleton className="h-80 w-full" />}>
      <LoginForm />
    </Suspense>
  );
}
