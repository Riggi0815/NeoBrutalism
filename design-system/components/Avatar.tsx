import { ReactNode } from "react";
import { cn } from "../utils";

/** Background per color — one full class string each (Tailwind only
 * generates classes it finds as complete literals, same reason as
 * Switch's table). `surface` (white) exists for the "+N" chip of an
 * AvatarGroup. */
const BG_CLASSES = {
  pink: "bg-pink",
  purple: "bg-purple",
  green: "bg-green",
  yellow: "bg-yellow",
  blue: "bg-blue",
  orange: "bg-orange",
  surface: "bg-surface",
} as const;

export type AvatarColor = keyof typeof BG_CLASSES;

/** Diameter, initials size and icon size per size step. The initials and
 * icon scale with the circle. */
const SIZE_CLASSES = {
  sm: "h-8 w-8 text-badge [&>svg]:h-4 [&>svg]:w-4",
  md: "h-10 w-10 text-small [&>svg]:h-5 [&>svg]:w-5",
  lg: "h-14 w-14 text-h4 [&>svg]:h-7 [&>svg]:w-7",
} as const;

export type AvatarSize = keyof typeof SIZE_CLASSES;

export interface AvatarProps {
  /** Image URL. When set, it fills the circle (initials and `children`
   * are ignored). */
  src?: string;
  /** Alt text for `src`. Defaults to `name`. */
  alt?: string;
  /** The person's name. Gives the avatar its accessible name and, without
   * `src`, supplies the initials ("Jane Doe" → "JD"). */
  name?: string;
  /** Overrides the initials derived from `name`; at most 2 characters. */
  initials?: string;
  /** Content when there is no image and no initials: an icon (sized to the
   * avatar) or any short text. */
  children?: ReactNode;
  /** Background as a palette name. Default `purple`. */
  color?: AvatarColor;
  /** 32px, 40px or 56px. Default `md`. */
  size?: AvatarSize;
  className?: string;
}

/**
 * Up to two uppercase letters: the first letters of the first two words of
 * a name ("Jane Marie Doe" → "JM"); a single word gives its first two
 * letters ("Jane" → "JA"). Iterates by code point so letters outside the
 * basic plane aren't split in half.
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const letters =
    words.length === 1
      ? Array.from(words[0]).slice(0, 2)
      : words.slice(0, 2).map((w) => Array.from(w)[0]);
  return letters.join("").toLocaleUpperCase();
}

/**
 * Neo-Brutalism avatar: a circle with a 2px border, showing an image, two
 * letters, or an icon on a palette color. Flat on purpose — it shows who
 * someone is, it isn't a button (see the shadow rule in tokens.css). Wrap
 * it in a Button or link if it should be clickable.
 */
export function Avatar({
  src,
  alt,
  name,
  initials,
  children,
  color = "purple",
  size = "md",
  className,
}: AvatarProps) {
  const letters = initials
    ? Array.from(initials).slice(0, 2).join("").toLocaleUpperCase()
    : name
      ? getInitials(name)
      : "";

  return (
    <span
      // With a name the whole avatar is one labelled image; the letters
      // inside are decoration, not text to read out.
      role={name ? "img" : undefined}
      aria-label={name || undefined}
      className={cn("relative inline-block shrink-0 rounded-full", SIZE_CLASSES[size], className)}
    >
      <span
        className={cn(
          "flex h-full w-full select-none items-center justify-center overflow-hidden rounded-full border-2 border-foreground font-semibold text-foreground",
          BG_CLASSES[color],
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- a library component can't assume next/image's loader config
          <img src={src} alt={name ? "" : (alt ?? "")} className="h-full w-full object-cover" />
        ) : letters ? (
          <span aria-hidden={name ? "true" : undefined}>{letters}</span>
        ) : (
          children
        )}
      </span>
    </span>
  );
}

export interface AvatarGroupUser {
  name?: string;
  initials?: string;
  src?: string;
  alt?: string;
  color?: AvatarColor;
  children?: ReactNode;
}

export interface AvatarGroupProps {
  users: AvatarGroupUser[];
  /** Size of every avatar in the group. Default `md`. */
  size?: AvatarSize;
  /** Most circles shown, including the "+N" one. Default 4: with more users
   * the last slot becomes "+N" and only `max - 1` avatars are shown. */
  max?: number;
  /** Accessible name of the group, e.g. "Project members". */
  label?: string;
  className?: string;
}

/** How far each avatar slides under the previous one, per size. */
const OVERLAP_CLASSES: Record<AvatarSize, string> = {
  sm: "-ml-1.5",
  md: "-ml-2",
  lg: "-ml-3",
};

/**
 * Avatars in an overlapping row, later ones on top. With more users than
 * `max` (default 4) the last slot turns into a white "+N" circle counting
 * everyone who isn't shown: 7 users → 3 avatars + "+4".
 */
export function AvatarGroup({ users, size = "md", max = 4, label, className }: AvatarGroupProps) {
  const limit = Math.max(2, Math.floor(max));
  const overflow = users.length > limit;
  const shown = overflow ? users.slice(0, limit - 1) : users;
  const hidden = users.length - shown.length;

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center", className)}
    >
      {shown.map((user, i) => (
        <Avatar
          key={i}
          {...user}
          size={size}
          className={i > 0 ? OVERLAP_CLASSES[size] : undefined}
        />
      ))}
      {overflow && (
        <span role="img" aria-label={`${hidden} more`} className={cn("inline-flex", OVERLAP_CLASSES[size])}>
          <Avatar color="surface" size={size}>
            <span aria-hidden="true">+{hidden}</span>
          </Avatar>
        </span>
      )}
    </div>
  );
}
