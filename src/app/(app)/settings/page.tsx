import { Bell, CalendarDays, Palette, ShieldCheck, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SettingsSection } from "@/features/settings/components/SettingsSection";
import { ProfileForm } from "@/features/settings/components/ProfileForm";
import { AppearanceSettings } from "@/features/settings/components/AppearanceSettings";
import { ScheduleDefaultsSettings } from "@/features/settings/components/ScheduleDefaultsSettings";
import { SecuritySettings } from "@/features/settings/components/SecuritySettings";
import { NotificationPermissionCard } from "@/features/notifications/components/NotificationPermissionCard";
import { NotificationPreferencesForm } from "@/features/notifications/components/NotificationPreferencesForm";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
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
  );
}
