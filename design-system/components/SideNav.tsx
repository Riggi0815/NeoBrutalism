import { ChevronDown } from "lucide-react";
import { cn } from "../utils";

export interface SideNavLink {
  label: string;
  href: string;
  /** The page you are on. Marked with `aria-current="page"`. */
  current?: boolean;
}

export interface SideNavGroup {
  /** Group heading, e.g. "Grundlagen", "Gegenstände". */
  label: string;
  items: SideNavLink[];
}

export interface SideNavProps {
  groups: SideNavGroup[];
  /** Accessible name; also the label of the fold-out on phones. Default
   * "Wiki". Give each SideNav on a page its own name. */
  "aria-label"?: string;
  className?: string;
}

function Groups({ groups }: { groups: SideNavGroup[] }) {
  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 text-small font-bold text-foreground">{group.label}</p>
          <ul className="flex flex-col">
            {group.items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={item.current ? "page" : undefined}
                  className={cn(
                    "block rounded-brutal-sm px-2.5 py-1.5 text-small text-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    item.current
                      ? "bg-selected font-semibold"
                      : "hover:bg-foreground/5 hover:underline hover:underline-offset-4",
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * Side navigation of the wiki: all pages in groups, the current one
 * highlighted with the `selected` role (like Tabs and Menu).
 *
 * From `lg` up a plain column; below `lg` it folds into a closed
 * `<details>` above the article, so on a phone the article comes first.
 * That fold-out needs no JavaScript.
 *
 * Both layouts are in the markup and one is hidden by CSS (`display:
 * none`), so screen readers only ever meet one of them.
 *
 * Plain `<a>` links (Server Component, works anywhere). For client-side
 * navigation in Next.js swap them for `next/link`'s `Link`.
 */
export function SideNav({ groups, "aria-label": ariaLabel = "Wiki", className }: SideNavProps) {
  return (
    <nav aria-label={ariaLabel} className={className}>
      <details className="group rounded-brutal border-2 border-foreground bg-surface lg:hidden" style={{ borderWidth: "var(--border-width-flat, var(--border-width))" }}>
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 text-body font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-details-marker]:hidden">
          {ariaLabel}: alle Seiten
          <ChevronDown
            aria-hidden="true"
            className="h-5 w-5 shrink-0 transition-transform duration-150 group-open:rotate-180 motion-reduce:transition-none"
          />
        </summary>
        <div className="border-t border-foreground/25 px-2 py-4">
          <Groups groups={groups} />
        </div>
      </details>
      <div className="hidden lg:block">
        <Groups groups={groups} />
      </div>
    </nav>
  );
}
