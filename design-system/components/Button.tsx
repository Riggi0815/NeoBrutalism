import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ElementType,
  ReactNode,
  forwardRef,
} from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "destructive"
  | "outline"
  | "ghost";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Replaces the content with a spinner + "Loading" and disables the button. */
  loading?: boolean;
  /** Rendered at 16x16, before the label. Ignored for size="icon" (the
   * icon itself IS the button content there). */
  icon?: ReactNode;
  children?: ReactNode;
}

/** Hard-shadow offset for all buttons, per spec (x=4 y=4). Also the
 * distance the surface travels on `:active` so it lands exactly on top
 * of the shadow layer, hiding it — the "pressed flat" look. */
const SHADOW_OFFSET = "raised";

const VARIANT_SURFACE_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary border-2 border-foreground text-primary-foreground",
  secondary: "bg-secondary border-2 border-foreground text-secondary-foreground",
  accent: "bg-accent border-2 border-foreground text-accent-foreground",
  // Dark red with white text (6.2:1) — deliberately far from primary, so a
  // delete action never looks like the normal main action.
  destructive: "bg-danger border-2 border-foreground text-danger-foreground",
  outline: "bg-surface border-2 border-foreground text-foreground",
  ghost: "bg-transparent text-foreground",
};

/** Ghost has neither border nor shadow (per spec), so it skips the
 * shadow-layer sandwich entirely and is just a flat, hover-tinted button. */
const HAS_SHADOW: Record<ButtonVariant, boolean> = {
  primary: true,
  secondary: true,
  accent: true,
  destructive: true,
  outline: true,
  ghost: false,
};

/**
 * Height is fixed per size (32 / 44 / 56 — whole pixels, on the 4px grid);
 * width comes from padding + content, so long labels don't get clipped.
 * The icon-only button uses the md height, so it lines up with a md
 * button next to it.
 */
const SIZE_CLASSES: Record<Exclude<ButtonSize, "icon">, string> = {
  sm: "h-8 px-3 text-small gap-1.5",
  md: "h-11 px-5 text-body gap-2",
  lg: "h-14 px-6 text-body gap-2",
};

/** Disabled: neutral and flat. No shadow, because a shadow means "you
 * can press this" — and a faded pink read like a separate salmon color. */
const DISABLED_SURFACE =
  "bg-disabled border-2 border-disabled-foreground text-disabled-foreground";

/**
 * Neo-Brutalism button. Uses the same hard-shadow-as-a-real-element
 * technique as Card (see Card.tsx for why: CSS box-shadow bleeds at
 * rounded corners), but here the surface also animates on hover/active:
 * it lifts slightly on hover (moves away from the static shadow layer,
 * revealing more of it) and lands exactly on the shadow's offset on
 * `:active` (hiding it completely) for a "pressed into the page" feel.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      children,
      className,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) {
    const isIconOnly = size === "icon";
    const isDisabled = Boolean(disabled) || loading;
    // Only a real `disabled` button goes neutral and flat. Loading keeps
    // its variant color and shadow — it's an in-progress action, not an
    // inactive one.
    const dimmed = Boolean(disabled);
    const hasShadow = HAS_SHADOW[variant] && !dimmed;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "relative inline-block rounded-brutal",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isDisabled ? "cursor-not-allowed" : "cursor-pointer",
          className,
        )}
        {...props}
      >
        {hasShadow && (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-brutal bg-shadow"
            style={{
              transform: `translate(var(--offset-${SHADOW_OFFSET}-x), var(--offset-${SHADOW_OFFSET}-y))`,
            }}
          />
        )}
        <span
          className={cn(
            "relative inline-flex select-none items-center justify-center whitespace-nowrap rounded-brutal font-bold transition-transform duration-100 ease-out",
            dimmed && variant !== "ghost"
              ? DISABLED_SURFACE
              : VARIANT_SURFACE_CLASSES[variant],
            dimmed && variant === "ghost" && "text-disabled-foreground",
            isIconOnly
              ? "h-11 w-11 shrink-0"
              : SIZE_CLASSES[size as Exclude<ButtonSize, "icon">],
            hasShadow &&
              !isDisabled &&
              "hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-(--offset-raised-x) active:translate-y-(--offset-raised-y)",
            variant === "ghost" &&
              !isDisabled &&
              "hover:bg-foreground/5 active:bg-foreground/10",
          )}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
              {!isIconOnly && <span>Loading</span>}
            </>
          ) : (
            <>
              {icon && (
                <span
                  aria-hidden="true"
                  className="inline-flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4"
                >
                  {icon}
                </span>
              )}
              {!isIconOnly && children}
            </>
          )}
        </span>
      </button>
    );
  },
);

export interface ButtonLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  /** Where the link goes. Required — a link without a target is a button. */
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Rendered at 16x16, before the label. With size="icon" it IS the
   * content — then give the link an `aria-label`. */
  icon?: ReactNode;
  children?: ReactNode;
  /** The element to render. Default `a`. For navigation inside a Next.js
   * app without a full reload pass `next/link`'s Link: `as={Link}`. */
  as?: ElementType;
}

/**
 * A link that looks exactly like Button. Use it whenever clicking takes
 * you somewhere — a store page, a trailer, a download, another page — and
 * Button only when it DOES something on this page (save, open, toggle).
 *
 * Why not just Button with an onClick that navigates: a real link can be
 * opened in a new tab, copied, middle-clicked, and search engines follow
 * it. A `<button>` can't do any of that.
 *
 * Same classes and the same shadow-as-a-real-element as Button (see
 * Card.tsx for why), taken from the tables above, so both always match.
 *
 * No `disabled` and no `loading`: a link can't be disabled. If the target
 * isn't available yet ("Demo kommt bald"), show text or a disabled Button
 * instead of a link that goes nowhere.
 *
 * `target="_blank"` gets `rel="noopener noreferrer"` automatically unless
 * you pass your own `rel`.
 *
 * Server Component (no state, no handlers of its own).
 */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  icon,
  children,
  className,
  target,
  rel,
  as: Tag = "a",
  ...props
}: ButtonLinkProps) {
  const isIconOnly = size === "icon";
  const hasShadow = HAS_SHADOW[variant];

  return (
    <Tag
      href={href}
      target={target}
      rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
      className={cn(
        "group relative inline-block rounded-brutal no-underline",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    >
      {hasShadow && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-brutal bg-shadow"
          style={{
            transform: `translate(var(--offset-${SHADOW_OFFSET}-x), var(--offset-${SHADOW_OFFSET}-y))`,
          }}
        />
      )}
      <span
        className={cn(
          "relative inline-flex select-none items-center justify-center whitespace-nowrap rounded-brutal font-bold transition-transform duration-100 ease-out motion-reduce:transition-none",
          VARIANT_SURFACE_CLASSES[variant],
          isIconOnly
            ? "h-11 w-11 shrink-0"
            : SIZE_CLASSES[size as Exclude<ButtonSize, "icon">],
          hasShadow &&
            "group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-active:translate-x-(--offset-raised-x) group-active:translate-y-(--offset-raised-y)",
          variant === "ghost" &&
            "group-hover:bg-foreground/5 group-active:bg-foreground/10",
        )}
      >
        {icon && (
          <span
            aria-hidden="true"
            className="inline-flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4"
          >
            {icon}
          </span>
        )}
        {!isIconOnly && children}
      </span>
    </Tag>
  );
}
