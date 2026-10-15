import type { CSSProperties } from "react";

/**
 * Every game has exactly ONE color, picked from the palette. It is set
 * ONCE — with <GameTheme color="green"> around a game page — and every
 * game component inside picks it up: spine, art placeholder, BackSite
 * band, feature markers, Infobox title. Set three times by hand, it would
 * sooner or later say "blue" in one place.
 *
 * How: GameTheme writes two CSS custom properties, --game and
 * --game-soft, pointing at the palette tokens. The components only read
 * them (`bg-(--game)`), so it all stays Server Components — no React
 * Context needed, and nested themes just work (the inner one wins, as CSS
 * inheritance does). Without any theme the components fall back to sky.
 *
 * Palette, not roles: a game color is identity, not meaning — like the
 * `color` prop on Card and Avatar. Main actions stay `primary`.
 *
 * Text on the solid colors is always `text-foreground`: in Emaille every
 * palette color reaches at least 5.2:1 with it (orange is the lowest). If
 * you write a new style file, check foreground on all seven again.
 */
export const GAME_COLORS = ["green", "pink", "purple", "yellow", "blue", "orange", "sky"] as const;

export type GameColor = (typeof GAME_COLORS)[number];

/** Background classes that read the game color. Complete literals, so
 * Tailwind generates them; the fallback is the sky palette color. The
 * `color:` hint tells Tailwind and cn() this is a background COLOR, so it
 * can sit next to a background-image class without one dropping out. */
export const GAME_BG = "bg-[color:var(--game,var(--color-sky))]";
export const GAME_BG_SOFT = "bg-[color:var(--game-soft,var(--color-sky-soft))]";

/** Inline style that sets the game color on an element and everything
 * inside it. Returns undefined without a color, so the element inherits. */
export function gameColorStyle(color?: GameColor): CSSProperties | undefined {
  if (!color) return undefined;
  return {
    ["--game" as string]: `var(--color-${color})`,
    ["--game-soft" as string]: `var(--color-${color}-soft)`,
  };
}
