import { ReactNode } from "react";
import { cn } from "../utils";
import { Heading2 } from "./Typography";

export interface SectionProps {
  id?: string;
  title: string;
  children: ReactNode;
  className?: string;
}

/** Section wrapper: title + horizontal rule, matching the reference design. */
export function Section({ id, title, children, className }: SectionProps) {
  return (
    <section id={id} className={cn("mb-16 scroll-mt-24", className)}>
      <div className="mb-6 flex items-center gap-4">
        <Heading2 className="whitespace-nowrap">{title}</Heading2>
        <div className="h-px flex-1 bg-foreground" />
      </div>
      {children}
    </section>
  );
}
