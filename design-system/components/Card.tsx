import { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "../utils";

/** One full class string per palette color and tone — Tailwind only
 * generates classes it can find as complete literals in the source (same
 * reason as Switch's table). `soft` = pastel tokens from tokens.css,
 * `solid` = the full palette color. */
const SURFACE_CLASSES = {
  soft: {
    green: "bg-green-soft",
    pink: "bg-pink-soft",
    purple: "bg-purple-soft",
    yellow: "bg-yellow-soft",
    blue: "bg-blue-soft",
    orange: "bg-orange-soft",
    destructive: "bg-destructive-soft",
  },
  solid: {
    green: "bg-green",
    pink: "bg-pink",
    purple: "bg-purple",
    yellow: "bg-yellow",
    blue: "bg-blue",
    orange: "bg-orange",
    destructive: "bg-destructive",
  },
} as const;

export type CardColor = keyof typeof SURFACE_CLASSES.soft;
export type CardTone = keyof typeof SURFACE_CLASSES;

/** Preset shadow levels, from the --offset-*-x / -y tokens in tokens.css. */
const SHADOW_SIZES = {
  small: "control",
  default: "raised",
  large: "floating",
} as const;
export type CardShadow = keyof typeof SHADOW_SIZES;

export interface CardProps {
  children: ReactNode;
  className?: string;
  /** Surface color as a palette name. Without it the card is white. */
  color?: CardColor;
  /** With `color`: `"soft"` (default) is the pastel tint, `"solid"` the
   * full palette color. Solid cards also switch CardDescription to
   * full-strength text, since muted gray reads poorly on saturated colors. */
  tone?: CardTone;
  /** Shadow preset: `"small"` (--offset-control), `"default"`
   * (--offset-raised) or `"large"` (--offset-floating). */
  shadow?: CardShadow;
  /** Horizontal hard-shadow offset in px. Overrides `shadow`. */
  shadowX?: number;
  /** Vertical hard-shadow offset in px. Overrides `shadow`. */
  shadowY?: number;
  /** Adds the standard inner padding (20px) around the content. */
  padding?: boolean;
  /** Quiet level for reading pages (wiki, long articles): no shadow and
   * the thinner --border-width-flat. Information lies flat; only what you
   * press casts a shadow. Overrides `shadow`, `shadowX`, `shadowY`. */
  flat?: boolean;
  id?: string;
  /**
   * Extra inline styles for the card surface (the inner, bordered box) —
   * e.g. ColorSwatchCard's gradient background.
   */
  style?: CSSProperties;
}

/**
 * Base Neo-Brutalism card: solid border, hard offset shadow (no blur),
 * 8px corner radius. Compose the content from CardHeader, CardTitle,
 * CardDescription and CardFooter, or put anything inside.
 *
 * The shadow is NOT a CSS `box-shadow`. box-shadow synthesizes a second,
 * independently-rasterized copy of the rounded silhouette and offsets it
 * via box-model math — at rounded corners the two curves (border vs.
 * shadow) don't align at the sub-pixel level in most browsers, leaving a
 * thin gap where the page background bleeds through (the same class of
 * bug as the color-bleed issue fixed in ColorSwatchCard, just between the
 * card and its own shadow instead of between nested elements).
 *
 * Instead, the shadow is a real element with the identical border-radius,
 * positioned via `transform: translate()`. A transform moves an already
 * -rasterized GPU layer pixel-accurately rather than making the browser
 * recompute two independent curves, which avoids the seam.
 */
export function Card({
  children,
  className,
  color,
  tone = "soft",
  shadow = "default",
  shadowX,
  shadowY,
  padding = false,
  flat = false,
  id,
  style,
}: CardProps) {
  const level = SHADOW_SIZES[shadow];
  const x = shadowX !== undefined ? `${shadowX}px` : `var(--offset-${level}-x)`;
  const y = shadowY !== undefined ? `${shadowY}px` : `var(--offset-${level}-y)`;

  // Card edge is a token too (tokens.css, "Kartenrand"): with --card-mask
  // set (e.g. the perforated stamp edge), the separate shadow layer can't
  // follow the cut-out shape, so it is hidden and a drop-shadow filter on
  // the wrapper draws the hard shadow along the real outline instead.
  return (
    <div
      id={id}
      className={cn("relative", className)}
      style={{ filter: flat ? "none" : "var(--card-filter, none)" }}
    >
      {!flat && (
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-brutal bg-shadow"
          style={{ transform: `translate(${x}, ${y})`, display: "var(--card-shadow-layer, block)" }}
        />
      )}
      {/* `group/card` + data-tone let CardDescription adapt to a solid
       * surface in plain CSS, so the parts stay Server Components. */}
      <div
        data-tone={color ? tone : undefined}
        className={cn(
          "group/card relative h-full rounded-brutal border-2 border-foreground overflow-hidden",
          color ? SURFACE_CLASSES[tone][color] : "bg-surface",
          padding && "p-5",
        )}
        style={{
          WebkitMask: "var(--card-mask, none)",
          mask: "var(--card-mask, none)",
          borderWidth: flat
            ? "var(--border-width-flat, var(--border-width))"
            : "var(--card-border-width, var(--border-width))",
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

/** Row at the top of a card: an icon (auto-sized to 20px) or Avatar next to
 * a CardTitle. Add `className="mb-4"` for more air below it. */
export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "mb-2 flex items-center gap-2 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:shrink-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface CardTitleProps {
  children: ReactNode;
  className?: string;
  /** Heading element, so the page outline stays correct. Default `h3`. */
  as?: Extract<ElementType, "h2" | "h3" | "h4" | "h5" | "h6">;
}

/** Card title: --text-card-title (= h4, 20px), semibold. */
export function CardTitle({ children, className, as: Tag = "h3" }: CardTitleProps) {
  return (
    <Tag className={cn("text-card-title font-semibold text-foreground", className)}>
      {children}
    </Tag>
  );
}

export interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

/** Card body text. Muted gray; full-strength on `tone="solid"` cards. The
 * space below it disappears when it is the last element. */
export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p
      className={cn(
        "mb-4 text-small text-muted last:mb-0",
        "group-data-[tone=solid]/card:text-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

/** Row for actions or tags below the text: buttons, badges, a form field.
 * Wraps onto several lines when it doesn't fit. */
export function CardFooter({ children, className }: CardFooterProps) {
  return <div className={cn("flex flex-wrap items-center gap-2", className)}>{children}</div>;
}
