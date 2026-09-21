import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-[3px] border px-2 py-0.5 font-mono text-[0.6875rem] font-medium uppercase tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-muted text-foreground",
        secondary: "border-transparent bg-muted text-muted-foreground",
        stamp: "border-transparent bg-stamp/12 text-stamp",
        success: "border-transparent bg-success/15 text-success",
        warning: "border-transparent bg-warning/20 text-[#7a5a10]",
        destructive: "border-transparent bg-destructive/15 text-destructive",
        outline: "border-border text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
