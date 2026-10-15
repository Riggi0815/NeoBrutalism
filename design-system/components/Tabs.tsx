"use client";

import { createContext, ReactNode, useContext } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../utils";

/** One full class string per palette color — Tailwind only generates
 * classes it finds as complete literals (same reason as Switch's table).
 * Applied to the active tab via Radix's `data-state="active"`. */
const ACTIVE_CLASSES = {
  /** Role token from tokens.css — follows the theme. Default. */
  selected: "data-[state=active]:bg-selected",
  yellow: "data-[state=active]:bg-yellow",
  pink: "data-[state=active]:bg-pink",
  purple: "data-[state=active]:bg-purple",
  green: "data-[state=active]:bg-green",
  blue: "data-[state=active]:bg-blue",
  orange: "data-[state=active]:bg-orange",
  destructive: "data-[state=active]:bg-destructive",
} as const;

export type TabsColor = keyof typeof ACTIVE_CLASSES;

/** Hard-shadow offset for the tab bar AND the content panel, per spec
 * (x=4 y=4). */
const SHADOW_OFFSET = "raised";

/** The color lives on <Tabs> but is needed by every <TabsTrigger>, which
 * can sit arbitrarily deep — context avoids prop-drilling it. */
const ColorContext = createContext<TabsColor>("selected");

export interface TabsProps {
  /** `TabsList` + one `TabsContent` per tab. */
  children: ReactNode;
  /** Initially selected tab (uncontrolled). */
  defaultValue?: string;
  /** Selected tab (controlled) — pair with `onValueChange`. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Fill of the active tab as a palette name. Default `selected` (the role token, so it follows a re-themed --color-selected). */
  color?: TabsColor;
  className?: string;
}

/**
 * Neo-Brutalism tabs, built from parts like Card: `Tabs` (state) →
 * `TabsList` (the bar) → `TabsTrigger` (one tab), and `TabsContent` (the
 * panel for one tab). Built on @radix-ui/react-tabs, which supplies the
 * ARIA roles, arrow-key / Home / End navigation and roving focus — we only
 * skin it. The bar and the panel are two separate bordered surfaces with a
 * 20px gap, each with the usual hard shadow (see Card.tsx for the
 * technique).
 */
export function Tabs({
  children,
  defaultValue,
  value,
  onValueChange,
  color = "selected",
  className,
}: TabsProps) {
  return (
    <ColorContext.Provider value={color}>
      <TabsPrimitive.Root
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        className={cn("flex w-full flex-col gap-5", className)}
      >
        {children}
      </TabsPrimitive.Root>
    </ColorContext.Provider>
  );
}

export interface TabsListProps {
  /** `TabsTrigger`s. */
  children: ReactNode;
  /** Accessible name for the tab bar, e.g. "Account settings". */
  "aria-label"?: string;
  className?: string;
}

/** The bar holding the tabs: 2px border, radius 8, shadow 4/4. The tabs
 * share its width equally and are separated by 2px dividers. */
export function TabsList({
  children,
  "aria-label": ariaLabel,
  className,
}: TabsListProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-brutal bg-shadow"
        style={{ transform: `translate(var(--offset-${SHADOW_OFFSET}-x), var(--offset-${SHADOW_OFFSET}-y))` }}
      />
      <TabsPrimitive.List
        aria-label={ariaLabel}
        className="relative flex w-full overflow-hidden rounded-brutal border-2 border-foreground bg-surface"
      >
        {children}
      </TabsPrimitive.List>
    </div>
  );
}

export interface TabsTriggerProps {
  /** Ties this tab to the `TabsContent` with the same value. */
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

/** One tab. Fixed 52px high (the bar is 56px with its border). */
export function TabsTrigger({
  value,
  children,
  disabled,
  className,
}: TabsTriggerProps) {
  const color = useContext(ColorContext);
  return (
    <TabsPrimitive.Trigger
      value={value}
      disabled={disabled}
      className={cn(
        "flex min-h-[52px] flex-1 cursor-pointer items-center justify-center px-4 text-body font-semibold text-foreground",
        // 2px divider between tabs — on every tab except the first.
        "border-l-2 border-foreground first:border-l-0",
        ACTIVE_CLASSES[color],
        // No focus ring on purpose: Radix focuses a tab programmatically
        // when it is clicked, so :focus-visible matches after a mouse click
        // too and the ring would read as a thicker border. It isn't needed:
        // arrow keys select the tab they move to (automatic activation), so
        // the focused tab is always the highlighted (selected) one.
        "focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export interface TabsContentProps {
  /** Shown while the tab with this value is active. */
  value: string;
  children: ReactNode;
  className?: string;
}

/** The panel for one tab: 2px border, radius 8, shadow 4/4, 24px padding.
 * Radix renders the wrapper itself (`asChild`) so the shadow disappears
 * together with the panel when its tab is inactive. */
export function TabsContent({ value, children, className }: TabsContentProps) {
  return (
    <TabsPrimitive.Content value={value} asChild>
      <div
        className={cn(
          "relative rounded-brutal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-brutal bg-shadow"
          style={{ transform: `translate(var(--offset-${SHADOW_OFFSET}-x), var(--offset-${SHADOW_OFFSET}-y))` }}
        />
        <div className="relative rounded-brutal border-2 border-foreground bg-surface p-6 text-body">
          {children}
        </div>
      </div>
    </TabsPrimitive.Content>
  );
}
