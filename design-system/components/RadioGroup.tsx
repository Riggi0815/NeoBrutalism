"use client";

import { forwardRef, useId } from "react";
import { cn } from "../utils";

export interface RadioOption {
  value: string;
  label: string;
  /** Disables just this one option. */
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Group title, rendered above the options (bold, stays full-strength
   * even when the group is disabled). Without it, pass `aria-label` so
   * screen readers know what the group is. */
  label?: string;
  options: RadioOption[];
  /** Controlled: the selected option's value. Pair with `onValueChange`. */
  value?: string;
  /** Uncontrolled: the initially selected option's value. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Form field name. Generated if omitted — radios only behave as ONE
   * group (single selection, arrow-key navigation) because they share it. */
  name?: string;
  /** Disables every option; the selected one stays visibly selected. */
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

/** Hard-shadow offset for all radio buttons, per spec (x=2 y=2). */
const SHADOW_OFFSET = "control";

/**
 * Neo-Brutalism radio group. Same approach as Checkbox (see Checkbox.tsx):
 * REAL `<input type="radio">` elements, visually hidden with `sr-only`,
 * plus a drawn circle next to each — so single-selection, arrow-key
 * navigation, form submission and screen readers are all native. The
 * state-dependent styling is read off each option's <label> via
 * `group-has-[input:checked]/radio:` etc.
 *
 * Takes an `options` array like Select does, so the group-level concerns
 * (shared `name`, which one is selected, disabled) live in one place.
 * No internal state: uncontrolled mode uses the browser's own radio
 * state (`defaultChecked`), controlled mode feeds `checked` back in.
 *
 * A client component ("use client") even though it has no state: it
 * attaches an `onChange` handler to each <input> itself (to call
 * `onValueChange`), and a Server Component may not put event handlers on
 * elements. Checkbox/Textarea don't have this problem because they only
 * pass through handlers the caller supplies.
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  {
    label,
    options,
    value,
    defaultValue,
    onValueChange,
    name,
    disabled,
    className,
    "aria-label": ariaLabel,
  },
  ref,
) {
  const generatedId = useId();
  const labelId = `${generatedId}-label`;
  const groupName = name ?? generatedId;
  const isControlled = value !== undefined;

  return (
    <div ref={ref} className={cn("flex flex-col gap-3", className)}>
      {label && (
        <span id={labelId} className="text-body font-bold text-foreground">
          {label}
        </span>
      )}

      <div
        role="radiogroup"
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        className="flex flex-col gap-3"
      >
        {options.map((opt) => {
          const itemDisabled = disabled || opt.disabled;
          return (
            <label
              key={opt.value}
              className={cn(
                "group/radio inline-flex items-center gap-3 self-start",
                itemDisabled ? "cursor-not-allowed" : "cursor-pointer",
              )}
            >
              <input
                type="radio"
                name={groupName}
                value={opt.value}
                disabled={itemDisabled}
                className="sr-only"
                onChange={() => onValueChange?.(opt.value)}
                {...(isControlled
                  ? { checked: value === opt.value }
                  : { defaultChecked: defaultValue === opt.value })}
              />

              {/* Disabled = neutral and flat, same rule as Checkbox/Button. */}
              <span aria-hidden="true" className="relative inline-block h-5 w-5 shrink-0 rounded-pill">
                {!itemDisabled && (
                  <span
                    className="absolute inset-0 rounded-pill bg-shadow"
                    style={{ transform: `translate(var(--offset-${SHADOW_OFFSET}-x), var(--offset-${SHADOW_OFFSET}-y))` }}
                  />
                )}
                <span
                  className={cn(
                    "relative flex h-full w-full items-center justify-center rounded-pill border-2",
                    "transition-transform duration-100 ease-out",
                    itemDisabled
                      ? "border-disabled-foreground bg-disabled"
                      : "border-foreground bg-surface group-has-[input:checked]/radio:bg-secondary",
                    "group-has-[input:focus-visible]/radio:ring-2 group-has-[input:focus-visible]/radio:ring-foreground group-has-[input:focus-visible]/radio:ring-offset-2 group-has-[input:focus-visible]/radio:ring-offset-background",
                    // Same lift/press as Checkbox: 2px shadow -> 1px lift,
                    // 2px press closes the gap exactly.
                    !itemDisabled &&
                      "group-hover/radio:-translate-x-px group-hover/radio:-translate-y-px group-active/radio:translate-x-(--offset-control-x) group-active/radio:translate-y-(--offset-control-y)",
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full opacity-0 group-has-[input:checked]/radio:opacity-100",
                      itemDisabled ? "bg-disabled-foreground" : "bg-foreground",
                    )}
                  />
                </span>
              </span>

              <span
                className={cn(
                  "text-body",
                  itemDisabled ? "text-disabled-foreground" : "text-foreground",
                )}
              >
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
});
