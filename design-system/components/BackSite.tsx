import { ReactNode } from "react";
import { cn } from "../utils";
import { Card } from "./Card";
import { GAME_BG, gameColorStyle, type GameColor } from "./gameColors";

export interface BackSiteProps {
  /** Section title. Default "Was dich erwartet". */
  title?: string;
  /** Up to THREE screenshots in 16:9, most important first — the first is
   * shown large. Pass elements (`<img>` or `next/image` with `fill` and
   * `className="object-cover"`). Without any, three placeholders show the
   * format. More screenshots belong in a gallery below, not here. */
  screenshots?: ReactNode[];
  /** Three or four features, each written as something you DO, starting
   * with a verb: "Baue dir ein Floß aus Fundholz." */
  features?: ReactNode[];
  /** Only for an exception: normally the color comes from a surrounding
   * GameTheme. Paints the band along the top edge and the feature markers. */
  color?: GameColor;
  /** Goes below the features — usually a FactBar. */
  children?: ReactNode;
  className?: string;
}

/**
 * The back of the game case: three screenshots, three or four things you
 * do in the game, and the facts. Explains a game the way a case back does,
 * in one look.
 *
 * A Card (it lies on the page like a layer) with a band in the game color
 * along the top edge. The screenshots inside are flat — a shadow inside a
 * shadow would stack layers that aren't there.
 *
 * Server Component.
 */
export function BackSite({
  title = "Was dich erwartet",
  screenshots = [],
  features = [],
  color,
  children,
  className,
}: BackSiteProps) {
  const shots = screenshots.slice(0, 3);
  const isPlaceholder = shots.length === 0;
  const frames: ReactNode[] = isPlaceholder ? [null, null, null] : shots;

  return (
    <div style={gameColorStyle(color)} className={className}>
      <Card>
        <div
          aria-hidden="true"
          className={cn("h-3 border-b-2 border-foreground", GAME_BG)}
        />
        <div className="p-5 sm:p-6">
          <h2 className="mb-5 text-h3 font-bold text-balance text-foreground">{title}</h2>
  
          <div
            className={cn(
              "grid gap-3",
              frames.length === 3 && "sm:grid-cols-[2fr_1fr] sm:grid-rows-2",
              frames.length === 2 && "sm:grid-cols-2",
            )}
          >
            {frames.map((shot, i) => (
              <div
                key={i}
                className={cn(
                  "relative aspect-video overflow-hidden rounded-brutal-sm border-2 border-foreground bg-sand",
                  frames.length === 3 && i === 0 && "sm:row-span-2 sm:aspect-auto",
                  "[&>img]:h-full [&>img]:w-full [&>img]:object-cover",
                )}
              >
                {shot ?? (
                  <div
                    role="img"
                    aria-label="Platzhalter für einen Screenshot"
                    className="flex h-full items-end bg-[repeating-linear-gradient(135deg,transparent_0_10px,rgb(0_0_0/0.06)_10px_20px)] p-2"
                  >
                    <span className="rounded-brutal-sm bg-foreground px-1.5 py-0.5 text-badge font-bold text-background">
                      {i === 0 ? "Screenshot 16:9, mind. 1920 × 1080 px" : "16:9"}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
  
          {features.length > 0 && (
            <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {features.map((feature, i) => (
                <li key={i} className="grid grid-cols-[14px_1fr] gap-3 text-body text-foreground">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-[0.4em] h-3.5 w-3.5 rounded-[3px] border-2 border-foreground",
                      GAME_BG,
                    )}
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}
  
          {children && <div className="mt-6">{children}</div>}
        </div>
      </Card>
    </div>
  );
}
