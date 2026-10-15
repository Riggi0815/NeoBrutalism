import { ElementType, ReactNode } from "react";
import { cn } from "../utils";
import { gameColorStyle, type GameColor } from "./gameColors";

export interface GameThemeProps {
  /** The game's one color. */
  color: GameColor;
  children: ReactNode;
  /** Element to render. Default `div`; use `main` or `article` when the
   * theme wraps the whole page or article anyway. */
  as?: ElementType;
  className?: string;
}

/**
 * Sets a game's color ONCE for everything inside: GameCase, BackSite,
 * ShelfSpine, Infobox and anything else that reads --game. Put it around
 * a game page (and around that game's wiki pages), then leave out the
 * `color` props on the components.
 *
 * A component's own `color` prop still wins — for the one exception, not
 * as the normal way.
 *
 * Server Component: it only writes two CSS custom properties.
 */
export function GameTheme({ color, children, as: Tag = "div", className }: GameThemeProps) {
  return (
    <Tag className={cn(className)} style={gameColorStyle(color)}>
      {children}
    </Tag>
  );
}
