import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/60 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground/60" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>

      <p className="max-w-sm text-sm text-muted-foreground mb-6">
        {description}
      </p>

      {action && (
        <Button asChild className="rounded-xl">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
