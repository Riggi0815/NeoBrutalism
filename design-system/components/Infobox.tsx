import { ReactNode } from "react";
import { cn } from "../utils";
import { GAME_BG, gameColorStyle, type GameColor } from "./gameColors";

export interface InfoboxRow {
  label: string;
  value: ReactNode;
}

export interface InfoboxProps {
  /** Name of the thing: a character, an item, a place, the game itself. */
  title: string;
  /** Optional picture as an element (`<img>` or `next/image`). Give it a
   * real `alt`: the picture usually carries information here. */
  image?: ReactNode;
  /** Short line under the picture. */
  caption?: ReactNode;
  /** The facts, in the order a reader asks for them. 4–10 rows; more
   * belongs in the article text or a table. */
  rows: InfoboxRow[];
  /** Only for an exception: normally the color comes from a surrounding
   * GameTheme. Paints the title band. */
  color?: GameColor;
  className?: string;
}

/**
 * Fact box of a wiki article, like the box at the top right of an
 * encyclopedia page: title, optional picture, label–value rows.
 *
 * Quiet level: flat, no shadow, thin border (--border-width-flat). It is
 * information next to the text, not a layer — and on a long page every
 * shadow adds noise.
 *
 * Layout is the page's job: next to the article on wide screens (a grid
 * column or `lg:float-right lg:ml-8 lg:w-80`), on top of it on phones.
 *
 * Server Component.
 */
export function Infobox({ title, image, caption, rows, color, className }: InfoboxProps) {
  return (
    <aside
      aria-label={`Steckbrief: ${title}`}
      style={{ ...gameColorStyle(color), borderWidth: "var(--border-width-flat, var(--border-width))" }}
      className={cn("overflow-hidden rounded-brutal border-2 border-foreground bg-surface", className)}
    >
      <p
        className={cn(
          "border-b-2 border-foreground px-4 py-2.5 text-h4 font-bold text-balance text-foreground",
          GAME_BG,
        )}
        style={{ borderBottomWidth: "var(--border-width-flat, var(--border-width))" }}
      >
        {title}
      </p>
      {image && (
        <figure className="m-0 border-b border-foreground/25">
          <div className="aspect-[4/3] w-full bg-sand [&>img]:h-full [&>img]:w-full [&>img]:object-cover">
            {image}
          </div>
          {caption && (
            <figcaption className="px-4 py-2 text-small text-muted">{caption}</figcaption>
          )}
        </figure>
      )}
      <dl className="divide-y divide-foreground/25 px-4">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[minmax(6rem,40%)_1fr] gap-3 py-2.5">
            <dt className="text-small font-semibold text-muted">{row.label}</dt>
            <dd className="text-small text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
