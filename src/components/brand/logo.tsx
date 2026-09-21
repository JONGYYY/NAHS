import { cn } from "@/lib/utils";
import { PIGMENTS } from "@/lib/constants";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-9 flex-col items-center justify-center overflow-hidden rounded-[4px] bg-foreground text-background",
        className,
      )}
      aria-hidden="true"
    >
      <span className="font-display text-sm font-bold leading-none">N</span>
      <span className="absolute inset-x-0 bottom-0 flex h-[3px]">
        {PIGMENTS.slice(0, 5).map((c) => (
          <span key={c} className="flex-1" style={{ backgroundColor: c }} />
        ))}
      </span>
    </span>
  );
}

export function Wordmark({
  className,
  subtitle,
}: {
  className?: string;
  subtitle?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <div className="leading-tight">
        <div className="font-display text-base font-bold tracking-tight">NAHS</div>
        {subtitle ? (
          <div className="eyebrow mt-0.5 normal-case tracking-normal">{subtitle}</div>
        ) : null}
      </div>
    </div>
  );
}

// Identity motif: the chapter's palette as a row of pigment swatches.
export function PigmentRow({ className }: { className?: string }) {
  return (
    <div className={cn("swatch-row rounded-[2px]", className)} aria-hidden="true">
      {PIGMENTS.map((c) => (
        <span key={c} style={{ backgroundColor: c }} />
      ))}
    </div>
  );
}

// Backwards-compatible alias for earlier imports.
export const RainbowDots = PigmentRow;
