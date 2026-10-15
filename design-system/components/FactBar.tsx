import { ReactNode } from "react";
import { cn } from "../utils";

export interface FactBarFact {
  label: string;
  value: ReactNode;
}

export interface FactBarProps {
  /** e.g. "PC, Switch" */
  platforms?: ReactNode;
  /** e.g. "1, lokal kooperativ bis 2" */
  players?: ReactNode;
  /** e.g. "Frühjahr 2027" */
  release?: ReactNode;
  /** e.g. "Deutsch, Englisch" */
  languages?: ReactNode;
  /** As text, e.g. "USK ab 6 (beantragt)". Official rating marks only as
   * the original file from the rating board — never redrawn. */
  ageRating?: ReactNode;
  /** More facts after the fixed five, e.g. price or play time. */
  extra?: FactBarFact[];
  className?: string;
}

/** Shown for a fact that is not known yet. A missing row would hide that
 * the question exists; "noch offen" answers it honestly. */
const OPEN = "noch offen";

/**
 * Everything someone wants to know before buying, as a definition list in
 * a FIXED order: platforms, players, release, languages, age rating. Same
 * order on every game page, so people find the line they look for.
 *
 * Flat, no shadow: it is information, not a layer (shadow rule in
 * tokens.css). Sits on whatever surface it is placed on — usually at the
 * bottom of a BackSite.
 */
export function FactBar({
  platforms,
  players,
  release,
  languages,
  ageRating,
  extra = [],
  className,
}: FactBarProps) {
  const facts: FactBarFact[] = [
    { label: "Plattformen", value: platforms ?? OPEN },
    { label: "Spieler", value: players ?? OPEN },
    { label: "Erscheint", value: release ?? OPEN },
    { label: "Sprachen", value: languages ?? OPEN },
    { label: "Altersfreigabe", value: ageRating ?? OPEN },
    ...extra,
  ];
  return (
    <dl
      className={cn(
        "grid grid-cols-2 border-t-2 border-foreground sm:grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))]",
        className,
      )}
    >
      {facts.map((fact) => (
        <div key={fact.label} className="py-3 pr-4">
          <dt className="text-small text-muted">{fact.label}</dt>
          <dd
            className={cn(
              "mt-0.5 text-body font-semibold",
              fact.value === OPEN ? "text-muted" : "text-foreground",
            )}
          >
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
