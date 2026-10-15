import {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import { cn } from "../utils";

/** One full class string per palette color — Tailwind only generates
 * classes it finds as complete literals (same reason as Switch's table). */
const HEADER_CLASSES = {
  /** Role token from tokens.css — follows the theme. Default. */
  selected: "bg-selected",
  yellow: "bg-yellow",
  pink: "bg-pink",
  purple: "bg-purple",
  green: "bg-green",
  blue: "bg-blue",
  orange: "bg-orange",
  destructive: "bg-destructive",
} as const;

export type TableHeaderColor = keyof typeof HEADER_CLASSES;

/** Hard-shadow offset, per spec (x=4 y=4). */
const SHADOW_OFFSET = "raised";

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** Classes for the outer wrapper (e.g. a width). Everything else
   * (`aria-label`, …) goes on the `<table>` itself. */
  className?: string;
  /** Quiet level for reading pages: no shadow, thinner outer border
   * (--border-width-flat). Use it for tables inside wiki articles. */
  flat?: boolean;
}

/**
 * Neo-Brutalism table, built from parts like Card: `Table` → `TableHeader`
 * / `TableBody` → `TableRow` → `TableHead` / `TableCell`. They are the real
 * HTML table elements, so semantics and screen-reader navigation come for
 * free; the parts only add the look.
 *
 * `Table` draws the outer box (2px border, radius 8, hard shadow 4/4) and
 * lets the table scroll sideways inside it when the screen is narrower
 * than its content. Rows below the header alternate between white and
 * sand (#E8E0D4 at 30%), separated by 2px lines.
 */
export function Table({ className, children, flat = false, ...props }: TableProps) {
  return (
    <div
      className={cn(
        "relative w-full",
        // Flat: the line under the header keeps the (thinner) flat border
        // width, the lines between body rows become 1px hairlines at 25%,
        // so a long table reads as text, not as a grid. TableRow's
        // `last:border-b-0` still wins on the last row (higher specificity).
        flat &&
          "[&_thead>tr]:[border-bottom-width:var(--border-width-flat)] [&_tbody>tr]:border-foreground/25 [&_tbody>tr]:[border-bottom-width:1px]",
        className,
      )}
    >
      {!flat && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-brutal bg-shadow"
          style={{ transform: `translate(var(--offset-${SHADOW_OFFSET}-x), var(--offset-${SHADOW_OFFSET}-y))` }}
        />
      )}
      <div
        className="relative overflow-hidden rounded-brutal border-2 border-foreground bg-surface"
        style={flat ? { borderWidth: "var(--border-width-flat, var(--border-width))" } : undefined}
      >
        <div className="overflow-x-auto">
          <table
            className="w-full border-collapse text-left text-small"
            {...props}
          >
            {children}
          </table>
        </div>
      </div>
    </div>
  );
}

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  /** Background of the header row as a palette name. Default `selected` (the role token, so it follows a re-themed --color-selected). */
  color?: TableHeaderColor;
}

export function TableHeader({
  color = "selected",
  className,
  ...props
}: TableHeaderProps) {
  return (
    <thead
      className={cn(
        HEADER_CLASSES[color],
        // The header's line to the body must survive TableRow's
        // `last:border-b-0` (the header row is the last row of <thead>).
        "[&>tr:last-child]:border-b-2",
        className,
      )}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn("[&>tr:nth-child(even)]:bg-sand/30", className)}
      {...props}
    />
  );
}

export function TableRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("border-b-2 border-foreground last:border-b-0", className)}
      {...props}
    />
  );
}

export function TableHead({
  className,
  scope = "col",
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope={scope}
      className={cn("px-4 py-3 font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3 text-foreground", className)} {...props} />;
}
