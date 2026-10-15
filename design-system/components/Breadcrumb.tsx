import { Fragment, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../utils";

export interface BreadcrumbItem {
  label: ReactNode;
  /** Link target. Leave it out for an entry that is not clickable. */
  href?: string;
}

export interface BreadcrumbProps {
  /** The path from the top down; the LAST entry is the current page. */
  items: BreadcrumbItem[];
  /** Accessible name of the navigation. Default "Breadcrumb". */
  "aria-label"?: string;
  className?: string;
}

/**
 * Neo-Brutalism breadcrumb: the whole path sits in ONE box (2px border,
 * radius 8, no shadow — it's orientation, not a layer; see the shadow rule
 * in tokens.css), entries
 * separated by a `>` chevron. The last entry is the current page: muted,
 * not a link, marked `aria-current="page"`. The box is only as wide as its
 * content and wraps onto more lines if the screen is too narrow.
 *
 * Plain `<a>` links, so it works anywhere and stays a Server Component. In
 * a Next.js app that should navigate without a full reload, swap the `<a>`
 * below for `next/link`'s `Link`.
 */
export function Breadcrumb({
  items,
  "aria-label": ariaLabel = "Breadcrumb",
  className,
}: BreadcrumbProps) {
  const lastIndex = items.length - 1;
  return (
    <nav
      aria-label={ariaLabel}
      className={cn("inline-block max-w-full", className)}
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-brutal border-2 border-foreground bg-surface px-4 py-2.5 text-small">
        {items.map((item, i) => (
          <Fragment key={i}>
            <li className="flex items-center">
              {i === lastIndex ? (
                <span aria-current="page" className="font-medium text-muted">
                  {item.label}
                </span>
              ) : item.href ? (
                <a
                  href={item.href}
                  className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
                >
                  {item.label}
                </a>
              ) : (
                <span className="font-medium text-foreground">{item.label}</span>
              )}
            </li>
            {i < lastIndex && (
              <li role="presentation" aria-hidden="true" className="flex items-center text-muted">
                <ChevronRight size={16} />
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
