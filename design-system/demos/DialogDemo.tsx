"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Button,
  ConfirmDialog,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  Input,
  MutedText,
} from "@/design-system/components";

/**
 * Showcase-only (not part of the design-system): `onConfirm` is a
 * function, so the demo is a small Client Component of its own (functions
 * can't be passed from the Server Component page). Shows the ready-made
 * ConfirmDialog and, below it, a dialog assembled from the building blocks.
 */
export function DialogDemo() {
  const [last, setLast] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-5">
      <div className="flex flex-wrap items-center gap-6">
        <ConfirmDialog
          trigger={
            <Button variant="destructive" icon={<Trash2 />}>
              Delete…
            </Button>
          }
          title="Confirm Delete?"
          description="This action cannot be undone. Are you sure?"
          onConfirm={() => setLast("Gelöscht")}
          onOpenChange={(open) => {
            if (!open) setLast((l) => l ?? "Abgebrochen");
          }}
        />

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Eigener Inhalt…</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>Choose a new name. You can change it again later.</DialogDescription>
            <Input aria-label="New name" placeholder="Project name" />
            <DialogFooter>
              <DialogClose asChild>
                <Button size="sm">Save</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button size="sm" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <MutedText>{last ? `Zuletzt: ${last}` : "Noch nichts bestätigt."}</MutedText>
    </div>
  );
}
