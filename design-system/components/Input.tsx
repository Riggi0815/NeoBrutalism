"use client";

import { InputHTMLAttributes, ReactNode, forwardRef, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Rendered above the field. Independent of `icon` — set either, both,
   * or neither. */
  label?: string;
  /** Rendered at 16x16, before the field content. Always supplied by the
   * caller (e.g. icon={<Mail />}), the same way as everywhere else in
   * this library — nothing is hardcoded here, not even for
   * type="password" (pass icon={<Lock />} yourself if you want one). */
  icon?: ReactNode;
  /** Presence puts the field into its error state (red border + red
   * shadow) and renders this text below the field. */
  error?: string;
}

/** Hard-shadow offset for all inputs, per spec (x=4 y=4). */
const SHADOW_OFFSET = "raised";

/**
 * Neo-Brutalism text input. Same hard-shadow-as-a-real-element technique
 * as Card/Button/Badge (see Card.tsx for why box-shadow bleeds at rounded
 * corners) — but here it wraps the real <input> rather than a decorative
 * surface, so native typing/focus/autofill/IME behavior is untouched.
 *
 * The only built-in special case is type="password": it adds a trailing
 * show/hide toggle that flips the *rendered* type between "password" and
 * "text" (and swaps the eye icon) while the caller still just writes
 * type="password". Everything else — including the lock icon — is up to
 * the caller, exactly like every other icon in this library.
 *
 * This is the first component in the library that needs internal React
 * state (the visibility toggle), so it's the first one marked
 * "use client".
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, icon, error, className, disabled, type = "text", id, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const isPassword = type === "password";
  const hasError = Boolean(error);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={inputId} className="text-body font-bold text-foreground">
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
            "relative flex h-11 items-center gap-2 rounded-brutal border-2 px-4",
            "transition-transform duration-100 ease-out",
            disabled
              ? "border-disabled-foreground bg-disabled"
              : ["bg-surface", hasError ? "border-danger" : "border-foreground"],
            // focus-within (not peer-*): the <input>/<button> are this
            // div's CHILDREN, not its siblings, so peer-* would never
            // fire here — focus-within tracks focus on any descendant.
            // Focus = the same lift as Button's hover PLUS the same ring
            // as Button/Checkbox. The 2px lift alone was not a visible
            // focus indicator (WCAG 2.4.7) — the field looked unchanged.
            // The ring also shows on mouse focus, which is the norm for
            // text fields: you need to see where you're typing.
            !disabled &&
              "focus-within:-translate-x-0.5 focus-within:-translate-y-0.5 focus-within:ring-2 focus-within:ring-foreground focus-within:ring-offset-2 focus-within:ring-offset-background",
          )}
        >
          {icon && (
            <span
              aria-hidden="true"
              className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-muted [&>svg]:h-4 [&>svg]:w-4"
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={isPassword ? (visible ? "text" : "password") : type}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
            className={cn(
              "h-full min-w-0 flex-1 bg-transparent text-field text-foreground outline-none placeholder:text-muted",
              "disabled:cursor-not-allowed disabled:text-disabled-foreground disabled:placeholder:text-disabled-foreground",
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              disabled={disabled}
              tabIndex={disabled ? -1 : 0}
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "Passwort verbergen" : "Passwort anzeigen"}
              className={cn(
                "inline-flex h-4 w-4 shrink-0 items-center justify-center text-muted [&>svg]:h-4 [&>svg]:w-4",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm",
                "disabled:cursor-not-allowed",
              )}
            >
              {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          )}
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
