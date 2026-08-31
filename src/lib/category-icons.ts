import {
  Sparkles,
  Briefcase,
  BookOpen,
  HeartPulse,
  Dumbbell,
  Users,
  User,
  Moon,
  Plane,
  Film,
  Circle,
  Coffee,
  Music,
  Utensils,
  Home,
  ShoppingBag,
  Wallet,
  Gamepad2,
  Palette,
  Camera,
  Star,
  Flower2,
  BedDouble,
  Scroll,
  type LucideIcon,
} from "lucide-react";

/**
 * Curated icon set for categories (frontend-requirements 03 §2). Categories store
 * an icon *name* (one of these keys); components look it up here rather than
 * trusting arbitrary icon markup from the backend.
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  briefcase: Briefcase,
  "book-open": BookOpen,
  "heart-pulse": HeartPulse,
  dumbbell: Dumbbell,
  users: Users,
  user: User,
  moon: Moon,
  plane: Plane,
  film: Film,
  coffee: Coffee,
  music: Music,
  utensils: Utensils,
  home: Home,
  "shopping-bag": ShoppingBag,
  wallet: Wallet,
  "gamepad-2": Gamepad2,
  palette: Palette,
  camera: Camera,
  star: Star,
  circle: Circle,
  "flower-2": Flower2,
  "bed-double": BedDouble,
  scroll: Scroll,
};

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICONS);

export function getCategoryIcon(name: string | null | undefined): LucideIcon {
  return (name && CATEGORY_ICONS[name]) || Circle;
}

/** Default categories a new user is expected to see (frontend-requirements 03 §2) — for empty-state copy only, never assumed to be the only categories. */
export const DEFAULT_CATEGORY_NAMES = [
  "Spiritual",
  "Work",
  "Study",
  "Health",
  "Exercise",
  "Family",
  "Personal",
  "Sleep",
  "Travel",
  "Entertainment",
  "Other",
];

export const CATEGORY_COLOR_PRESETS = [
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#F43F5E",
  "#F59E0B",
  "#84CC16",
  "#10B981",
  "#14B8A6",
  "#06B6D4",
  "#3B82F6",
  "#64748B",
];
