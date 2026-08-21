export type AlarmOffsetPreset = 0 | 5 | 10 | 15;

export interface Activity {
  id: string;
  userId: string;
  categoryId: string;
  name: string;
  description: string | null;
  defaultDurationMinutes: number | null;
  alarmEnabled: boolean;
  alarmOffsetMinutes: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface CreateActivityInput {
  categoryId: string;
  name: string;
  description?: string | null;
  defaultDurationMinutes?: number | null;
  alarmEnabled: boolean;
  alarmOffsetMinutes?: number | null;
}

export interface UpdateActivityInput {
  categoryId?: string;
  name?: string;
  description?: string | null;
  defaultDurationMinutes?: number | null;
  alarmEnabled?: boolean;
  alarmOffsetMinutes?: number | null;
  isActive?: boolean;
}
