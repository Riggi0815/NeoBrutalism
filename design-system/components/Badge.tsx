import {
  ReactNode,
  isValidElement,
  cloneElement,
  type ReactElement,
} from "react";
import { cn } from "../utils";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "accent"
  | "destructive"
  | "outline";

export interface BadgeProps {
  variant?: BadgeVariant;
  /** Rendered at 12x12, before the label. Gets DEFAULT_ICON_STROKE_WIDTH
   * applied automatically so all badges share the same line weight —
   * pass `strokeWidth` directly on the icon element itself to override
   * it for one specific badge. */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Default stroke width for every badge icon (Lucide's own default is 2).
 * Kept as one constant so "make all badge icons bolder" is a one-line
 * change instead of hunting down every call site. */
const DEFAULT_ICON_STROKE_WIDTH = 3;

/** Injects DEFAULT_ICON_STROKE_WIDTH into the passed icon element, unless
 * that element already sets its own strokeWidth — in which case the
 * caller's explicit choice wins. No-op for anything that isn't a valid
 * element (e.g. `icon` left undefined). */
function withDefaultStrokeWidth(icon: ReactNode): ReactNode {
  if (!isValidElement(icon)) return icon;
  const element = icon as ReactElement<{ strokeWidth?: number }>;
  return cloneElement(element, {
    strokeWidth: element.props.strokeWidth ?? DEFAULT_ICON_STROKE_WIDTH,
  });
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: "bg-primary border-2 border-foreground text-primary-foreground",
  secondary: "bg-secondary border-2 border-foreground text-secondary-foreground",
  accent: "bg-accent border-2 border-foreground text-accent-foreground",
  // Dark red: white text reads at 6.2:1 (near-black would not).
  destructive: "bg-danger border-2 border-foreground text-danger-foreground",
  outline: "bg-surface border-2 border-foreground text-foreground",
};

/**
 * Neo-Brutalism badge: small pill-shaped label with a 2px border and NO
 * shadow. In this library a hard shadow means "a layer you can press or
 * that floats above the page" — a badge is neither, it's a label. With a
 * shadow it looked like a button (and a table full of status badges
 * looked like a table full of buttons).
 */
export function Badge({
  variant = "default",
  icon,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-pill px-3 py-1 text-badge font-bold",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {icon && (
        <span
          aria-hidden="true"
          className="inline-flex h-3 w-3 shrink-0 items-center justify-center [&>svg]:h-3 [&>svg]:w-3"
        >
          {withDefaultStrokeWidth(icon)}
        </span>
      )}
      {children}
    </span>
  );
}
