"use client";

import { InputHTMLAttributes, forwardRef, useId, useState } from "react";
import { cn } from "../utils";

/** One full class string per palette color — Tailwind only generates
 * classes it can find as complete literals in the source (same reason as
 * Switch's table and ColorText's). Add a color here to make it available. */
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

export type SliderColor = keyof typeof FILL_CLASSES;

export interface SliderProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "size" | "color" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step"
  > {
  /** Rendered top-left, above the bar. Without it pass `aria-label`. */
  label?: string;
  /** Fill color as a palette name. */
  color?: SliderColor;
  min?: number;
  max?: number;
  step?: number;
  /** Controlled: the current value. Pair with `onValueChange`. */
  value?: number;
  /** Uncontrolled: the starting value. Defaults to `min` (NOT the browser's
   * native midpoint — the drawn knob and the input have to agree on the
   * starting position, so it's explicit). */
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Show the value text top-right. Default true. */
  showValue?: boolean;
  /** What the top-right text (and `aria-valuetext`) shows. `"percent"`
   * (default): the position within min..max as a percentage ("60%").
   * `"value"`: the actual number ("150"), for ranges like max={200}. */
  display?: "percent" | "value";
  /** Appended to the value with a space when `display="value"`, e.g.
   * `unit="px"` → "150 px". Ignored for percent. */
  unit?: string;
  /** Full control over the text; overrides `display` and `unit`. */
  formatValue?: (value: number) => string;
}

/** Hard-shadow offset, per spec (x=2 y=2). */
const SHADOW_OFFSET = "control";
/** Knob diameter in px — also baked into the `h-5 w-5` classes below and the
 * calc()s, so change them together. */
const KNOB = 20;

/**
 * Neo-Brutalism slider. A REAL `<input type="range">` does all the work —
 * dragging, clicking the bar, touch, arrow/Home/End/PageUp/PageDown keys,
 * screen-reader semantics — but is made fully transparent and laid over a
 * drawn bar + knob, which are positioned from the current value. (Native
 * range inputs can't draw a filled portion or a hard shadow reliably across
 * browsers; drawing it ourselves matches how every other control here is
 * built.)
 *
 * The input's own (invisible) thumb is sized to the same 20px as the drawn
 * knob, so the browser's value<->position mapping — which keeps the thumb
 * centre inside [10px, width-10px] — lines up exactly with the drawing.
 * Verified in Chromium only; Firefox/Safari use the same standard thumb
 * pseudo-elements, but I haven't been able to test them.
 *
 * Needs state for the drawing, so it's a client component. Known
 * limitation: a surrounding <form>'s reset button resets the native input
 * but not the drawn knob.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    label,
    color = "accent",
    min = 0,
    max = 100,
    step,
    value,
    defaultValue,
    onValueChange,
    showValue = true,
    display = "percent",
    unit,
    formatValue,
    disabled,
    className,
    id,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [inner, setInner] = useState(defaultValue ?? min);
  const isControlled = value !== undefined;
  const current = isControlled ? value : inner;

  const range = max - min;
  const fraction = range > 0 ? Math.min(1, Math.max(0, (current - min) / range)) : 0;
  const valueText = formatValue
    ? formatValue(current)
    : display === "value"
      ? `${current}${unit ? ` ${unit}` : ""}`
      : `${Math.round(fraction * 100)}%`;

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      {(label || showValue) && (
        <div className="flex items-baseline justify-between gap-4">
          {label ? (
            <label htmlFor={inputId} className="text-body font-bold text-foreground">
              {label}
            </label>
          ) : (
            <span />
          )}
          {showValue && (
            <span aria-hidden="true" className="text-small text-muted">
              {valueText}
            </span>
          )}
        </div>
      )}

      {/* Disabled = neutral and flat (no shadow, gray border, gray fill),
       * same rule as Button/Checkbox. */}
      <div className="group/slider relative h-5 w-full">
        <div className="absolute inset-x-0 top-1 h-3">
          {!disabled && (
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-pill bg-shadow"
              style={{ transform: `translate(var(--offset-${SHADOW_OFFSET}-x), var(--offset-${SHADOW_OFFSET}-y))` }}
            />
          )}
          <span
            aria-hidden="true"
            className={cn(
              "relative block h-full w-full overflow-hidden rounded-pill border-2",
              disabled ? "border-disabled-foreground bg-disabled" : "border-foreground bg-surface",
            )}
          >
            {/* Ends at the knob's centre: inside the 2px border the usable
             * width is (100% - 16px) of knob travel + 8px (half knob minus
             * border). Hidden under the knob at both ends. */}
            <span
              className={cn(
                "absolute inset-y-0 left-0",
                disabled ? "bg-disabled-foreground/40" : FILL_CLASSES[color],
              )}
              style={{ width: `calc(8px + (100% - 16px) * ${fraction})` }}
            />
          </span>
        </div>

        <span
          aria-hidden="true"
          className={cn(
            "absolute top-0 h-5 w-5 rounded-pill border-2 bg-surface",
            disabled ? "border-disabled-foreground" : "border-foreground",
            "group-has-[input:focus-visible]/slider:ring-2 group-has-[input:focus-visible]/slider:ring-foreground group-has-[input:focus-visible]/slider:ring-offset-2 group-has-[input:focus-visible]/slider:ring-offset-background",
          )}
          style={{ left: `calc((100% - ${KNOB}px) * ${fraction})` }}
        />

        <input
          ref={ref}
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          {...(isControlled ? { value } : { defaultValue: defaultValue ?? min })}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (!isControlled) setInner(next);
            onValueChange?.(next);
          }}
          aria-valuetext={valueText}
          className={cn(
            "absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0",
            "disabled:cursor-not-allowed",
            "[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none",
            "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:border-0",
          )}
          {...props}
        />
      </div>
    </div>
  );
});
