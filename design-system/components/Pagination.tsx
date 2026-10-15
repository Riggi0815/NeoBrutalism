"use client";

import { ReactNode, useState } from "react";
import { cn } from "../utils";

/** One full class string per palette color — Tailwind only generates
 * classes it finds as complete literals (same reason as Switch's table). */
const CURRENT_CLASSES = {
  /** Role token from tokens.css — follows the theme. Default. */
  primary: "bg-primary text-primary-foreground",
  pink: "bg-pink",
  purple: "bg-purple",
  green: "bg-green",
  yellow: "bg-yellow",
  blue: "bg-blue",
  orange: "bg-orange",
  destructive: "bg-destructive",
} as const;

export type PaginationColor = keyof typeof CURRENT_CLASSES;

/** Hard-shadow offsets, per spec: Prev/Next 4, page numbers 2. */
const NAV_SHADOW = "raised";
const PAGE_SHADOW = "control";
/** Lift 2px (Prev/Next) or 1px (pages) on hover, and land exactly on the
 * shadow's offset on press so the shadow disappears. Complete literals so
 * Tailwind finds them. */
const NAV_MOTION =
  "hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-(--offset-raised-x) active:translate-y-(--offset-raised-y)";
const PAGE_MOTION =
  "hover:-translate-x-px hover:-translate-y-px active:translate-x-(--offset-control-x) active:translate-y-(--offset-control-y)";

type PageItem = number | "start-ellipsis" | "end-ellipsis";

const range = (from: number, to: number) =>
  Array.from({ length: Math.max(to - from + 1, 0) }, (_, i) => from + i);

/**
 * Which buttons to show: always the first and last page, the current page
 * with `siblings` neighbours on each side, and "…" for what is skipped.
 * The number of slots stays the same (siblings × 2 + 5) wherever you are,
 * so the row doesn't jump in width while paging. With few pages it is just
 * all of them.
 */
function getPageItems(page: number, count: number, siblings = 1): PageItem[] {
  const slots = siblings * 2 + 5;
  if (count <= slots) return range(1, count);

  const start = Math.max(
    Math.min(page - siblings, count - siblings * 2 - 2),
    3,
  );
  const end = Math.min(
    Math.max(page + siblings, siblings * 2 + 3),
    count - 2,
  );

  return [
    1,
    start > 3 ? "start-ellipsis" : 2,
    ...range(start, end),
    end < count - 2 ? "end-ellipsis" : count - 1,
    count,
  ];
}

interface PageButtonProps {
  children: ReactNode;
  onClick: () => void;
  shadow: string;
  /** Hover-lift / press-flat classes matching `shadow`. */
  motion: string;
  disabled?: boolean;
  current?: boolean;
  currentClass?: string;
  className?: string;
  "aria-label"?: string;
}

/** One button: same hard-shadow-as-a-real-element technique and the same
 * lift-on-hover / press-flat-on-active as `Button` (see Button.tsx), but
 * with its own shadow size. */
function PageButton({
  children,
  onClick,
  shadow,
  motion,
  disabled,
  current,
  currentClass,
  className,
  "aria-label": ariaLabel,
}: PageButtonProps) {
  const interactive = !disabled && !current;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={current ? "page" : undefined}
      className={cn(
        "relative inline-block rounded-brutal",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
      )}
    >
      {/* Disabled = neutral and flat, same as Button (see Button.tsx). */}
      {!disabled && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-brutal bg-shadow"
          style={{ transform: `translate(var(--offset-${shadow}-x), var(--offset-${shadow}-y))` }}
        />
      )}
      <span
        className={cn(
          "relative inline-flex h-10 min-w-10 select-none items-center justify-center rounded-brutal border-2 px-3 text-small font-bold transition-transform duration-100 ease-out",
          disabled
            ? "border-disabled-foreground bg-disabled text-disabled-foreground"
            : "border-foreground text-foreground",
          !disabled && (current ? currentClass : "bg-surface"),
          interactive && motion,
          className,
        )}
      >
        {children}
      </span>
    </button>
  );
}

export interface PaginationProps {
  /** Total number of pages. */
  pageCount: number;
  /** Current page, 1-based (controlled) — pair with `onPageChange`. */
  page?: number;
  /** Start page when not controlled. Default 1. */
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** How many page numbers to show on each side of the current one.
   * Default 1. */
  siblings?: number;
  /** Fill of the current page as a palette name. Default `primary` (the role token, so it follows a re-themed --color-primary). */
  color?: PaginationColor;
  /** Accessible name of the navigation. Default "Pagination". */
  "aria-label"?: string;
  className?: string;
}

/**
 * Neo-Brutalism pagination: "Prev" and "Next" (shadow 4/4) around the page
 * numbers (shadow 2/2), all with 2px border and radius 8; the current page
 * is filled (pink by default). Prev/Next are disabled on the first/last
 * page. Works controlled (`page` + `onPageChange`) or on its own
 * (`defaultPage`). Buttons, not links — it changes state, it doesn't
 * navigate; for URL-based paging, call your router in `onPageChange`.
 */
export function Pagination({
  pageCount,
  page,
  defaultPage = 1,
  onPageChange,
  siblings = 1,
  color = "primary",
  "aria-label": ariaLabel = "Pagination",
  className,
}: PaginationProps) {
  const [inner, setInner] = useState(defaultPage);
  const count = Math.max(1, Math.floor(pageCount));
  const current = Math.min(Math.max(page ?? inner, 1), count);

  function go(next: number) {
    const clamped = Math.min(Math.max(next, 1), count);
    if (clamped === current) return;
    if (page === undefined) setInner(clamped);
    onPageChange?.(clamped);
  }

  const items = getPageItems(current, count, siblings);

  return (
    <nav aria-label={ariaLabel} className={className}>
      <ul className="flex flex-wrap items-center gap-3">
        <li>
          <PageButton
            shadow={NAV_SHADOW}
            motion={NAV_MOTION}
            onClick={() => go(current - 1)}
            disabled={current <= 1}
            className="px-4"
          >
            Prev
          </PageButton>
        </li>
        {items.map((item) =>
          typeof item === "number" ? (
            <li key={item}>
              <PageButton
                shadow={PAGE_SHADOW}
                motion={PAGE_MOTION}
                onClick={() => go(item)}
                current={item === current}
                currentClass={CURRENT_CLASSES[color]}
                aria-label={`Page ${item}`}
              >
                {item}
              </PageButton>
            </li>
          ) : (
            <li key={item} aria-hidden="true" className="px-1 text-small font-bold text-muted">
              …
            </li>
          ),
        )}
        <li>
          <PageButton
            shadow={NAV_SHADOW}
            motion={NAV_MOTION}
            onClick={() => go(current + 1)}
            disabled={current >= count}
            className="px-4"
          >
            Next
          </PageButton>
        </li>
      </ul>
    </nav>
  );
}
