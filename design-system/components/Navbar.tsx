import { Heading3 } from "./Typography";

export interface NavLink {
  label: string;
  href: string;
}

const DEFAULT_LINKS: NavLink[] = [
  { label: "Colors", href: "#colors" },
  { label: "Typography", href: "#typography" },
  { label: "Buttons", href: "#buttons" },
  { label: "Badges", href: "#badges" },
  { label: "Inputs", href: "#inputs" },
  { label: "Textareas", href: "#textareas" },
  { label: "Selects", href: "#selects" },
  { label: "Checkboxes", href: "#checkboxes" },
  { label: "Radios", href: "#radios" },
  { label: "Switches", href: "#switches" },
  { label: "Sliders", href: "#sliders" },
  { label: "Cards", href: "#cards" },
  { label: "Avatars", href: "#avatars" },
  { label: "Alerts", href: "#alerts" },
  { label: "Progress", href: "#progress" },
  { label: "Tabs", href: "#tabs" },
  { label: "Accordion", href: "#accordion" },
  { label: "Tooltip", href: "#tooltip" },
  { label: "Table", href: "#table" },
  { label: "Breadcrumb", href: "#breadcrumb" },
  { label: "Pagination", href: "#pagination" },
  { label: "Dropdown", href: "#dropdown" },
  { label: "Header", href: "#header" },
  { label: "Dialog", href: "#dialog" },
  { label: "Toast", href: "#toast" },
];

export interface NavbarProps {
  title?: string;
  links?: NavLink[];
}

/** Sticky Neo-Brutalism navbar with a solid bottom border. */
export function Navbar({ title = "Component Library", links = DEFAULT_LINKS }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4">
        <Heading3>{title}</Heading3>
        <ul className="flex flex-wrap gap-x-6 gap-y-1">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-small font-medium text-foreground hover:underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
