import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFriendlyErrorMessage } from "@/lib/errors/messages";

interface ErrorStateProps {
  error?: unknown;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ error, title, onRetry, className }: ErrorStateProps) {
  const message = title ?? getFriendlyErrorMessage(error);

  return (
    <div className={`flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center ${className ?? ""}`}>
      <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
