"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, useConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useLogoutAll } from "@/features/auth/hooks/useAuthMutations";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";

export function SecuritySettings() {
  const router = useRouter();
  const logoutAll = useLogoutAll();
  const confirm = useConfirmDialog();

  function handleConfirm() {
    logoutAll.mutate(undefined, {
      onSuccess: () => {
        confirm.hide();
        router.replace("/login");
      },
      onError: (error) => toast.error(getFriendlyErrorMessage(error)),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Security</CardTitle>
        <CardDescription>Signs this account out everywhere, including other browsers and devices.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={confirm.show}>
          Log Out of All Devices
        </Button>
      </CardContent>
      <ConfirmDialog
        open={confirm.open}
        onOpenChange={confirm.onOpenChange}
        title="Log out of all devices?"
        description="You'll need to sign in again on every device, including this one."
        confirmLabel="Log Out Everywhere"
        destructive
        isConfirming={logoutAll.isPending}
        onConfirm={handleConfirm}
      />
    </Card>
  );
}
