import { ProfileForm } from "@/features/settings/components/ProfileForm";
import { AppearanceSettings } from "@/features/settings/components/AppearanceSettings";
import { ScheduleDefaultsSettings } from "@/features/settings/components/ScheduleDefaultsSettings";
import { SecuritySettings } from "@/features/settings/components/SecuritySettings";
import { NotificationPermissionCard } from "@/features/notifications/components/NotificationPermissionCard";
import { NotificationPreferencesForm } from "@/features/notifications/components/NotificationPreferencesForm";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
      <ProfileForm />
      <NotificationPermissionCard />
      <NotificationPreferencesForm />
      <AppearanceSettings />
      <ScheduleDefaultsSettings />
      <SecuritySettings />
    </div>
  );
}
