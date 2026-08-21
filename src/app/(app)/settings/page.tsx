import { Bell, CalendarDays, Palette, ShieldCheck, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SettingsSection } from "@/features/settings/components/SettingsSection";
import { SettingsNav } from "@/features/settings/components/SettingsNav";
import { ProfileForm } from "@/features/settings/components/ProfileForm";
import { AppearanceSettings } from "@/features/settings/components/AppearanceSettings";
import { ScheduleDefaultsSettings } from "@/features/settings/components/ScheduleDefaultsSettings";
import { SecuritySettings } from "@/features/settings/components/SecuritySettings";
import { NotificationPermissionCard } from "@/features/notifications/components/NotificationPermissionCard";
import { NotificationPreferencesForm } from "@/features/notifications/components/NotificationPreferencesForm";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile, reminders, and how the app looks.</p>
      </div>

      <div className="flex items-start gap-8">
        <SettingsNav />

        <div className="min-w-0 flex-1 space-y-6">
          <SettingsSection id="profile" icon={User} title="Profile" description="Your name, email, and timezone.">
            <ProfileForm />
          </SettingsSection>

          <SettingsSection id="notifications" icon={Bell} title="Notifications" description="Control reminders and how they reach you.">
            <div className="space-y-5">
              <NotificationPermissionCard />
              <Separator />
              <NotificationPreferencesForm />
            </div>
          </SettingsSection>

          <SettingsSection id="appearance" icon={Palette} title="Appearance" description="Choose how My Day Tracker looks on this device.">
            <AppearanceSettings />
          </SettingsSection>

          <SettingsSection id="schedule" icon={CalendarDays} title="Schedule" description="Defaults used when viewing your schedule.">
            <ScheduleDefaultsSettings />
          </SettingsSection>

          <SettingsSection id="security" icon={ShieldCheck} title="Security" description="Manage where you're signed in." tone="destructive">
            <SecuritySettings />
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
