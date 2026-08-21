import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function LoadingSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("rounded-lg", className)} />;
}

export function LoadingSkeletonList({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={cn("h-16 w-full rounded-lg", className)} />
      ))}
    </div>
  );
}
