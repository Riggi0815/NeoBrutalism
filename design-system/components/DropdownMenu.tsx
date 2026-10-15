"use client";

import { ReactNode } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../utils";

/** Hard-shadow offset of the trigger AND the open menu — same as Select. */
const SHADOW_OFFSET = "raised";

export interface DropdownMenuItem {
  /** Text of the entry. */
  label: ReactNode;
  /** Shown before the label, drawn at 14×14. */
  icon?: ReactNode;
  /** Called when the entry is chosen (click, Enter, Space). */
  onSelect?: () => void;
  /** Makes the entry a real link (`<a href>`) instead of a button. */
  href?: string;
  /** Red label, for dangerous actions like "Delete". */
  destructive?: boolean;
  disabled?: boolean;
}

export interface DropdownMenuProps {
  /** Fixed text on the trigger button (unlike Select, it never changes). */
  label: string;
  /** Shown before the label on the trigger, drawn at 16×16. */
  icon?: ReactNode;
  /** The entries, top to bottom. */
  items: DropdownMenuItem[];
  /** Which edge of the trigger the menu lines up with. Default `start`. */
  align?: "start" | "center" | "end";
  disabled?: boolean;
  className?: string;
}

/**
 * Neo-Brutalism dropdown menu: looks and behaves like `Select` (same
 * trigger, same open-menu surface), except the trigger label is fixed and
 * the entries DO something (`onSelect`, or a link via `href`) instead of
 * choosing a value. Built on @radix-ui/react-dropdown-menu, which supplies
 * ARIA (`role="menu"`/`menuitem`), arrow keys, Home/End, type-ahead
 * (typing "S" jumps to "Settings"), Esc, focus return to the trigger and
 * flipping at the screen edge — we only skin it.
 *
 * Entries are separated by 2px lines; the highlighted one (hover or arrow
 * keys) gets the selected color (bg-selected), like in Select.
 */
export function DropdownMenu({
  label,
  icon,
  items,
  align = "start",
  disabled,
  className,
}: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root>
      {/* Disabled = neutral and flat, same rule as Button. */}
      <div className={cn("relative inline-block rounded-brutal", className)}>
        {!disabled && (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-brutal bg-shadow"
            style={{ transform: `translate(var(--offset-${SHADOW_OFFSET}-x), var(--offset-${SHADOW_OFFSET}-y))` }}
          />
        )}
        <DropdownMenuPrimitive.Trigger
          disabled={disabled}
          className={cn(
            "group relative flex h-8 cursor-pointer items-center gap-2 rounded-brutal border-2 px-3 text-small font-bold outline-none",
            disabled
              ? "border-disabled-foreground bg-disabled text-disabled-foreground"
              : "border-foreground bg-surface text-foreground",
            "transition-transform duration-100 ease-out",
            // Same "lift while open" as Select's trigger.
            !disabled && "data-[state=open]:-translate-x-0.5 data-[state=open]:-translate-y-0.5",
            "focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed",
          )}
        >
          {icon && (
            <span aria-hidden="true" className="inline-flex shrink-0 items-center [&>svg]:h-4 [&>svg]:w-4">
              {icon}
            </span>
          )}
          <span>{label}</span>
          <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:absolute [&>svg]:h-4 [&>svg]:w-4">
            <ChevronDown className="group-data-[state=open]:hidden" aria-hidden="true" />
            <ChevronUp className="hidden group-data-[state=open]:block" aria-hidden="true" />
          </span>
        </DropdownMenuPrimitive.Trigger>
      </div>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          // 4px + the 2px the trigger lifts while open = about 6px visible gap.
          sideOffset={4}
          collisionPadding={8}
          className="relative z-50"
        >
          {/* Hard shadow as a real element behind the surface (see Card.tsx). */}
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-brutal bg-shadow"
            style={{ transform: `translate(var(--offset-${SHADOW_OFFSET}-x), var(--offset-${SHADOW_OFFSET}-y))` }}
          />
          <div className="relative min-w-[max(var(--radix-dropdown-menu-trigger-width),9rem)] overflow-hidden rounded-brutal border-2 border-foreground bg-surface">
            {items.map((item, i) => {
              const itemClass = cn(
                "flex min-h-[30px] w-full cursor-pointer select-none items-center gap-2 px-3 py-[5px] text-left text-small font-medium outline-none",
                "border-b-2 border-foreground last:border-b-0",
                "data-[highlighted]:bg-selected",
                "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
                item.destructive ? "text-danger-ink font-bold" : "text-foreground",
              );
              const content = (
                <>
                  {item.icon && (
                    <span aria-hidden="true" className="inline-flex shrink-0 items-center [&>svg]:h-3.5 [&>svg]:w-3.5">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.label}</span>
                </>
              );
              return (
                <DropdownMenuPrimitive.Item
                  key={i}
                  asChild={Boolean(item.href)}
                  disabled={item.disabled}
                  onSelect={item.onSelect}
                  className={itemClass}
                >
                  {item.href ? <a href={item.href}>{content}</a> : content}
                </DropdownMenuPrimitive.Item>
              );
            })}
          </div>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
