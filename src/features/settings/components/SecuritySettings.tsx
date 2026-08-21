"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
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
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
        <div>
          <p className="text-sm font-medium">Log out of all devices</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Signs this account out everywhere, including other browsers and devices.</p>
        </div>
        <Button variant="outline" onClick={confirm.show}>
          <LogOut className="h-4 w-4" />
          Log Out of All Devices
        </Button>
      </div>
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
    </>
  );
}
