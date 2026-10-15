"use client";

import { CSSProperties, ReactNode, useEffect, useSyncExternalStore } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { Bell, CircleCheck, CircleX, X } from "lucide-react";
import { cn } from "../utils";

/** Hard-shadow offset, per spec (x=4 y=4). */
const SHADOW_OFFSET = "raised";

/**
 * Per variant: background, icon, icon color, close-cross color — each a
 * complete class string, because Tailwind only generates classes it finds
 * as full literals. The surfaces are the same soft role tones as Alert
 * (success = mint, notify = info lila, error = rot), the icons use the
 * matching `-ink` tone so they keep ≥ 4.5:1 on that surface.
 *
 * `type` is the Radix urgency: an error is announced right away
 * (`foreground`, assertive), the others politely (`background`).
 */
const VARIANTS = {
  success: {
    surface: "bg-success-soft",
    icon: CircleCheck,
    iconColor: "text-success-ink",
    closeColor: "text-muted",
    type: "background",
  },
  notify: {
    surface: "bg-info-soft",
    icon: Bell,
    iconColor: "text-info-ink",
    closeColor: "text-muted",
    type: "background",
  },
  error: {
    surface: "bg-danger-soft",
    icon: CircleX,
    iconColor: "text-danger-ink",
    closeColor: "text-muted",
    type: "foreground",
  },
} as const;

export type ToastVariant = keyof typeof VARIANTS;

/* ------------------------------------------------------------------ */
/* The store: `toast.success(...)` can be called from anywhere         */
/* ------------------------------------------------------------------ */

interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: ReactNode;
  /** Milliseconds until it closes itself; `Infinity` = only the cross closes it. */
  duration?: number;
  open: boolean;
}

export interface ToastOptions {
  /** Milliseconds until the toast closes itself. Default: the `Toaster`'s
   * `duration` (5000). `Infinity` keeps it until it is closed by hand. */
  duration?: number;
  /** Own id — a second toast with the same id replaces the first. Also
   * what `toast.dismiss(id)` takes. */
  id?: string;
}

/** How long a closed toast stays mounted so its exit animation can play. */
const EXIT_MS = 250;

let items: ToastItem[] = [];
let counter = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const EMPTY: ToastItem[] = [];
const getSnapshot = () => items;
const getServerSnapshot = () => EMPTY;

function remove(id: string) {
  items = items.filter((t) => t.id !== id);
  emit();
}

function close(id: string) {
  const target = items.find((t) => t.id === id);
  if (!target || !target.open) return;
  items = items.map((t) => (t.id === id ? { ...t, open: false } : t));
  emit();
  setTimeout(() => remove(id), EXIT_MS);
}

function show(variant: ToastVariant, message: ReactNode, options: ToastOptions = {}) {
  const id = options.id ?? `toast-${++counter}`;
  const item: ToastItem = { id, variant, message, duration: options.duration, open: true };
  // Same id: replace in place (keeps its position in the stack).
  items = items.some((t) => t.id === id)
    ? items.map((t) => (t.id === id ? item : t))
    : [...items, item];
  emit();
  return id;
}

/**
 * Open a toast from anywhere in client code — an event handler, an effect,
 * a `.then()` after a request. Each call returns the toast's id.
 *
 * ```ts
 * toast.success("Saved successfully!");
 * toast.notify("New notification received");
 * toast.error("Failed to upload file", { duration: Infinity });
 * ```
 *
 * It needs a `<Toaster />` somewhere in the page (once, in the layout);
 * without one the toasts queue up invisibly and all appear when a Toaster
 * mounts. It can't be called while a Server Component renders — only from
 * code that runs in the browser.
 */
export const toast = {
  success: (message: ReactNode, options?: ToastOptions) => show("success", message, options),
  notify: (message: ReactNode, options?: ToastOptions) => show("notify", message, options),
  error: (message: ReactNode, options?: ToastOptions) => show("error", message, options),
  /** Close one toast by id, or all of them without an id. */
  dismiss: (id?: string) => {
    for (const t of items) if (id === undefined || t.id === id) close(t.id);
  },
};

/* ------------------------------------------------------------------ */
/* Toaster                                                             */
/* ------------------------------------------------------------------ */

const POSITION_CLASSES = {
  "bottom-right": "bottom-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "top-right": "top-0 right-0",
  "top-left": "top-0 left-0",
} as const;

export type ToasterPosition = keyof typeof POSITION_CLASSES;

export interface ToasterProps {
  /** Corner of the screen. Default `bottom-right`. */
  position?: ToasterPosition;
  /** Default time in ms before a toast closes itself. Default 5000. Hovering
   * or focusing a toast pauses the timer. */
  duration?: number;
  /** How many toasts may be visible at once; the oldest closes when a new
   * one would exceed it. Default 5. */
  limit?: number;
  /** Name of the notification region for screen readers (Radix appends the
   * F8 hotkey hint itself when you use the default). */
  label?: string;
}

/**
 * Put ONE `<Toaster />` in the root layout; it draws every toast opened via
 * `toast.success / notify / error`. Built on @radix-ui/react-toast:
 * timer that pauses on hover and keyboard focus, screen-reader announcement
 * (`aria-live`; errors assertively), swipe right to dismiss, F8 jumps into
 * the stack, Esc closes the focused toast.
 */
export function Toaster({
  position = "bottom-right",
  duration = 5000,
  limit = 5,
  label,
}: ToasterProps) {
  const all = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Over the limit: the oldest OPEN ones are asked to close. This changes
  // the store, so it happens in an effect, not while rendering.
  const openIds = all.filter((t) => t.open).map((t) => t.id);
  const excess = openIds.length > limit ? openIds.slice(0, openIds.length - limit) : [];
  const excessKey = excess.join("|");
  useEffect(() => {
    if (excessKey) excessKey.split("|").forEach(close);
  }, [excessKey]);

  const onRight = position.endsWith("right");

  return (
    <ToastPrimitive.Provider duration={duration} swipeDirection={onRight ? "right" : "left"} label={label}>
      {all.map((t) => {
        const { surface, icon: Icon, iconColor, closeColor, type } = VARIANTS[t.variant];
        return (
          <ToastPrimitive.Root
            key={t.id}
            type={type}
            duration={t.duration}
            open={t.open}
            onOpenChange={(next) => {
              if (!next) close(t.id);
            }}
            className={cn(
              "group relative list-none",
              // Enter/exit slide from the screen edge, swipe follows the finger.
              "data-[state=open]:animate-toast-in data-[state=closed]:animate-toast-out",
              // "Reduce motion" in the OS: no slide-in. The toast just appears;
              // the fade-out stays (fading isn't motion). Swiping stays too —
              // the person drives it with their own hand. Stacked variants,
              // because a bare motion-reduce:animate-none loses to the
              // more specific data-[state=open] selector.
              "motion-reduce:data-[state=open]:animate-none",
              "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform data-[swipe=end]:animate-toast-swipe-out",
            )}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-brutal bg-shadow"
              style={{ transform: `translate(var(--offset-${SHADOW_OFFSET}-x), var(--offset-${SHADOW_OFFSET}-y))` }}
            />
            <div
              className={cn(
                "relative flex items-center gap-3 rounded-brutal border-2 border-foreground px-4 py-[11px]",
                surface,
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "inline-flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:-m-0.5 [&>svg]:h-6 [&>svg]:w-6 [&>svg]:shrink-0",
                  iconColor,
                )}
              >
                <Icon />
              </span>
              <ToastPrimitive.Description className="min-w-0 flex-1 text-small leading-snug text-foreground">
                {t.message}
              </ToastPrimitive.Description>
              <ToastPrimitive.Close
                aria-label="Close"
                className={cn(
                  "inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-brutal-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
                  closeColor,
                )}
              >
                <X size={16} aria-hidden="true" />
              </ToastPrimitive.Close>
            </div>
          </ToastPrimitive.Root>
        );
      })}
      <ToastPrimitive.Viewport
        // The side the toasts slide in from (read by the keyframes in tokens.css).
        style={{ "--toast-from": onRight ? "100%" : "-100%" } as CSSProperties}
        // While a modal Dialog is open Radix switches off pointer events on
        // the rest of the page; `pointer-events-auto` keeps the toasts
        // clickable. `data-toast-viewport` lets DialogContent recognise them.
        data-toast-viewport=""
        className={cn(
          "pointer-events-auto fixed z-[100] m-0 flex w-[calc(100vw-1rem)] max-w-[22rem] list-none flex-col gap-3 p-4 outline-none",
          POSITION_CLASSES[position],
        )}
      />
    </ToastPrimitive.Provider>
  );
}
