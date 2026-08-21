export type AccountStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export interface User {
  id: string;
  name: string;
  email: string;
  timezone: string;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export type ThemePreference = "light" | "dark" | "system";

export type WeekStartDay = "MONDAY" | "SUNDAY";
