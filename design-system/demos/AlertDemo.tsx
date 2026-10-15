"use client";

import { useState } from "react";
import { Alert, Button, type AlertProps } from "@/design-system/components";

/**
 * Showcase helper, not part of the design system: an Alert with a button
 * next to it that hides and shows it. Showing it again inserts a fresh
 * `role="alert"` / `role="status"` element, which is exactly what makes a
 * screen reader announce it — so this is also the way to test that.
 *
 * It's a Client Component because the button needs an onClick; the page
 * itself stays a Server Component (see "Server- vs. Client-Components" in
 * the Wiki).
 */
export function AlertDemo(props: AlertProps) {
  const [visible, setVisible] = useState(true);

  return (
    <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
      {/* min-h keeps the row's height while the alert is hidden, so the
       * page below doesn't jump; the fixed-width slot keeps the button from
       * shifting when its label changes between "Hide" and "Show". */}
      <div className="min-h-24 min-w-72 flex-1">{visible && <Alert {...props} />}</div>
      <div className="w-20 shrink-0">
        <Button size="sm" variant="outline" onClick={() => setVisible((v) => !v)}>
          {visible ? "Hide" : "Show"}
        </Button>
      </div>
    </div>
  );
}
