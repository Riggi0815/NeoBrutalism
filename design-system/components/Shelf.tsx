import { ReactNode } from "react";
import { cn } from "../utils";
import { GAME_BG, gameColorStyle, type GameColor } from "./gameColors";

export interface ShelfProps {
  /** ShelfSpine elements, oldest first — the shelf grows to the right. */
  children: ReactNode;
  /** Accessible name of the list. Default "Spiele". */
  "aria-label"?: string;
  className?: string;
}

/**
 * Game overview as a shelf: every game is a case spine standing on one
 * board. Pointing at a spine (or tabbing to it) pulls it out of the shelf.
 *
 * Below `sm` the spines turn into horizontal strips stacked on top of each
 * other — vertical text on a phone is hard to read, and nine 72px spines
 * don't fit next to each other anyway.
 *
 * More than about 12 games: put a second Shelf below instead of letting
 * one scroll sideways.
 *
 * Server Component — the pull-out is pure CSS.
 */
export function Shelf({ children, "aria-label": ariaLabel = "Spiele", className }: ShelfProps) {
  return (
    <div className={cn("w-full", className)}>
      <ul
        aria-label={ariaLabel}
        className="flex flex-col gap-3 sm:min-h-80 sm:flex-row sm:items-end sm:gap-2 sm:px-4 sm:pt-6"
      >
        {children}
      </ul>
      {/* The board. Same color as borders and shadows, so a spine's shadow
       * runs into it instead of drawing a second edge. Desktop only. */}
      <div
        aria-hidden="true"
        className="hidden h-5 rounded-brutal-sm border-2 border-foreground bg-foreground sm:block"
      />
    </div>
  );
}

export interface ShelfSpineProps {
  /** Game title, printed along the spine. */
  title: string;
  /** Release year (or "2027", "TBA" …), printed at the top of the spine. */
  year?: string;
  /** The game's color. On a shelf every spine is a different game, so
   * here you DO set it per spine. Without it the spine inherits a
   * surrounding GameTheme, else sky. Ignored for `placeholder`. */
  color?: GameColor;
  /** Link to the game page. Without it the spine is not clickable. */
  href?: string;
  /** Spine height in px on desktop (240–320 looks natural). Varying it a
   * little between games makes the shelf look real. Default 280. */
  height?: number;
  /** Dashed, empty spine for an announced game. Not a link, no shadow. */
  placeholder?: boolean;
  className?: string;
}

/**
 * One case spine. A link with a hard shadow (it is pressable — see the
 * shadow rule in tokens.css). On hover/focus the surface slides up out of
 * the shelf and the shadow layer stays behind, so a dark slot shows where
 * the case stood.
 *
 * Plain `<a>`, so it stays a Server Component and works outside Next.js.
 * For client-side navigation swap the `<a>` for `next/link`'s `Link`.
 */
export function ShelfSpine({
  title,
  year,
  color,
  href,
  height = 280,
  placeholder = false,
  className,
}: ShelfSpineProps) {
  const surface = (
    <span
      className={cn(
        "relative flex h-full items-center gap-3 rounded-brutal border-2 px-4 py-3",
        "sm:flex-col sm:justify-between sm:rounded-b-none sm:border-b-0 sm:px-0",
        placeholder
          ? "border-dashed border-muted bg-transparent text-muted"
          : cn("border-foreground text-foreground", GAME_BG),
        href &&
          !placeholder &&
          "transition-transform duration-150 ease-out motion-reduce:transition-none group-hover:-translate-y-1 group-focus-visible:-translate-y-1 sm:group-hover:-translate-y-6 sm:group-focus-visible:-translate-y-6",
      )}
    >
      {year && <span className="shrink-0 text-badge font-bold">{year}</span>}
      <span className="min-w-0 flex-1 truncate text-h4 font-bold sm:flex sm:rotate-180 sm:items-center sm:[writing-mode:vertical-rl]">
        {title}
      </span>
      {/* Round label at the foot, like the sticker on a case spine. */}
      <span
        aria-hidden="true"
        className={cn(
          "hidden h-7 w-7 shrink-0 rounded-full border-2 sm:block",
          placeholder ? "border-dashed border-muted" : "border-foreground",
        )}
      />
    </span>
  );

  const shadow = !placeholder && href && (
    <span
      aria-hidden="true"
      className="absolute inset-0 rounded-brutal bg-shadow sm:rounded-b-none"
      style={{ transform: "translate(var(--offset-raised-x), var(--offset-raised-y))" }}
    />
  );

  return (
    <li
      className={cn("relative sm:w-[72px] sm:shrink-0 sm:[height:var(--spine-h)]", className)}
      style={{ ["--spine-h" as string]: `${height}px`, ...gameColorStyle(color) }}
    >
      {href && !placeholder ? (
        <a
          href={href}
          className="group relative block h-full rounded-brutal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {shadow}
          {surface}
        </a>
      ) : (
        <div className="relative h-full">{surface}</div>
      )}
    </li>
  );
}
