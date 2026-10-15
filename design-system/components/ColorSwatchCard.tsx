"use client";

import { useEffect, useRef } from "react";
import { Card } from "./Card";
import { Text, MutedText } from "./Typography";

/**
 * CSS custom properties, not Tailwind bg-* classes, on purpose: the swatch
 * color is painted as part of a single gradient on the Card itself (see
 * below), not as a separately clipped child element.
 */
const SWATCH_VALUES = {
  pink: "var(--color-pink)",
  purple: "var(--color-purple)",
  green: "var(--color-green)",
  yellow: "var(--color-yellow)",
  blue: "var(--color-blue)",
  orange: "var(--color-orange)",
  sky: "var(--color-sky)",
  background: "var(--color-background)",
  foreground: "var(--color-foreground)",
  // Role tokens (what a color means) — see tokens.css.
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  accent: "var(--color-accent)",
  danger: "var(--color-danger)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  info: "var(--color-info)",
  selected: "var(--color-selected)",
} as const;

export type SwatchColor = keyof typeof SWATCH_VALUES;

export interface ColorSwatchCardProps {
  name: string;
  /** Text under the name. Leave it out to show the color's current hex
   * value, read live from the active tokens.css — so the swatches stay
   * correct when you switch styles. */
  hex?: string;
  color: SwatchColor;
}

/** Writes the resolved value of a CSS color token (as #RRGGBB) into the
 * referenced element after mount. Server render shows the token name.
 * Updates the DOM directly instead of state: it is a read-out of the
 * stylesheet, not React data. */
function useLiveHex(color: SwatchColor) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const probe = document.createElement("span");
    probe.style.color = `var(--color-${color})`;
    document.body.appendChild(probe);
    const rgb = getComputedStyle(probe).color.match(/\d+(\.\d+)?/g)?.slice(0, 3).map(Number);
    probe.remove();
    if (rgb) el.textContent = "#" + rgb.map((n) => Math.round(n).toString(16).padStart(2, "0")).join("").toUpperCase();
  }, [color]);
  return ref;
}

/**
 * Color palette card: colored swatch on top, name (body text) + hex
 * (muted text) below. Built on top of Card with the small (control)
 * shadow used for every card in the Color Palette section.
 *
 * The swatch + divider + white panel are painted as ONE linear-gradient
 * background on the Card itself, rather than as a separate nested div.
 * Two independently-rounded/clipped elements meeting at a rounded corner
 * cause a 1px anti-aliasing color bleed in most browsers; a single
 * gradient on a single rounded element has only one rasterization pass,
 * so the bleed can't occur. --swatch-h carries the responsive height
 * (80px / 96px from sm:) into the gradient's hard color stops.
 */
export function ColorSwatchCard({ name, hex, color }: ColorSwatchCardProps) {
  const c = SWATCH_VALUES[color];
  const liveHexRef = useLiveHex(color);

  return (
    <Card
      shadow="small"
      className="flex flex-col [--swatch-h:80px] sm:[--swatch-h:96px]"
      style={{
        backgroundImage: `linear-gradient(to bottom,
          ${c} 0, ${c} var(--swatch-h),
          var(--color-foreground) var(--swatch-h), var(--color-foreground) calc(var(--swatch-h) + var(--border-width)),
          var(--color-surface) calc(var(--swatch-h) + var(--border-width)), var(--color-surface) 100%)`,
      }}
    >
      <div style={{ height: "calc(var(--swatch-h) + var(--border-width))" }} />
      <div className="flex flex-col gap-0.5 p-3">
        <Text>{name}</Text>
        <MutedText>{hex ?? <span ref={liveHexRef}>{`--color-${color}`}</span>}</MutedText>
      </div>
    </Card>
  );
}
