"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createQueryClient } from "@/lib/query/queryClient";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AlarmSoundListener } from "@/components/shared/AlarmSoundListener";
import { ResyncOnResume } from "@/components/shared/ResyncOnResume";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AlarmSoundListener />
          <ResyncOnResume />
          {children}
          <Toaster richColors closeButton position="top-center" />
        </TooltipProvider>
      </AuthProvider>
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
