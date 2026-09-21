import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "var(--color-foreground)",
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: LucideIcon;
  accent?: string;
  className?: string;
}) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="eyebrow">{label}</p>
        {Icon ? <Icon className="size-4 text-muted-foreground" aria-hidden="true" /> : null}
      </div>
      <p className="mt-3 font-display text-4xl font-semibold leading-none tracking-tight tabular-nums">
        {value}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <span
          className="h-[3px] w-6 shrink-0"
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        />
        {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
      </div>
    </Card>
  );
}
