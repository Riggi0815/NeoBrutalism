import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge only knows Tailwind's built-in font-size scale
 * (text-xs .. text-9xl). Our own text-size utilities from tokens.css
 * (text-display, text-h1 … text-h4, text-body, text-small, …) are
 * unrecognized `text-*` suffixes, so by default tailwind-merge falls back
 * to treating them as text-color utilities — meaning something like
 * `cn("text-h1 font-bold text-foreground")` would silently drop `text-h1`
 * in favor of `text-foreground` since both look like the same conflict
 * group. Registering them explicitly under "font-size" fixes that.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": ["text-display", "text-h1", "text-h2", "text-h3", "text-h4", "text-card-title", "text-body", "text-small", "text-badge", "text-field"],
    },
  },
});

/**
 * Merge Tailwind class names safely (later classes override earlier
 * conflicting ones). Used by every component in this design system.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
