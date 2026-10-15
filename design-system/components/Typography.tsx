import { ReactNode } from "react";
import { cn } from "../utils";

interface TextElementProps {
  children: ReactNode;
  className?: string;
}

/** Hero-sized headline (49px, tight leading and tracking) — the one place
 * per page where the style is allowed to be loud. Renders an <h1>; pass
 * `as` for another level. */
export function Display({
  children,
  className,
  as: Tag = "h1",
}: TextElementProps & { as?: "h1" | "h2" | "p" }) {
  return (
    <Tag className={cn("text-display font-bold text-balance text-foreground", className)}>
      {children}
    </Tag>
  );
}

export function Heading1({ children, className }: TextElementProps) {
  return (
    <h1 className={cn("text-h1 font-bold text-balance text-foreground", className)}>
      {children}
    </h1>
  );
}

export function Heading2({ children, className }: TextElementProps) {
  return (
    <h2 className={cn("text-h2 font-bold text-balance text-foreground", className)}>
      {children}
    </h2>
  );
}

export function Heading3({ children, className }: TextElementProps) {
  return (
    <h3 className={cn("text-h3 font-bold text-balance text-foreground", className)}>
      {children}
    </h3>
  );
}

export function Heading4({ children, className }: TextElementProps) {
  return (
    <h4 className={cn("text-h4 font-semibold text-foreground", className)}>
      {children}
    </h4>
  );
}

export function Text({ children, className }: TextElementProps) {
  return (
    <p className={cn("text-body text-foreground", className)}>{children}</p>
  );
}

export function MutedText({ children, className }: TextElementProps) {
  return (
    <p className={cn("text-body text-muted", className)}>{children}</p>
  );
}

/** Explicit map (not string interpolation) so Tailwind's scanner can see
 * every class name literally and never purges it.
 *
 * Uses the darker `-ink` tones, not the palette colors themselves: as
 * text, pink/green/blue/yellow only reached 1.8–2.5:1 on the background.
 * The ink tones are ≥ 4.9:1 on background and surface (WCAG AA). */
const COLOR_TEXT_CLASSES = {
  pink: "text-pink-ink",
  purple: "text-purple-ink",
  green: "text-green-ink",
  yellow: "text-yellow-ink",
  blue: "text-blue-ink",
  orange: "text-orange-ink",
} as const;

export type ColorTextColor = keyof typeof COLOR_TEXT_CLASSES;

export function ColorText({
  color,
  children,
  className,
}: TextElementProps & { color: ColorTextColor }) {
  return (
    <span
      className={cn(
        "text-small font-medium",
        COLOR_TEXT_CLASSES[color],
        className
      )}
    >
      {children}
    </span>
  );
}
