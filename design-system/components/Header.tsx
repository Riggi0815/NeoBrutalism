"use client";

import { Fragment, ReactNode, useEffect, useId, useRef, useState } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "../utils";

/** Hard-shadow offset of the bar and the mobile menu (x=4 y=4). */
const SHADOW_OFFSET = "raised";
/** Below this width (Tailwind `md`, 768px) the links and `actions` move
 * behind the hamburger button. Keep in sync with the `md:` classes below. */
const DESKTOP_QUERY = "(min-width: 768px)";

export interface HeaderLink {
  label: ReactNode;
  href: string;
  /** Marks the page you are on: bold + underlined + `aria-current="page"`. */
  active?: boolean;
}

/** Several links under one label: a dropdown on desktop, a labelled block
 * in the mobile menu. Use it once a flat row of links would wrap. */
export interface HeaderLinkGroup {
  label: string;
  items: HeaderLink[];
}

export type HeaderNavItem = HeaderLink | HeaderLinkGroup;

function isGroup(item: HeaderNavItem): item is HeaderLinkGroup {
  return "items" in item;
}

export interface HeaderProps {
  /** Left side: logo and name. See `HeaderBrand` for the standard one. */
  brand: ReactNode;
  /** The navigation in the middle: plain links, groups of links, or a mix. */
  links?: HeaderNavItem[];
  /** The right side, e.g. a "Sign Up" `Button`, or — once logged in — an
   * `Avatar` or a `DropdownMenu`. Swap it freely; the Header doesn't care
   * what it is. On small screens it moves into the hamburger menu. */
  actions?: ReactNode;
  /** Accessible name of the link navigation. Default "Main". */
  "aria-label"?: string;
  className?: string;
}

export interface HeaderBrandProps {
  /** Icon inside the pink tile, e.g. `<Sparkles />`. Drawn at 14×14. */
  icon?: ReactNode;
  /** The name next to the tile. */
  name: string;
  /** Where clicking the brand goes. Default `/`. */
  href?: string;
  className?: string;
}

/** The standard brand block: a small pink tile with an icon (2px border,
 * hard shadow 2/2) and the name beside it. */
export function HeaderBrand({ icon, name, href = "/", className }: HeaderBrandProps) {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-2.5 text-small font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-brutal-sm",
        className,
      )}
    >
      <span className="relative inline-block">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-brutal-sm bg-shadow"
          style={{ transform: "translate(var(--offset-control-x), var(--offset-control-y))" }}
        />
        <span
          aria-hidden="true"
          className="relative flex size-[26px] items-center justify-center rounded-brutal-sm border-2 border-foreground bg-primary text-primary-foreground [&>svg]:h-3.5 [&>svg]:w-3.5"
        >
          {icon}
        </span>
      </span>
      <span>{name}</span>
    </a>
  );
}

/**
 * Neo-Brutalism header / navigation bar: brand on the left, links in the
 * middle, `actions` on the right — three groups spread evenly across the
 * bar (2px border, radius 8, hard shadow 4/4).
 *
 * Under 768px the links AND the `actions` disappear behind a hamburger
 * button on the right; it opens a panel under the bar (same border and
 * shadow) that lists the links as rows and puts `actions` at the bottom.
 * The panel closes on Esc, on a click outside, on a click on a link, and
 * when the window grows back to desktop width.
 *
 * Because `actions` is drawn in both places (the desktop one is simply
 * hidden by CSS on small screens), avoid `id`s inside it.
 *
 * `links` may mix plain links and groups (`{ label, items }`): a group
 * becomes a dropdown on desktop and a labelled block in the mobile menu.
 */
export function Header({
  brand,
  links = [],
  actions,
  "aria-label": ariaLabel = "Main",
  className,
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      const target = e.target as Element;
      // A menu opened from inside `actions` (a DropdownMenu, say) is drawn
      // in a portal outside this element — a click in it is not "outside".
      if (target.closest("[data-radix-popper-content-wrapper]")) return;
      if (!wrapperRef.current?.contains(target)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    const media = window.matchMedia(DESKTOP_QUERY);
    function onMediaChange(e: MediaQueryListEvent) {
      if (e.matches) setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    media.addEventListener("change", onMediaChange);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      media.removeEventListener("change", onMediaChange);
    };
  }, [open]);

  return (
    <header ref={wrapperRef} className={cn("relative w-full", className)}>
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-brutal bg-shadow"
        style={{ transform: `translate(var(--offset-${SHADOW_OFFSET}-x), var(--offset-${SHADOW_OFFSET}-y))` }}
      />
      <div className="relative flex min-h-[48px] items-center justify-between gap-4 rounded-brutal border-2 border-foreground bg-surface px-5 py-1">
        {brand}

        {links.length > 0 && (
          <nav aria-label={ariaLabel} className="hidden md:block">
            <ul className="flex items-center gap-6">
              {links.map((link, i) => (
                <li key={i}>
                  {isGroup(link) ? (
                    <HeaderGroupMenu group={link} />
                  ) : (
                    <a
                      href={link.href}
                      aria-current={link.active ? "page" : undefined}
                      className={cn(
                        "text-small text-foreground underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none",
                        link.active ? "font-bold underline" : "font-medium",
                      )}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        )}

        {actions && <div className="hidden items-center gap-3 md:flex">{actions}</div>}

        {(links.length > 0 || actions) && (
          <div className="relative inline-block rounded-brutal md:hidden">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-brutal bg-shadow"
              style={{ transform: "translate(var(--offset-control-x), var(--offset-control-y))" }}
            />
            <button
              ref={buttonRef}
              type="button"
              aria-label="Menu"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((o) => !o)}
              className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-brutal border-2 border-foreground bg-surface text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {open ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
            </button>
          </div>
        )}
      </div>

      {open && (
        <div id={panelId} className="absolute inset-x-0 top-full z-40 mt-3 md:hidden">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-brutal bg-shadow"
            style={{ transform: `translate(var(--offset-${SHADOW_OFFSET}-x), var(--offset-${SHADOW_OFFSET}-y))` }}
          />
          {/* Scrolls on its own when there are more links than fit. */}
          <div className="relative max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-brutal border-2 border-foreground bg-surface">
            {links.length > 0 && (
              <nav aria-label={`${ariaLabel} (menu)`}>
                <ul>
                  {links.map((link, i) => (
                    <Fragment key={i}>
                      {isGroup(link) ? (
                        <li className="border-b-2 border-foreground last:border-b-0">
                          <p className="bg-background px-5 pb-1 pt-3 text-badge font-bold text-muted">
                            {link.label}
                          </p>
                          <ul className="bg-background pb-2">
                            {link.items.map((item, j) => (
                              <li key={j}>
                                <MobileLink link={item} onNavigate={() => setOpen(false)} />
                              </li>
                            ))}
                          </ul>
                        </li>
                      ) : (
                        <li className="border-b-2 border-foreground last:border-b-0">
                          <MobileLink link={link} onNavigate={() => setOpen(false)} />
                        </li>
                      )}
                    </Fragment>
                  ))}
                </ul>
              </nav>
            )}
            {actions && (
              <div
                className={cn(
                  "flex flex-col items-start gap-3 p-5",
                  links.length > 0 && "border-t-2 border-foreground",
                )}
              >
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MobileLink({ link, onNavigate }: { link: HeaderLink; onNavigate: () => void }) {
  return (
    <a
      href={link.href}
      aria-current={link.active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "block px-5 py-2.5 text-small text-foreground hover:bg-selected focus-visible:bg-selected focus-visible:outline-none",
        link.active ? "font-bold" : "font-medium",
      )}
    >
      {link.label}
    </a>
  );
}

/**
 * Desktop: a group label that opens a menu of its links — the same look as
 * `DropdownMenu` (border, hard shadow, selected color on the highlighted
 * row). Arrow keys move through the links, Esc closes, Enter follows the
 * link. Non-modal, so the page stays scrollable while it is open. The
 * label is bold + underlined when one of its links is `active`.
 */
function HeaderGroupMenu({ group }: { group: HeaderLinkGroup }) {
  const hasActive = group.items.some((item) => item.active);
  return (
    <DropdownMenuPrimitive.Root modal={false}>
      <DropdownMenuPrimitive.Trigger
        className={cn(
          "group flex cursor-pointer items-center gap-1 rounded-brutal-sm text-small text-foreground underline-offset-4 outline-none",
          "hover:underline data-[state=open]:underline",
          "focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          hasActive ? "font-bold underline" : "font-medium",
        )}
      >
        {group.label}
        <ChevronDown
          size={14}
          aria-hidden="true"
          className="transition-transform duration-150 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
        />
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="start"
          sideOffset={12}
          collisionPadding={8}
          className="relative z-50"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-brutal bg-shadow"
            style={{ transform: `translate(var(--offset-${SHADOW_OFFSET}-x), var(--offset-${SHADOW_OFFSET}-y))` }}
          />
          <div className="relative min-w-40 overflow-hidden rounded-brutal border-2 border-foreground bg-surface">
            {group.items.map((item, i) => (
              <DropdownMenuPrimitive.Item key={i} asChild>
                <a
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={cn(
                    "flex min-h-9 w-full cursor-pointer select-none items-center px-3 py-1.5 text-small text-foreground outline-none",
                    "border-b-2 border-foreground last:border-b-0",
                    "data-[highlighted]:bg-selected",
                    item.active ? "font-bold" : "font-medium",
                  )}
                >
                  {item.label}
                </a>
              </DropdownMenuPrimitive.Item>
            ))}
          </div>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
