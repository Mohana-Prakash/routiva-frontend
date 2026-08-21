import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingSkeleton className="h-80 w-full" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
