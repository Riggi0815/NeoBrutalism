"use client";

import { useState } from "react";
import { Mail, Settings, Share2, Trash2, User } from "lucide-react";
import { DropdownMenu, MutedText } from "@/design-system/components";

/**
 * Showcase-only (not part of the design-system): `onSelect` is a function,
 * and functions can't be passed from the Server Component page, so the
 * demo lives in its own small Client Component. It also shows what was
 * chosen last, so the entries visibly "do" something.
 */
export function DropdownDemo() {
  const [last, setLast] = useState<string | null>(null);
  const pick = (name: string) => () => setLast(name);

  return (
    <div className="flex flex-col items-start gap-4">
      <DropdownMenu
        label="Options"
        icon={<Settings />}
        items={[
          { label: "Profile", icon: <User />, onSelect: pick("Profile") },
          { label: "Settings", icon: <Settings />, onSelect: pick("Settings") },
          { label: "Messages", icon: <Mail />, onSelect: pick("Messages") },
          { label: "Share", icon: <Share2 />, onSelect: pick("Share") },
          { label: "Delete", icon: <Trash2 />, destructive: true, onSelect: pick("Delete") },
        ]}
      />
      <MutedText>{last ? `Zuletzt gewählt: ${last}` : "Noch nichts gewählt."}</MutedText>
    </div>
  );
}
