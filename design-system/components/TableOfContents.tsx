import { cn } from "../utils";

export interface TableOfContentsItem {
  /** The `id` of the heading it jumps to. */
  id: string;
  label: string;
  /** 2 for an h2 section, 3 for an h3 below it. Default 2. */
  level?: 2 | 3;
}

export interface TableOfContentsProps {
  /** The article's headings, in page order. Only worth it from about three
   * sections on — a short page needs no table of contents. */
  items: TableOfContentsItem[];
  /** Heading above the list. Default "Inhalt". */
  title?: string;
  /** Stays in view while scrolling (sticky, below a 96px header). For the
   * side column on wide screens. Default false. */
  sticky?: boolean;
  className?: string;
}

/**
 * Table of contents of a wiki article: a list of jump links to the h2/h3
 * headings. h3 entries are indented below their h2.
 *
 * Quiet level: no box, no shadow — it is a column of text next to the
 * article. The headings it points to need `scroll-mt-24` (or similar), so
 * a sticky page header doesn't cover them after the jump.
 *
 * Server Component. It does not highlight the section you are reading:
 * that needs scroll tracking in the browser (a Client Component with
 * IntersectionObserver). Add it only if the articles get long enough to
 * lose your place in.
 */
export function TableOfContents({
  items,
  title = "Inhalt",
  sticky = false,
  className,
}: TableOfContentsProps) {
  return (
    <nav aria-label={title} className={cn(sticky && "lg:sticky lg:top-24", className)}>
      <p className="mb-3 text-body font-bold text-foreground">{title}</p>
      <ol
        className="flex flex-col gap-1 border-t-2 border-foreground pt-3"
        style={{ borderTopWidth: "var(--border-width-flat, var(--border-width))" }}
      >
        {items.map((item) => (
          <li key={item.id} className={cn(item.level === 3 && "pl-4")}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block rounded-brutal-sm py-1 text-small underline-offset-4 hover:underline",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                item.level === 3 ? "text-muted" : "font-medium text-foreground",
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
