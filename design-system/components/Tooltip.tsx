"use client";

import { ReactElement, ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../utils";

export type TooltipSide = "top" | "right" | "bottom" | "left";

/** Hard-shadow offset, per spec (x=2 y=2). */
const SHADOW_OFFSET = "control";
/** The little triangle: 16px wide, 8px high (a 45° point). */
const ARROW_WIDTH = 16;
const ARROW_HEIGHT = 8;
/** Gap between the triangle's tip and the trigger. */
const TIP_GAP = 2;

export interface TooltipProps {
  /** What the tooltip says. Keep it short; it is not focusable. */
  content: ReactNode;
  /** Which side of the trigger it appears on. Default `top`. If there is
   * not enough room Radix flips it to the opposite side automatically. */
  side?: TooltipSide;
  /** The element to hover. Must accept a `ref` and pass props on to a DOM
   * element (`Button` and any plain element do); a component that doesn't
   * (e.g. `Avatar`) needs a `<span>` around it. */
  children: ReactElement;
  /** Milliseconds of hovering before it shows. Default 200. */
  delayDuration?: number;
  /** Max width of the bubble. Default `max-w-xs` (320px). */
  className?: string;
}

/**
 * Neo-Brutalism tooltip. Built on @radix-ui/react-tooltip, which supplies
 * what a hand-rolled CSS tooltip can't: it also opens on keyboard focus,
 * closes on Escape, wires `aria-describedby` for screen readers, flips to
 * the other side when it would leave the screen and renders outside any
 * `overflow: hidden` parent. We only skin it: 2px border, radius 8, hard
 * shadow 2/2 (a real element behind the bubble, see Card.tsx) and a small
 * triangle pointing at the trigger.
 *
 * The triangle is an SVG whose top edge reaches 2px *into* the bubble
 * (`overflow-visible`, drawn above y=0) so it covers the bubble's border
 * where the two meet and the outline flows into the point.
 */
export function Tooltip({
  content,
  side = "top",
  children,
  delayDuration = 200,
  className,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            // Radix adds the arrow's height to this itself.
            sideOffset={TIP_GAP}
            collisionPadding={8}
            arrowPadding={10}
            className={cn("relative z-50 max-w-xs", className)}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-brutal bg-shadow"
              style={{ transform: `translate(var(--offset-${SHADOW_OFFSET}-x), var(--offset-${SHADOW_OFFSET}-y))` }}
            />
            <div className="relative rounded-brutal border-2 border-foreground bg-surface px-3 py-2 text-small font-medium text-foreground">
              {content}
            </div>
            <TooltipPrimitive.Arrow asChild>
              <svg
                width={ARROW_WIDTH}
                height={ARROW_HEIGHT}
                viewBox={`0 0 ${ARROW_WIDTH} ${ARROW_HEIGHT}`}
                className="overflow-visible"
                aria-hidden="true"
              >
                {/* Fill: the triangle plus a 2px strip above it that hides
                    the bubble's border under the base. */}
                <path
                  d={`M0 -2 H${ARROW_WIDTH} V0 L${ARROW_WIDTH / 2} ${ARROW_HEIGHT} L0 0 Z`}
                  className="fill-surface"
                />
                {/* Outline: only the two slanted edges. */}
                <path
                  d={`M0 0 L${ARROW_WIDTH / 2} ${ARROW_HEIGHT} L${ARROW_WIDTH} 0`}
                  className="fill-none stroke-foreground"
                  strokeWidth={2}
                  strokeLinejoin="miter"
                />
              </svg>
            </TooltipPrimitive.Arrow>
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
