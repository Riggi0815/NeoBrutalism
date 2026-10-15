import { Download } from "lucide-react";
import { cn } from "../utils";
import { ButtonLink } from "./Button";
import { Card } from "./Card";

export interface PressKitFile {
  /** e.g. "Screenshots" */
  name: string;
  /** What is in it: format, count, resolution — "12 Bilder, 3840 × 2160 px". */
  description?: string;
  /** Always give it: nobody should download 200 MB over mobile data by
   * accident. e.g. "38 MB" */
  size: string;
  href: string;
}

export interface PressKitProps {
  /** One row per file. Suggested order: factsheet, logos, screenshots,
   * key art, trailer. */
  files: PressKitFile[];
  /** Optional: everything in one archive, shown above the list. */
  archive?: { href: string; size: string };
  className?: string;
}

/**
 * Press kit: every file on its own row with what's inside and how big it
 * is, each downloadable on its own. Optionally one archive with everything
 * on top.
 *
 * Server Component.
 */
export function PressKit({ files, archive, className }: PressKitProps) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {archive && (
        <div>
          <ButtonLink href={archive.href} download icon={<Download />}>
            Alles herunterladen (ZIP, {archive.size})
          </ButtonLink>
        </div>
      )}
      <Card>
        <ul className="divide-y-2 divide-foreground">
          {files.map((file) => (
            <li
              key={file.href}
              className="flex flex-col items-start gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-6"
            >
              <div className="min-w-0 flex-1">
                <p className="text-body font-semibold text-foreground">{file.name}</p>
                {file.description && (
                  <p className="text-small text-muted">{file.description}</p>
                )}
                {/* Phone: size as its own line under the description, so
                 * every row has the same shape. Desktop: its own column. */}
                <p className="text-small text-muted tabular-nums sm:hidden">{file.size}</p>
              </div>
              <span className="hidden text-small text-muted tabular-nums sm:inline">{file.size}</span>
              <ButtonLink
                href={file.href}
                download
                variant="outline"
                icon={<Download />}
              >
                Herunterladen
                {/* Visible text first, file after: the accessible name
                 * starts with what sighted users see (WCAG "label in
                 * name"), and five identical "Herunterladen" links become
                 * distinguishable in a screen reader's link list. */}
                <span className="sr-only">
                  : {file.name}, {file.size}
                </span>
              </ButtonLink>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
