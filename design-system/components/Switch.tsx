import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../utils";

/** One full class string per palette color — Tailwind only generates
 * classes it can find as complete literals in the source, so these can't
 * be built from a `color` variable at runtime (same reason ColorText has
 * a lookup table). Add a color here to make it available. */
const ON_COLOR_CLASSES = {
  /** Role token from tokens.css — follows the theme. Default. */
  accent: "group-has-[input:checked]/switch:bg-accent",
  green: "group-has-[input:checked]/switch:bg-green",
  pink: "group-has-[input:checked]/switch:bg-pink",
  purple: "group-has-[input:checked]/switch:bg-purple",
  yellow: "group-has-[input:checked]/switch:bg-yellow",
  blue: "group-has-[input:checked]/switch:bg-blue",
  orange: "group-has-[input:checked]/switch:bg-orange",
  destructive: "group-has-[input:checked]/switch:bg-destructive",
} as const;

export type SwitchColor = keyof typeof ON_COLOR_CLASSES;

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "color"> {
  /** Rendered to the right of the switch and clickable (toggles it).
   * Optional — without it pass an `aria-label` so screen readers know
   * what the switch controls. Fades together with the switch when
   * `disabled`. */
  label?: string;
  /** Track color while ON, as a palette name. The OFF color is always
   * `sand` (#E8E0D4). */
  color?: SwitchColor;
}

/** Hard-shadow offset for all switches, per spec (x=2 y=2). */
const SHADOW_OFFSET = "control";

/**
 * Neo-Brutalism switch (toggle). Same construction as Checkbox (see
 * Checkbox.tsx): a REAL `<input type="checkbox">` — with `role="switch"`
 * so assistive tech announces it as an on/off switch — visually hidden via
 * `sr-only`, plus a drawn track and knob next to it. Native form behavior,
 * Space to toggle and focus handling come for free, and there's no state
 * here: the on/off look is read straight off the input via
 * `group-has-[input:checked]/switch:`.
 *
 * Geometry: 48x28 track with a 2px border leaves a 44x24 inner area; the
 * 20x20 knob sits 2px from every edge and slides 20px to the right when
 * checked, ending 2px from the right edge.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, color = "accent", className, disabled, ...props },
  ref,
) {
  return (
    <label
      className={cn(
        "group/switch inline-flex items-center gap-3",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        disabled={disabled}
        className="sr-only"
        {...props}
      />

      {/* Disabled = neutral and flat (no shadow, gray border, sand track),
       * same rule as Button/Checkbox. On/off still reads from the knob's
       * position. */}
      <span aria-hidden="true" className="relative inline-block h-7 w-12 shrink-0 rounded-pill">
        {!disabled && (
          <span
            className="absolute inset-0 rounded-pill bg-shadow"
            style={{ transform: `translate(var(--offset-${SHADOW_OFFSET}-x), var(--offset-${SHADOW_OFFSET}-y))` }}
          />
        )}
        <span
          className={cn(
            "relative block h-full w-full rounded-pill border-2 bg-sand",
            "transition-transform duration-100 ease-out",
            disabled ? "border-disabled-foreground" : ["border-foreground", ON_COLOR_CLASSES[color]],
            "group-has-[input:focus-visible]/switch:ring-2 group-has-[input:focus-visible]/switch:ring-foreground group-has-[input:focus-visible]/switch:ring-offset-2 group-has-[input:focus-visible]/switch:ring-offset-background",
            // Same lift/press as Checkbox/Radio (2px shadow -> 1px lift,
            // 2px press closes the gap exactly).
            !disabled &&
              "group-hover/switch:-translate-x-px group-hover/switch:-translate-y-px group-active/switch:translate-x-(--offset-control-x) group-active/switch:translate-y-(--offset-control-y)",
          )}
        >
          <span
            className={cn(
              "absolute left-0.5 top-0.5 h-5 w-5 rounded-pill border-2 bg-surface",
              disabled ? "border-disabled-foreground" : "border-foreground",
              "transition-transform duration-150 ease-out",
              "group-has-[input:checked]/switch:translate-x-5",
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
