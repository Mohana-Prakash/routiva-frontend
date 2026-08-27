"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

/** Quick theme switcher in the Topbar — same next-themes state as Settings → Appearance,
 * just reachable from every screen instead of only from Settings. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // next-themes' value is only meaningful client-side after hydration; rendering it
  // during SSR/static export would mismatch the client (see AppearanceSettings).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = OPTIONS.find((option) => option.value === theme) ?? OPTIONS[2];
  const CurrentIcon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        aria-label={`Theme: ${current.label}. Change theme`}
      >
        {mounted ? <CurrentIcon className="h-5 w-5" aria-hidden="true" /> : <Monitor className="h-5 w-5" aria-hidden="true" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = mounted && theme === option.value;
          return (
            <DropdownMenuItem key={option.value} onClick={() => setTheme(option.value)}>
              <Icon className="h-4 w-4" aria-hidden="true" />
              {option.label}
              {selected && <Check className="ml-auto h-4 w-4" aria-hidden="true" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
