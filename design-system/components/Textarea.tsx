import { TextareaHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "../utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Rendered above the field, bold black — stays black even in the error
   * state, deliberately matching Input's label (not the red label shown
   * in one of the reference screenshots; see Input.tsx for the reasoning:
   * only the border/shadow/message go red, to keep the two form fields
   * behaving identically). */
  label?: string;
  /** Presence puts the field into its error state (red border + red
   * shadow) and renders this text below the field. */
  error?: string;
}

/** Hard-shadow offset for all textareas, per spec (x=4 y=4). */
const SHADOW_OFFSET = "raised";

/**
 * Neo-Brutalism textarea. Same hard-shadow-as-a-real-element technique and
 * focus-lift behavior as Input (see Input.tsx) — this is effectively
 * Input's multi-line sibling: no icon, no password-style toggle, just a
 * taller field. Unlike Input, this one needs no internal state, so it's
 * not a client component.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, disabled, id, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;
  const hasError = Boolean(error);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={textareaId} className="text-body font-bold text-foreground">
          {label}
        </label>
      )}

      {/* Disabled = neutral and flat: no shadow, sand fill, gray border
       * and text — the same rule as Button. (Fading the whole field to
       * 40% only made it look like a paler, still-active field.) */}
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
        <div
          className={cn(
            "relative flex h-32 rounded-brutal border-2 px-4 py-3",
            "transition-transform duration-100 ease-out",
            disabled
              ? "border-disabled-foreground bg-disabled"
              : ["bg-surface", hasError ? "border-danger" : "border-foreground"],
            // Same focus as Input: lift + ring — see Input.tsx. focus-within
            // (not peer-*) because the <textarea> is this div's CHILD.
            !disabled &&
              "focus-within:-translate-x-0.5 focus-within:-translate-y-0.5 focus-within:ring-2 focus-within:ring-foreground focus-within:ring-offset-2 focus-within:ring-offset-background",
          )}
        >
          <textarea
            ref={ref}
            id={textareaId}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
            className={cn(
              // resize-none: the shadow layer is sized via `absolute
              // inset-0` off this wrapper's own box, which only tracks
              // the wrapper's natural (content-driven) size — not a
              // size the browser's native resize-drag handle changes
              // out from under it. Disabling resize sidesteps that
              // mismatch entirely rather than relying on it happening
              // to still line up.
              "h-full w-full resize-none bg-transparent text-field text-foreground outline-none placeholder:text-muted",
              "disabled:cursor-not-allowed disabled:text-disabled-foreground disabled:placeholder:text-disabled-foreground",
            )}
            {...props}
          />
        </div>
      </div>

      {hasError && (
        <p id={errorId} className={cn("text-small font-medium text-danger-ink")}>
          {error}
        </p>
      )}
    </div>
  );
});
