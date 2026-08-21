import type { LucideIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SettingsSectionProps {
  id: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  tone?: "default" | "destructive";
  children: ReactNode;
}

/** Consistent icon/title/description header + card chrome for every settings section. */
export function SettingsSection({ id, icon: Icon, title, description, tone = "default", children }: SettingsSectionProps) {
  return (
    <section id={id} className="scroll-mt-20 rounded-xl border bg-card shadow-sm">
      <div className="flex items-start gap-3.5 p-5 sm:p-6">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            tone === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 pt-0.5">
          <h2 className="font-heading text-base font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      <Separator />
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}
