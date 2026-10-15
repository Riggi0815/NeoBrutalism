"use client";

import {
  Children,
  createContext,
  isValidElement,
  ReactNode,
  useContext,
} from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "../utils";

/** One full class string per palette color — Tailwind only generates
 * classes it finds as complete literals (same reason as Switch's table).
 * Applied to the header of an open item via Radix's `data-state="open"`. */
const OPEN_CLASSES = {
  /** Role token from tokens.css — follows the theme. Default. */
  selected: "data-[state=open]:bg-selected",
  yellow: "data-[state=open]:bg-yellow",
  pink: "data-[state=open]:bg-pink",
  purple: "data-[state=open]:bg-purple",
  green: "data-[state=open]:bg-green",
  blue: "data-[state=open]:bg-blue",
  orange: "data-[state=open]:bg-orange",
  destructive: "data-[state=open]:bg-destructive",
} as const;

export type AccordionColor = keyof typeof OPEN_CLASSES;

/** Hard-shadow offset of every item, per spec (x=4 y=4). */
const SHADOW_OFFSET = "raised";

/** The color lives on <Accordion> but is needed by every
 * <AccordionTrigger> — context avoids prop-drilling it. */
const ColorContext = createContext<AccordionColor>("selected");

export interface AccordionProps {
  /** `AccordionItem`s. */
  children: ReactNode;
  /** Allow several items to be open at the same time. Default false:
   * opening one closes the others. */
  multiple?: boolean;
  /** Only without `multiple`: may the open item be closed again by clicking
   * it? Default true. With `false` one item always stays open. */
  collapsible?: boolean;
  /** Values of the items open at the start (uncontrolled). Default: the
   * first item. Pass `[]` to start with everything closed. */
  defaultValue?: string[];
  /** Values of the open items (controlled) — pair with `onValueChange`.
   * Without `multiple` it holds at most one value. */
  value?: string[];
  onValueChange?: (value: string[]) => void;
  /** Header color of an open item as a palette name. Default `selected` (the role token, so it follows a re-themed --color-selected). */
  color?: AccordionColor;
  className?: string;
}

/** Value of the first direct child that looks like an `AccordionItem`.
 * Children are checked by their `value` prop, not by component identity:
 * when a Server Component renders them, the element type seen here is a
 * client-module reference, not necessarily this file's function. */
function firstItemValue(children: ReactNode): string | undefined {
  for (const child of Children.toArray(children)) {
    if (isValidElement<{ value?: unknown }>(child)) {
      const v = child.props.value;
      if (typeof v === "string") return v;
    }
  }
  return undefined;
}

/**
 * Neo-Brutalism accordion, built from parts like Card and Tabs:
 * `Accordion` → `AccordionItem` → `AccordionTrigger` + `AccordionContent`.
 * Built on @radix-ui/react-accordion, which supplies the ARIA wiring
 * (button + region, aria-expanded/-controls), Enter/Space, arrow-key / Home /
 * End navigation between headers and the height animation — we only skin it.
 *
 * Radix keeps different value types for one-open-at-a-time (string) and
 * several-open (string[]); this wrapper hides that and always speaks
 * `string[]`.
 */
export function Accordion({
  children,
  multiple = false,
  collapsible = true,
  defaultValue,
  value,
  onValueChange,
  color = "selected",
  className,
}: AccordionProps) {
  const rootClass = cn("flex w-full flex-col gap-3", className);

  // Only uncontrolled use needs a start value; when `value` is given it
  // wins and `defaultValue` is ignored (Radix would warn otherwise).
  let initial: string[] | undefined;
  if (value === undefined) {
    const first = firstItemValue(children);
    initial = defaultValue ?? (first === undefined ? [] : [first]);
  }

  return (
    <ColorContext.Provider value={color}>
      {multiple ? (
        <AccordionPrimitive.Root
          type="multiple"
          value={value}
          defaultValue={initial}
          onValueChange={onValueChange}
          className={rootClass}
        >
          {children}
        </AccordionPrimitive.Root>
      ) : (
        <AccordionPrimitive.Root
          type="single"
          collapsible={collapsible}
          value={value === undefined ? undefined : (value[0] ?? "")}
          defaultValue={initial === undefined ? undefined : (initial[0] ?? "")}
          onValueChange={(v) => onValueChange?.(v ? [v] : [])}
          className={rootClass}
        >
          {children}
        </AccordionPrimitive.Root>
      )}
    </ColorContext.Provider>
  );
}

export interface AccordionItemProps {
  /** Unique id of this item within the accordion. */
  value: string;
  /** An `AccordionTrigger` and an `AccordionContent`. */
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

/** One entry: a bordered box (2px, radius 8) with the hard shadow 4/4. The
 * shadow is a real element behind the box (same technique as Card.tsx). */
export function AccordionItem({
  value,
  children,
  disabled,
  className,
}: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      value={value}
      disabled={disabled}
      className={cn("relative", className)}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-brutal bg-shadow"
        style={{ transform: `translate(var(--offset-${SHADOW_OFFSET}-x), var(--offset-${SHADOW_OFFSET}-y))` }}
      />
      <div className="relative overflow-hidden rounded-brutal border-2 border-foreground bg-surface">
        {children}
      </div>
    </AccordionPrimitive.Item>
  );
}

export interface AccordionTriggerProps {
  /** The always-visible title line. */
  children: ReactNode;
  className?: string;
}

/** The header button: title left, 16px chevron right that flips when the
 * item is open. Rendered inside a Radix `<h3>` so the page outline gets a
 * heading per entry. */
export function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  const color = useContext(ColorContext);
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "group flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 px-4 py-2 text-left text-body font-semibold text-foreground",
          OPEN_CLASSES[color],
          // The item clips its children (overflow-hidden, for the rounded
          // corners), so the focus ring has to sit inside the header.
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      >
        {children}
        <ChevronDown
          aria-hidden="true"
          size={18}
          className="shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export interface AccordionContentProps {
  /** The text (or anything) shown while the item is open. */
  children: ReactNode;
  className?: string;
}

/** The panel under the header, separated from it by a 2px line. The outer
 * element only animates the height; padding and border live on the inner
 * one so they don't distort the animation. */
export function AccordionContent({ children, className }: AccordionContentProps) {
  return (
    <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none">
      <div
        className={cn(
          "border-t-2 border-foreground bg-surface px-4 py-3 text-body text-foreground",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}
