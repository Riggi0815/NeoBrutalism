"use client";

import { forwardRef, useId } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /** Rendered above the field, same as Input/Textarea. */
  label?: string;
  /** Presence puts the field into its error state (red border + red
   * shadow) and renders this text below the field. */
  error?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
  className?: string;
}

/** Hard-shadow offset for the trigger AND the open dropdown panel, per
 * spec (x=4 y=4) — both get the same treatment as every other bordered
 * surface in this library. */
const SHADOW_OFFSET = "raised";

/**
 * Neo-Brutalism select. Unlike Input/Textarea, this isn't a styled native
 * element — a native <select>'s own popup can't be styled with our
 * border/shadow/radius system, and browsers don't expose whether it's
 * currently open, so there's no reliable way to swap the chevron icon on
 * open/close as spec'd. Built on @radix-ui/react-select instead: an
 * unstyled, accessible combobox/listbox primitive (keyboard nav, focus
 * management, click-outside, ARIA) that we skin entirely with our own
 * classes — same idea as using lucide-react for icons rather than
 * hand-drawing them.
 *
 * The chevron swap needs no extra state: Radix's Trigger carries a
 * `data-state="open"|"closed"` attribute automatically, and the trigger
 * is marked `group` so `group-data-[state=open]:` can show/hide each
 * icon in plain CSS.
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    label,
    error,
    placeholder = "Select an option...",
    options,
    value,
    defaultValue,
    onValueChange,
    disabled,
    name,
    className,
  },
  ref,
) {
  const generatedId = useId();
  const triggerId = generatedId;
  const errorId = `${triggerId}-error`;
  const hasError = Boolean(error);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={triggerId} className="text-body font-bold text-foreground">
          {label}
        </label>
      )}

      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        name={name}
      >
        {/* Disabled = neutral and flat (no shadow, sand fill, gray border
         * and text), same rule as Button and Input. */}
        <div className="relative inline-block rounded-brutal">
          {!disabled && (
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-0 rounded-brutal",
                hasError ? "bg-danger" : "bg-shadow",
              )}
              style={{ transform: `translate(var(--offset-${SHADOW_OFFSET}-x), var(--offset-${SHADOW_OFFSET}-y))` }}
            />
          )}
          <SelectPrimitive.Trigger
            ref={ref}
            id={triggerId}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
            className={cn(
              "group relative flex h-11 w-full items-center justify-between gap-2 rounded-brutal border-2 px-4 text-field outline-none",
              "transition-transform duration-100 ease-out",
              disabled
                ? "border-disabled-foreground bg-disabled text-disabled-foreground [&_*]:!text-disabled-foreground"
                : ["bg-surface text-foreground", hasError ? "border-danger" : "border-foreground"],
              // Same focus-lift language as Input/Textarea, but keyed off
              // Radix's own open state (data-[state=open]) instead of
              // focus-within — for a trigger button, "open" IS the
              // active/selected state that deserves the lift.
              !disabled && "data-[state=open]:-translate-x-0.5 data-[state=open]:-translate-y-0.5",
              // Keyboard focus: same ring as Button.
              "focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "disabled:cursor-not-allowed",
            )}
          >
            <SelectPrimitive.Value
              placeholder={placeholder}
              className="truncate text-left data-[placeholder]:text-muted"
            />
            <SelectPrimitive.Icon asChild>
              <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center text-muted [&>svg]:absolute [&>svg]:h-4 [&>svg]:w-4">
                <ChevronDown className="group-data-[state=open]:hidden" aria-hidden="true" />
                <ChevronUp className="hidden group-data-[state=open]:block" aria-hidden="true" />
              </span>
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
        </div>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={8}
            className="relative z-50"
          >
            {/* Same hard-shadow-as-a-real-element technique as Card/Input
             * (see Card.tsx) — Content itself stays a plain positioning
             * box; the shadow span and the actual bordered surface are
             * its children, exactly like every other component here. */}
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-brutal bg-shadow"
              style={{ transform: `translate(var(--offset-${SHADOW_OFFSET}-x), var(--offset-${SHADOW_OFFSET}-y))` }}
            />
            <div className="relative w-[var(--radix-select-trigger-width)] overflow-hidden rounded-brutal border-2 border-foreground bg-surface">
              <SelectPrimitive.ScrollUpButton className="flex h-6 items-center justify-center text-muted">
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              </SelectPrimitive.ScrollUpButton>
              <SelectPrimitive.Viewport className="p-1">
                {options.map((opt) => (
                  <SelectPrimitive.Item
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm py-2 pl-3 pr-8 text-field text-foreground outline-none",
                      "data-[highlighted]:bg-selected",
                      "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
                    )}
                  >
                    <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator className="absolute right-2 inline-flex h-4 w-4 items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
                      <Check aria-hidden="true" />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
              <SelectPrimitive.ScrollDownButton className="flex h-6 items-center justify-center text-muted">
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </SelectPrimitive.ScrollDownButton>
            </div>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {hasError && (
        <p id={errorId} className={cn("text-small font-medium text-danger-ink")}>
          {error}
        </p>
      )}
    </div>
  );
});
