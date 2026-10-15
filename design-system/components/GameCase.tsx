import { ReactNode } from "react";
import { CircleCheck, CircleDashed, CircleDot } from "lucide-react";
import { cn } from "../utils";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { GAME_BG, gameColorStyle, type GameColor } from "./gameColors";

export type GameStatus = "development" | "demo" | "released";

/** Status differs by icon AND text, never by color alone: empty, half,
 * full circle. All three use the outline badge on purpose — the status is
 * information, not a call to action. */
const STATUS: Record<GameStatus, { label: string; icon: ReactNode }> = {
  development: { label: "In Entwicklung", icon: <CircleDashed /> },
  demo: { label: "Demo spielbar", icon: <CircleDot /> },
  released: { label: "Erschienen", icon: <CircleCheck /> },
};

export interface GameCaseProps {
  /** Game title. Rendered as the page's `<h1>`. */
  title: string;
  /** ONE sentence that says what you do in the game. */
  pitch: string;
  /** Key art in 3:4, as an element — `<img>` or `next/image`'s `Image`
   * with `fill` and `className="object-cover"`. Without it a striped
   * placeholder in the game color shows format and minimum size. */
  art?: ReactNode;
  /** Game logo instead of the typed title. The `<h1>` keeps the title as
   * text for screen readers and search engines. */
  logo?: ReactNode;
  status?: GameStatus;
  /** Only for an exception: normally the color comes from a surrounding
   * GameTheme. Used for the art placeholder. */
  color?: GameColor;
  /** Buttons. Exactly one `variant="primary"` (e.g. "Auf Steam auf die
   * Wunschliste"), the rest `outline`. */
  actions?: ReactNode;
  className?: string;
}

/**
 * Head of a game page, built like a game case: the key art on the left as
 * the front cover, title, pitch and actions next to it. Below `md` the art
 * sits on top, at most 320px wide.
 *
 * Server Component. Actions with `onClick` need their own small Client
 * Component (see WIKI, "Server- vs. Client-Components") — links don't.
 */
export function GameCase({
  title,
  pitch,
  art,
  logo,
  status,
  color,
  actions,
  className,
}: GameCaseProps) {
  return (
    <section
      style={gameColorStyle(color)}
      className={cn(
        "grid items-center gap-8 md:grid-cols-[minmax(240px,360px)_1fr] md:gap-12",
        className,
      )}
    >
      <Card shadow="large" className="aspect-3/4 w-full max-w-80 md:max-w-none">
        {art ? (
          <div className="relative h-full w-full [&>img]:h-full [&>img]:w-full [&>img]:object-cover">
            {art}
          </div>
        ) : (
          <div
            role="img"
            aria-label={`Platzhalter für die Key Art von ${title}`}
            className={cn(
              "flex h-full items-end p-3",
              GAME_BG,
              "bg-[repeating-linear-gradient(135deg,transparent_0_14px,rgb(0_0_0/0.08)_14px_28px)]",
            )}
          >
            <span className="rounded-brutal-sm border-2 border-foreground bg-surface px-2 py-1 text-badge font-bold text-foreground">
              Key Art 3:4, mind. 1200 × 1600 px
            </span>
          </div>
        )}
      </Card>

      <div className="flex flex-col items-start gap-5">
        {status && (
          <Badge variant="outline" icon={STATUS[status].icon}>
            {STATUS[status].label}
          </Badge>
        )}
        {logo ? (
          <h1 className="max-w-md">
            <span className="sr-only">{title}</span>
            <span
              aria-hidden="true"
              className="block [&>img]:h-auto [&>img]:w-full"
            >
              {logo}
            </span>
          </h1>
        ) : (
          <h1 className="text-display font-bold text-balance text-foreground">
            {title}
          </h1>
        )}
        <p className="max-w-[38ch] text-h4 font-normal text-foreground">
          {pitch}
        </p>
        {actions && <div className="flex flex-wrap gap-3 pt-1">{actions}</div>}
      </div>
    </section>
  );
}
