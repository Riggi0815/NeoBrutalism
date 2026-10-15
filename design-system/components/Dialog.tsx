"use client";

import { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { TriangleAlert } from "lucide-react";
import { cn } from "../utils";
import { Button } from "./Button";

/** Hard-shadow offset, per spec (x=4 y=4). */
const SHADOW_OFFSET = "raised";

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

/** The dialog's state holder. Props: `open`, `defaultOpen`, `onOpenChange`.
 * Renders nothing itself. */
export const Dialog = DialogPrimitive.Root;

/** Whatever opens the dialog. Use `asChild` to make your own button the
 * trigger: `<DialogTrigger asChild><Button>Open</Button></DialogTrigger>`. */
export const DialogTrigger = DialogPrimitive.Trigger;

/** Closes the dialog on click. Use `asChild` to wrap your own button. */
export const DialogClose = DialogPrimitive.Close;

export interface DialogContentProps
  extends Omit<ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, "className"> {
  /** Extra classes for the white panel (e.g. a different `max-w-*`). */
  className?: string;
}

/**
 * The dialog box: dark overlay over the page, and a centered white panel
 * with 2px border, 8px radius and the hard x=4 y=4 shadow. Built on
 * @radix-ui/react-dialog, which supplies `role="dialog"`, `aria-modal`,
 * the focus trap (Tab stays inside), Esc to close, closing on a click on
 * the overlay, locking page scroll and returning focus to whatever opened
 * it — we only skin it.
 *
 * The shadow is a real element (see Card.tsx for why). The positioned
 * element is the Radix content itself, which has NO background of its
 * own; the shadow and the panel sit inside it.
 *
 * Toasts stay clickable while a dialog is open (see Toast.tsx).
 *
 * Radix expects a `DialogTitle` and a `DialogDescription` inside; without
 * them it logs a warning in development (screen readers announce both when
 * the dialog opens). If a dialog truly has no description, pass
 * `aria-describedby={undefined}` here to silence the warning.
 */
export function DialogContent({
  className,
  children,
  onInteractOutside,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/50" />
      <DialogPrimitive.Content
        {...props}
        onInteractOutside={(event) => {
          onInteractOutside?.(event);
          // A toast that opens while the dialog is open (e.g. "Failed to
          // save") lives outside the dialog. Clicking its cross must not
          // count as "clicked outside" and close the dialog.
          const target = event.target as Element | null;
          if (target?.closest?.("[data-toast-viewport]")) event.preventDefault();
        }}
        className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 outline-none"
      >
        <div className="relative">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-brutal bg-shadow"
            style={{ transform: `translate(var(--offset-${SHADOW_OFFSET}-x), var(--offset-${SHADOW_OFFSET}-y))` }}
          />
          <div
            className={cn(
              "relative flex max-h-[calc(100vh-4rem)] flex-col gap-3 overflow-y-auto rounded-brutal border-2 border-foreground bg-surface p-5",
              className,
            )}
          >
            {children}
          </div>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export interface DialogTitleProps {
  /** Shown before the title, drawn at 20×20. */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Title row: optional icon (20×20) and the heading. It is styled like an
 * `h4` (16px) but is an `<h2>` element: a dialog is a new level-2 section
 * of the page for a screen reader, and Radix wires it up as the dialog's
 * accessible name.
 *
 * Like the Alert, the icon sits in a 20px slot while the svg inside is
 * drawn at 24px with a -2px margin, so a lucide icon's visible glyph is a
 * full 20px (lucide leaves a 2px inset in its 24px viewBox).
 */
export function DialogTitle({ icon, children, className }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      className={cn("flex items-center gap-2 text-h4 font-semibold text-foreground", className)}
    >
      {icon && (
        <span
          aria-hidden="true"
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:-m-0.5 [&>svg]:h-6 [&>svg]:w-6 [&>svg]:shrink-0"
        >
          {icon}
        </span>
      )}
      {children}
    </DialogPrimitive.Title>
  );
}

/** The explanation under the title, in muted gray. */
export function DialogDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-small leading-normal text-muted", className)}
      {...props}
    />
  );
}

/** Row for the buttons, left-aligned. It wraps on very narrow screens. */
export function DialogFooter({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("mt-1 flex flex-wrap items-center gap-3", className)} {...props} />;
}

/* ------------------------------------------------------------------ */
/* ConfirmDialog                                                       */
/* ------------------------------------------------------------------ */

export interface ConfirmDialogProps {
  /** Heading, e.g. "Confirm Delete?". */
  title: ReactNode;
  /** What will happen, e.g. "This action cannot be undone. Are you sure?". */
  description: ReactNode;
  /** Label of the confirm button. Default "Delete". */
  confirmLabel?: ReactNode;
  /** Label of the cancel button. Default "Cancel". */
  cancelLabel?: ReactNode;
  /** Called when the confirm button is clicked; the dialog closes after it. */
  onConfirm?: () => void;
  /** Red confirm button (default) for dangerous actions. `false` makes it
   * a normal pink primary button. */
  destructive?: boolean;
  /** Icon before the title, drawn at 20×20. Default: an orange warning triangle. */
  icon?: ReactNode;
  /** What opens the dialog (a single element, e.g. a `Button`). Leave it
   * out to control the dialog yourself with `open`/`onOpenChange`. */
  trigger?: ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * The ready-made confirm dialog from the design: warning icon + title,
 * explanation, and a "Delete" and "Cancel" button. One call instead of
 * assembling the building blocks. Esc, a click on the overlay and "Cancel"
 * close it without calling `onConfirm`. With `destructive` (the default)
 * the keyboard focus starts on "Cancel", not on the red button.
 */
export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  destructive = true,
  icon,
  trigger,
  open,
  defaultOpen,
  onOpenChange,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        // Radix would focus the first button, i.e. "Delete" — then a stray
        // Enter or Space would confirm a dangerous action. For a destructive
        // dialog the focus starts on "Cancel" instead.
        onOpenAutoFocus={(event) => {
          if (destructive) {
            event.preventDefault();
            (event.currentTarget as HTMLElement)
              .querySelector<HTMLElement>("[data-initial-focus]")
              ?.focus();
          }
        }}
      >
        <DialogTitle icon={icon ?? <TriangleAlert className={destructive ? "text-danger-ink" : "text-foreground"} />}>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button size="sm" variant={destructive ? "destructive" : "primary"} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button data-initial-focus size="sm" variant="outline">
              {cancelLabel}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
