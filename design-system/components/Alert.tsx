import { ReactNode } from "react";
import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";
import { cn } from "../utils";

/** Per variant: background (one full class string — Tailwind only generates
 * classes it finds as complete literals), default icon, and ARIA role.
 * Info and success are polite status messages; warning and error interrupt
 * a screen reader, so they use `alert`. */
const VARIANTS = {
  info: { surface: "bg-info-soft", icon: Info, role: "status" },
  success: { surface: "bg-success-soft", icon: CircleCheck, role: "status" },
  warning: { surface: "bg-warning-soft", icon: TriangleAlert, role: "alert" },
  error: { surface: "bg-danger-soft", icon: CircleX, role: "alert" },
} as const;

export type AlertVariant = keyof typeof VARIANTS;

export interface AlertProps {
  /** Default `info`. */
  variant?: AlertVariant;
  /** Bold first line next to the icon. */
  title?: ReactNode;
  /** The message below the title, in muted gray. */
  children?: ReactNode;
  /** Replaces the variant's default icon. Drawn at 24px inside a 20px slot
   * (see below), so pass a lucide-style icon. */
  icon?: ReactNode;
  /** Quiet level for reading pages: no shadow, thinner border
   * (--border-width-flat). For notes inside a wiki article.
   * A flat alert is part of the text, not a message that just appeared, so
   * it uses role="note" instead of status/alert: a warning box in an
   * article must not be read out by screen readers the moment the page
   * loads. */
  flat?: boolean;
  className?: string;
  id?: string;
}

/** Hard-shadow offset: --offset-raised (a static layer, no motion). */
const SHADOW_OFFSET = "raised";

/**
 * Neo-Brutalism alert box: icon, title and muted message on a tinted
 * surface. Same hard-shadow-as-a-real-element technique as Card (see
 * Card.tsx for why).
 *
 * The icon sits in a 20px slot, but the svg inside is drawn at 24px with a
 * -2px margin: lucide icons leave a 2px inset inside their 24px viewBox,
 * so a 20px svg would show only a ~17px glyph. At 24px (pulled back into
 * the slot) the visible circle/triangle is a full 20px, which is the size
 * of the design.
 *
 * The title is a plain paragraph, not a heading element: an alert's title
 * isn't a section of the page, and a heading would clutter the page
 * outline. It is styled like CardTitle (--text-card-title, semibold).
 *
 * All four surfaces are soft role tones (info = lila, success = mint,
 * warning = gelb, error = rot), so they are equally loud and clearly
 * different from each other.
 */
export function Alert({
  variant = "info",
  title,
  children,
  icon,
  flat = false,
  className,
  id,
}: AlertProps) {
  const { surface, icon: DefaultIcon, role } = VARIANTS[variant];

  return (
    <div id={id} role={flat ? "note" : role} className={cn("relative", className)}>
      {!flat && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-brutal bg-shadow"
          style={{ transform: `translate(var(--offset-${SHADOW_OFFSET}-x), var(--offset-${SHADOW_OFFSET}-y))` }}
        />
      )}
      <div
        className={cn(
          "relative flex items-start gap-4 rounded-brutal border-2 border-foreground p-5",
          surface,
        )}
        style={flat ? { borderWidth: "var(--border-width-flat, var(--border-width))" } : undefined}
      >
        <span
          aria-hidden="true"
          className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center text-foreground [&>svg]:-m-0.5 [&>svg]:h-6 [&>svg]:w-6 [&>svg]:shrink-0"
        >
          {icon ?? <DefaultIcon />}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          {title && <p className="text-card-title font-semibold text-foreground">{title}</p>}
          {children && <div className="text-small text-muted">{children}</div>}
        </div>
      </div>
    </div>
  );
}
