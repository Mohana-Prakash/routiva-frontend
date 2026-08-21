import { getCategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  name: string;
  color: string;
  icon?: string | null;
  className?: string;
}

/**
 * Consistent category icon/color treatment used across the timeline, activity
 * list, and reports (frontend-requirements 01 §7). Color is always paired with
 * the icon and label — never the only signal.
 */
export function CategoryBadge({ name, color, icon, className }: CategoryBadgeProps) {
  const Icon = getCategoryIcon(icon);

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", className)}
      style={{ backgroundColor: `${color}1A`, color }}
    >
      {/* getCategoryIcon looks up a stable, static component reference from a
          fixed module-level map — it never creates a new component type, so
          this is safe despite the generic "dynamic JSX tag" heuristic. */}
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {name}
    </span>
  );
}
