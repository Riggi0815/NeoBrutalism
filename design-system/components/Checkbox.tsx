import { InputHTMLAttributes, forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "../utils";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  /** Rendered to the right of the box and clickable (toggles the box).
   * Optional — without it you get just the bare 20x20 box, in which case
   * pass an `aria-label` so screen readers know what it is (same rule as
   * an icon-only Button). Fades together with the box when `disabled`. */
  label?: string;
}

/** Hard-shadow offset for all checkboxes, per spec (x=2 y=2). */
const SHADOW_OFFSET = "control";

/**
 * Neo-Brutalism checkbox. Built on a REAL `<input type="checkbox">` (kept
 * in the accessibility tree and focusable, just visually hidden via
 * `sr-only`) with the visible box drawn next to it — so native form
 * behavior, keyboard (Space) and screen readers work for free.
 *
 * The outer <label> is the `group/cb`: hover/press/checked/focus state is
 * read off it with `group-hover/cb:` and `group-has-[input:checked]/cb:`
 * etc. (`has()` rather than `peer-*:` because the icon lives INSIDE the
 * surface, not as a sibling of the input — same sibling-vs-descendant
 * trap as Input's `focus-within`).
 *
 * Same hard-shadow-as-a-real-element technique as the other components
 * (see Card.tsx), at a smaller 2px offset. Hover lifts the box out of its
 * shadow like Button; a focus ring appears for keyboard focus only
 * (`:focus-visible`), so mouse users never see it.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, disabled, ...props },
  ref,
) {
  return (
    <label
      className={cn(
        "group/cb inline-flex items-center gap-3",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <input ref={ref} type="checkbox" disabled={disabled} className="sr-only" {...props} />

      {/* Disabled = neutral and flat (no shadow, sand fill, gray border
       * and tick), the same rule as Button — instead of fading the colored
       * box, which only made it look like a paler color. */}
      <span aria-hidden="true" className="relative inline-block h-5 w-5 shrink-0 rounded-brutal-sm">
        {!disabled && (
          <span
            className="absolute inset-0 rounded-brutal-sm bg-shadow"
            style={{ transform: `translate(var(--offset-${SHADOW_OFFSET}-x), var(--offset-${SHADOW_OFFSET}-y))` }}
          />
        )}
        <span
          className={cn(
            "relative flex h-full w-full items-center justify-center rounded-brutal-sm border-2",
            "transition-transform duration-100 ease-out",
            disabled
              ? "border-disabled-foreground bg-disabled"
              : "border-foreground bg-surface group-has-[input:checked]/cb:bg-primary",
            "group-has-[input:focus-visible]/cb:ring-2 group-has-[input:focus-visible]/cb:ring-foreground group-has-[input:focus-visible]/cb:ring-offset-2 group-has-[input:focus-visible]/cb:ring-offset-background",
            // Shadow offset is 2px, so lift is 1px and press (2px) closes
            // the gap exactly — Button's -0.5/+1 scaled to this shadow.
            !disabled &&
              "group-hover/cb:-translate-x-px group-hover/cb:-translate-y-px group-active/cb:translate-x-(--offset-control-x) group-active/cb:translate-y-(--offset-control-y)",
          )}
        >
          <Check
            aria-hidden="true"
            strokeWidth={3}
            className={cn(
              "h-4 w-4 opacity-0 group-has-[input:checked]/cb:opacity-100",
              disabled ? "text-disabled-foreground" : "text-primary-foreground",
            )}
          />
        </span>
      </span>

      {label && (
        <span className={cn("text-body", disabled ? "text-disabled-foreground" : "text-foreground")}>
          {label}
        </span>
      )}
    </label>
  );
});
