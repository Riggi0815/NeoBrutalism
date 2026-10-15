"use client";

import { Button, toast } from "@/design-system/components";

/**
 * Showcase-only (not part of the design-system): `toast.*()` has to be
 * called from browser code (an event handler), so the buttons live in a
 * small Client Component. The `<Toaster />` itself sits once in layout.tsx.
 */
export function ToastDemo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Button variant="accent" onClick={() => toast.success("Saved successfully!")}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.notify("New notification received")}>
        Notification
      </Button>
      <Button variant="destructive" onClick={() => toast.error("Failed to upload file")}>
        Error
      </Button>
    </div>
  );
}
