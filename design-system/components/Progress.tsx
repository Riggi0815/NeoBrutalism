import { useId } from "react";
import { cn } from "../utils";

/** One full class string per palette color — Tailwind only generates
 * classes it finds as complete literals (same reason as Switch's table). */
const FILL_CLASSES = {
  /** Role token from tokens.css — follows the theme. Default. */
  accent: "bg-accent",
  green: "bg-green",
  pink: "bg-pink",
  purple: "bg-purple",
  yellow: "bg-yellow",
  blue: "bg-blue",
  orange: "bg-orange",
  destructive: "bg-destructive",
} as const;

export type ProgressColor = keyof typeof FILL_CLASSES;

export interface ProgressProps {
  /** Current progress, from 0 to `max`. Clamped into that range. */
  value: number;
  /** The value that means "done". Default 100. */
  max?: number;
  /** Rendered top-left, above the bar. Without it pass `aria-label`. */
  label?: string;
  /** Fill color as a palette name. Default `accent` (the role token, so it follows a re-themed --color-accent). */
  color?: ProgressColor;
  /** Show the percentage top-right. Default true. */
  showValue?: boolean;
  "aria-label"?: string;
  className?: string;
}

/**
 * Neo-Brutalism progress bar: 20px tall (16px inside + 2×2px border),
 * fully rounded, flat (no shadow — it displays a value, it isn't something
 * you press; see the shadow rule in tokens.css). The filled part ends in
 * a 2px dark line, which separates it from the empty rest of the bar.
 *
 * The bar is a real `role="progressbar"` with the numeric value, so screen
 * readers announce "Upload, 25%"; the percentage drawn above it is
 * decoration for the eyes only. Server-compatible: no state, no handlers.
 */
export function Progress({
  value,
  max = 100,
  label,
  color = "accent",
  showValue = true,
  "aria-label": ariaLabel,
  className,
}: ProgressProps) {
  const labelId = useId();
  const fraction = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const percent = Math.round(fraction * 100);

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {(label || showValue) && (
        <div className="flex items-baseline justify-between gap-4 text-small">
          {label ? (
            <span id={labelId} className="font-medium text-foreground">
              {label}
            </span>
          ) : (
            <span />
          )}
          {showValue && (
            <span aria-hidden="true" className="text-muted">
              {percent}%
            </span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${percent}%`}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        className="relative h-5 w-full"
      >
        <span
          aria-hidden="true"
          className="relative block h-full w-full overflow-hidden rounded-pill border-2 border-foreground bg-surface"
        >
          <span
            className={cn(
              "absolute inset-y-0 left-0 transition-[width] duration-300 ease-out motion-reduce:transition-none",
              FILL_CLASSES[color],
              percent > 0 && "border-r-2 border-foreground",
            )}
            style={{ width: `${percent}%` }}
          />
        </span>
      </div>
    </div>
  );
}
