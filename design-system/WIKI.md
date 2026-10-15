# Component Library – Wiki

Sep 26, 2026 · @Rick Schlömilch · aktualisiert Oct 12, 2026

Praktischer Leitfaden zur Neo-Brutalism Component Library: wie du die Komponenten aus `src/design-system/` in einem Projekt einsetzt. Wie die Komponenten intern gebaut sind, steht nicht hier — das steht als Kommentare direkt im jeweiligen Code.

## Quick Start

So setzt du die Library in einem neuen Projekt auf (Next.js App Router oder jedes andere Setup mit Tailwind CSS v4).

1. Den kompletten Ordner `src/design-system/` in dein neues Projekt kopieren (nichts umbenennen). Er enthält alles, was die Library ausmacht: Komponenten und `tokens.css` — in der steckt auch die Schrift.
2. Dependencies installieren:

```
npm install clsx tailwind-merge lucide-react
```

3. In `src/app/globals.css` (bzw. der zentralen CSS-Datei) die Library einbinden — eine Zeile nach Tailwind:

```css
@import "tailwindcss";
@import "../design-system/tokens.css";
```

4. Fertig. Die Schrift liegt als Datei in `design-system/fonts/`, `tokens.css` bindet sie mit einem relativen Pfad ein und setzt sie per `body { font-family }` — **kein** `next/font`, keine Google-Anfrage, nichts im Layout. Next.js findet die Datei über den Pfad im CSS und liefert sie mit Hash im Namen aus. Im `<body>` nur noch Hintergrund und Textfarbe:

```tsx
<body className="bg-background text-foreground antialiased">
```

```tsx
import { Button, Card, Heading1 } from "@/design-system/components";
```

Liegt der Ordner außerhalb von `src/` oder in `node_modules`, Tailwind zusätzlich mitteilen, wo die Komponenten liegen, sonst fehlen ihre Klassen:

```css
@source "../pfad/zu/design-system";
```

## Die eigene Handschrift: was wo liegt

Alles, was die Library _aussehen lässt wie sie aussieht_, liegt im `design-system/`-Ordner und wandert beim Kopieren mit:

| Datei        | Inhalt                                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `tokens.css` | Schrift-Einbindung (aktuell Archivo, SIL Open Font License), Farben (Palette + Rollen), Typo-Skala, Radien, Schatten-Offsets, Animationen |
| `fonts/`     | die Schriftdatei(en) als `.woff2`, von `tokens.css` per relativem Pfad geladen |
| `utils.ts`   | `cn()` — kennt die eigenen Schriftgrößen-Klassen                                                                                            |

Die Schrift liegt bewusst als eigene Datei neben `tokens.css`, nicht mehr eingebettet. Eingebettet (base64) steckte sie im CSS, und CSS blockiert das erste Anzeigen: Jede Seite blieb leer, bis die ganze Schrift geladen war (gemessen bei gedrosseltem Mobilfunk: erste Anzeige nach 1,6 s, als eigene Datei nach 0,6 s; das CSS schrumpfte komprimiert von 71 auf 10 KB). Als Datei zeigt der Browser die Seite sofort in der Ersatzschrift (`Archivo Fallback`, so vermessen, dass nichts springt) und tauscht, sobald die Schrift da ist; außerdem bleibt sie getrennt im Cache. Beim Kopieren den ganzen `design-system/`-Ordner nehmen, dann wandert `fonts/` mit.

Keine Komponente kennt einen Hex-Wert, einen Schriftnamen oder eine Schattengröße — sie benutzen nur Tokens. Daraus folgt:

- **Schrift tauschen:** die neue `.woff2` nach `design-system/fonts/` legen, den Pfad im `@font-face` oben in `tokens.css` anpassen, den Namen dort und in `--font-sans` ändern — und die Werte der Ersatzschrift (`Archivo Fallback`, darunter) neu berechnen, sonst springt der Text beim Laden wieder.
- **Marke pro Projekt:** den Ordner unverändert lassen und im Projekt nur die Rollen überschreiben (siehe unten).
- **Den ganzen Stil justieren:** z. B. `--offset-raised-x` und `--offset-raised-y` von 4px auf 6px — alle Buttons, Felder und Karten folgen. Oder gleich eine andere Stil-Datei einsetzen (siehe „Stile wechseln“).

## Design Tokens

Alle Werte kommen aus `src/design-system/tokens.css` und werden automatisch zu Tailwind-Utility-Klassen. **Konkrete Werte (Hex, px) stehen in diesem Wiki nur in diesem Abschnitt**, für den aktiven Stil. Die Abschnitte zu den Komponenten nennen Tokens (`--border-width`, `rounded-brutal`, Rolle `selected` …), denn die Werte wechseln mit dem Stil. Steht anderswo ein Hex-Wert oder eine Pixelzahl für Rahmen, Radius oder Schatten, ist die Stelle veraltet. Du referenzierst sie nie direkt als Hex-Wert — immer über die Klasse, dann bleibt alles an einer Stelle änderbar.

### Zwei Ebenen: Palette und Rollen

Die **Palette** sind die Rohfarben. Die **Rollen** sagen, was eine Farbe _bedeutet_. Komponenten benutzen für Bedeutung immer die Rolle — nie direkt `bg-pink`.

**Aktiver Stil: Emaille-Schild** (`tokens.css`). Die Werte unten gelten für Emaille; die anderen Stile haben dieselben Namen mit anderen Werten. Die Showcase-Seite zeigt unter „Color Palette“ immer die Werte des gerade aktiven Stils.

| Rolle     | Bedeutung                                                         | Emaille                        | Klassen                                                                    |
| --------- | ----------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------- |
| primary   | Hauptaktion                                                       | Petrol #2F6F73, weiße Schrift  | `bg-primary`, `text-primary-foreground`, `text-primary-ink`                |
| secondary | Nebenaktion                                                       | Altrosa #D7A1A0                | `bg-secondary`, `text-secondary-foreground`                                |
| accent    | dritte, freundliche Aktion; Standard für Switch, Slider, Progress | Avocado #A3AE63                | `bg-accent`, `text-accent-foreground`                                      |
| danger    | Löschen, Fehler                                                   | Weinrot #9E2B3A, weiße Schrift | `bg-danger`, `text-danger-foreground`, `bg-danger-soft`, `text-danger-ink` |
| success   | erledigt                                                          | Avocado #A3AE63                | `bg-success`, `bg-success-soft`, `text-success-ink`                        |
| warning   | Achtung, prüfen                                                   | Senf #E0AE45                   | `bg-warning`, `bg-warning-soft`, `text-warning-ink`                        |
| info      | neutraler Hinweis                                                 | Taubenblau #9FB4CC             | `bg-info`, `bg-info-soft`, `text-info-ink`                                 |
| selected  | gewählt / hervorgehoben (Tabs, Menü, Tabellenkopf, Akkordeon)     | Helles Petrol #C4D8D8          | `bg-selected`                                                              |
| disabled  | deaktiviert                                                       | Salbeigrau #CBCFBD             | `bg-disabled`, `text-disabled-foreground`                                  |
| shadow    | Farbe der harten Schatten                                         | = Rahmenfarbe #2B2620          | `bg-shadow`                                                                |

Varianten je Rolle: `-soft` = heller Hintergrund (Alert, Toast), `-ink` = Textfarbe mit mind. 4,5:1 Kontrast, `-foreground` = Text _auf_ der vollen Farbe.

Warum Info und Success verschiedene Farbfamilien haben: Im ersten Entwurf lagen Blau und Türkis so nah beieinander, dass Info- und Erfolgs-Hinweise als Fläche praktisch gleich aussahen (1,03:1). Jeder Stil muss das einhalten.

**Eigene Marke in einem neuen Projekt** — Ordner unverändert kopieren und in der `globals.css` des Projekts nach dem Import nur die Rollen überschreiben:

```css
:root {
  --color-primary: #2f6bff;
  --color-primary-foreground: #ffffff;
  --color-primary-ink: #1f4fd1;
}
```

Danach die Kontraste prüfen (WCAG AA: 4,5:1 für Text, 3:1 für große Schrift und Rahmen).

### Palette

| Token                  | Emaille                                                       | Utility-Klassen                                            |
| ---------------------- | ------------------------------------------------------------- | ---------------------------------------------------------- |
| pink                   | Altrosa #D7A1A0                                               | `bg-pink`, `border-pink`                                   |
| purple                 | Flieder #A895B5                                               | `bg-purple`, `border-purple`                               |
| green                  | Avocado #A3AE63                                               | `bg-green`, `border-green`                                 |
| yellow                 | Senf #E0AE45                                                  | `bg-yellow`, `border-yellow`                               |
| blue                   | Taubenblau #9FB4CC                                            | `bg-blue`, `border-blue`                                   |
| orange                 | Ocker #C98A55                                                 | `bg-orange`, `border-orange`                               |
| sky                    | Helles Petrol #C4D8D8                                         | `bg-sky`, `border-sky`                                     |
| destructive            | Weinrot #9E2B3A                                               | `bg-destructive`, `text-destructive`, `border-destructive` |
| background             | Salbei #D9DDCB                                                | `bg-background`, `text-background`                         |
| foreground             | Dunkelbraun #2B2620 (Text, Rahmen)                            | `bg-foreground`, `text-foreground`, `border-foreground`    |
| muted                  | #57503F                                                       | `text-muted`                                               |
| surface                | Emaille-Weiß #F7F4EC                                          | `bg-surface`                                               |
| sand                   | #CBCFBD                                                       | `bg-sand`                                                  |
| Pastell-Töne (`-soft`) | Palettenfarbe zu 30 % auf Weiß                                | `bg-pink-soft`, `bg-blue-soft` usw.                        |
| Text-Töne (`-ink`)     | gleicher Farbton, dunkler, ≥ 4,8:1 auf background und surface | `text-pink-ink`, `text-green-ink` usw.                     |

Die Namen der Palette (pink, purple, …) bleiben in jedem Stil gleich, damit Code nicht bricht, auch wenn „pink“ in Emaille ein Altrosa ist.

**Palettenfarben nie als Textfarbe benutzen.** Als Text erreichen sie nur 1,8–2,5:1 (Grün auf Creme: 1,8:1). Für farbigen Text immer die `-ink`-Variante oder `<ColorText>`.

### Typografie-Skala

Fließtext in drei klar getrennten Stufen (12 / 14 / 16), Überschriften auf einer Skala mit Faktor 1,25 ab 16px. Display, h1 und h2 wachsen fließend mit der Bildschirmbreite (`clamp`).

| Utility-Klasse             | Größe       | Wofür                                                                                      |
| -------------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| `text-display`             | 36 → 49px   | Hero-Überschrift, eng gesetzt — einmal pro Seite                                           |
| `text-h1`                  | 31 → 39px   | Seitentitel                                                                                |
| `text-h2`                  | 25 → 31px   | Abschnittstitel                                                                            |
| `text-h3`                  | 25px        | Untertitel                                                                                 |
| `text-h4`                  | 20px        | Überschrift in einem Block                                                                 |
| `text-card-title`          | = h4 (20px) | Titel von Card, Alert, Dialog                                                              |
| `text-body` / `text-field` | 16px        | Fließtext, Formularfelder (nie unter 16px — iOS zoomt sonst)                               |
| `text-small`               | 14px        | Beschreibungen, Tabellen, kleine Buttons (hieß früher `text-accent` — siehe Hinweis unten) |
| `text-badge`               | 12px        | Badges, nur fett und kurz                                                                  |

**Wichtig:** Ein Größen-Token darf nie so heißen wie eine Farbe. `--text-accent` (Größe) und `--color-accent` (Farbe) erzeugen beide die Klasse `text-accent` — Tailwind macht daraus nur die Farbe, die Größe verschwindet ohne Fehlermeldung. Deshalb heißt die 14px-Stufe jetzt `text-small`.

### Schatten

Harte Schatten sind keine Tailwind-Klassen, sondern Custom Properties (`:root` in `tokens.css`), mit X und Y getrennt:

| Token                    | Emaille (aktueller Wert)                       | Wofür                                                                         |
| ------------------------ | ---------------------------------------------- | ----------------------------------------------------------------------------- |
| `--offset-control-x/-y`  | 1 / 2px                                        | kleine Bedienelemente: Checkbox, Radio, Switch, Slider, Tooltip, Seitenzahlen |
| `--offset-raised-x/-y`   | 2 / 4px                                        | Buttons, Felder, Card, Alert, Tabelle, Menüs, Dialog, Toast                   |
| `--offset-floating-x/-y` | 4 / 8px                                        | besonders hervorgehobene Card (`shadow="large"`)                              |
| `--color-shadow`         | = foreground                                   | Farbe aller harten Schatten (Klasse `bg-shadow`)                              |

**Regel:** Ein Schatten bedeutet „Ebene“ — etwas, das man anfasst oder das über der Seite liegt. Reine Anzeigen (Badge, Avatar, Progress, Breadcrumb) sind flach. Nur Klickbares bewegt sich beim Hover und Drücken.

**Deaktiviert** sieht überall gleich aus: kein Schatten, Sandfläche (`bg-disabled`), grauer Rahmen und grauer Text (`disabled-foreground`). Gilt für Button, Pagination, Input, Textarea, Select, Dropdown-Auslöser, Checkbox, Radio, Switch und Slider. Feld-Labels über Input/Select/Slider bleiben in voller Farbe.

### Weitere Stil-Tokens

| Token                                                                        | Wirkung                                                                                |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `--border-width`                                                             | Stärke aller `border-2`-Rahmen der Library                                             |
| `--border-width-flat`                                                        | Rahmenstärke der ruhigen Stufe (`flat`, Wiki-Bausteine), Standard 2px                  |
| `--heading-stretch` / `--control-stretch`                                    | Breite von Überschriften bzw. Buttons (nur Schriften mit Breiten-Achse, z. B. Archivo) |
| `--page-texture`                                                             | Bild hinter der Seite, z. B. Papierkorn (`none` = glatt)                               |
| `--card-mask`, `--card-shadow-layer`, `--card-filter`, `--card-border-width` | Kartenrand, z. B. der perforierte Briefmarkenrand                                      |

## Stile wechseln

Jeder Stil ist eine **komplette** `tokens.css`; seine Schrift liegt in `design-system/fonts/`. Stil wechseln = die Datei als `src/design-system/tokens.css` einsetzen (alte vorher sichern) und den Dev-Server neu starten. An den Komponenten ändert sich nichts. Der Abschnitt **Vorlage** ganz oben auf der Showcase-Seite zeigt den ganzen Look auf einen Blick.

Aktuell liegt nur der Stil Emaille im Projekt. Einen neuen Stil anlegen: `tokens.css` kopieren und nur die Werte ändern, nie die Namen. Danach die Kontraste neu prüfen: Text auf jeder Fläche mindestens 4,5:1, die `-ink`-Töne auf `background` und `surface`, und `foreground` auf allen sieben Palettenfarben (die Spiele-Bausteine schreiben darauf).

### Radius

Eckradius: `rounded-brutal` (Emaille: 14px) — auf allen Karten und Buttons verwendet.

Für kleine Elemente (Checkbox, Icon-Kacheln im Header, Toast-Icon) gibt es zusätzlich `rounded-brutal-sm` (Emaille: 5px) — bei einer 20px-Box würde der große Radius sie zu einem Klecks abrunden. Voll runde Formen (Switch, Slider, Radio, Badge) nutzen `rounded-pill` (Emaille: 16px).

Wichtig beim eigenen Kombinieren von Klassen: immer `cn()` aus `src/design-system/utils.ts` benutzen statt Klassen als String zu verketten. `cn()` nutzt `tailwind-merge`, das widersprüchliche Klassen (z. B. zwei `bg-*`) sauber auflöst, sodass die zuletzt übergebene gewinnt — ohne `cn()` können sich Klassen gegenseitig kaputt machen.

## Typografie-Komponenten

Aus `src/design-system/components/Typography.tsx`. Nutze immer diese Komponenten statt roher `<h1>`/`<p>`-Tags mit Klassen — dann ändert sich die Schriftgröße überall zentral, wenn du später `tokens.css` anpasst.

| Komponente                 | Wofür                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| `<Display>`                | Hero-Überschrift (36 → 49px), rendert `<h1>`, per `as` auch `h2`/`p` — einmal pro Seite          |
| `<Heading1>`               | Seitentitel (31 → 39px)                                                                          |
| `<Heading2>`               | Abschnittstitel (25 → 31px), z. B. von `<Section>` genutzt                                       |
| `<Heading3>`               | Untertitel (25px)                                                                                |
| `<Heading4>`               | Kleine Überschrift innerhalb eines Blocks (20px)                                                 |
| `<Text>`                   | Normaler Fließtext (16px)                                                                        |
| `<MutedText>`              | Sekundärer, gräulicher Text (16px)                                                               |
| `<ColorText color="pink">` | Kurzer, farbig hervorgehobener Inline-Text (14px), nutzt automatisch die lesbare `-ink`-Variante |

Beispiel:

```tsx
import { Heading1, Text, ColorText } from "@/design-system/components";

<Heading1>Willkommen</Heading1>
<Text>
  Ein normaler Absatz mit einem <ColorText color="pink">hervorgehobenen Wort</ColorText> darin.
</Text>
```

Alle Textkomponenten akzeptieren zusätzlich ein optionales `className`, falls du im Einzelfall etwas anpassen musst (z. B. Abstand).

## Card

Die Basis-Karte mit hartem Schatten (`--offset-raised`), Eckradius `rounded-brutal` und Rahmen `--border-width`, dazu vier Bausteine für den Inhalt. Aus `src/design-system/components/Card.tsx`. Alles Server-Components, kein `"use client"` nötig.

**Card**

| Prop                  | Typ                                                                                | Default      | Bedeutung                                                                             |
| --------------------- | ---------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------- |
| `children`            | ReactNode                                                                          | —            | Inhalt der Karte                                                                      |
| `color`               | `"green" \| "pink" \| "purple" \| "yellow" \| "blue" \| "orange" \| "destructive"` | —            | Flächenfarbe als Palette-Name. Ohne `color` ist die Karte weiß                        |
| `tone`                | `"soft" \| "solid"`                                                                | `"soft"`     | Mit `color`: `soft` = Pastell (20% der Farbe auf Weiß), `solid` = volle Palettenfarbe |
| `shadow`              | `"small" \| "default" \| "large"`                                                             | `"default"`  | Schatten-Preset: `--offset-control`, `--offset-raised` bzw. `--offset-floating`                                                 |
| `shadowX` / `shadowY` | number (px)                                                                        | aus `shadow` | Feineinstellung, überschreibt `shadow`                                                |
| `padding`             | boolean                                                                            | `false`      | Standard-Innenabstand (20px) aktivieren                                               |
| `flat`                | boolean                                                                            | `false`      | Ruhige Stufe: kein Schatten, dünnerer Rahmen; überschreibt `shadow` (siehe „Wiki-Bausteine und ruhige Stufe“) |
| `className`           | string                                                                             | —            | zusätzliche Klassen für den äußeren Wrapper (Breite, Grid-Verhalten etc.)             |
| `style`               | CSSProperties                                                                      | —            | Inline-Styles auf der inneren Fläche (z. B. für einen Gradient-Hintergrund)           |

**Bausteine** (alle nehmen `children` und `className`)

| Baustein          | Zweck                                                                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `CardHeader`      | Zeile oben: Icon (wird automatisch 20px groß) oder `Avatar` neben einem `CardTitle`. Lässt 8px Abstand nach unten, mehr per `className="mb-4"` |
| `CardTitle`       | Titel, `text-card-title` (= `text-h4`) semibold. Prop `as` wählt das Überschrift-Element (`h2`–`h6`, Default `h3`)                                                        |
| `CardDescription` | Fließtext, 14px, grau. Auf `tone="solid"`-Karten automatisch volle Textfarbe. Hat 16px Abstand nach unten, außer als letztes Element           |
| `CardFooter`      | Zeile für Buttons, Badges oder ein Formularfeld; bricht um, wenn es nicht passt                                                                |

Beispiel — Karte mit Icon, Text und Button:

```tsx
import { ArrowRight, Zap } from "lucide-react";
import {
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/design-system/components";

<Card padding color="blue">
  <CardHeader>
    <Zap aria-hidden="true" />
    <CardTitle>With Icon</CardTitle>
  </CardHeader>
  <CardDescription>
    Cards with icon headers for feature sections.
  </CardDescription>
  <CardFooter>
    <Button size="sm" variant="accent">
      Get Started
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Button>
  </CardFooter>
</Card>;
```

Weitere Varianten aus dem Showcase:

```tsx
<Card padding>…</Card>                          {/* weiß, Standard */}
<Card padding color="yellow" tone="solid">…</Card>  {/* volle Farbe */}
<Card padding shadow="large">…</Card>           {/* größerer Schatten */}
<Card padding color="pink">                     {/* Formularfeld im Footer */}
  <CardHeader><CardTitle>Interactive Card</CardTitle></CardHeader>
  <CardDescription>With form elements inside.</CardDescription>
  <CardFooter>
    <Input icon={<Search />} placeholder="Quick search..." aria-label="Quick search" className="w-full" />
  </CardFooter>
</Card>
```

Profil-Karte mit Avatar: `CardHeader` bekommt `className="mb-4 gap-3"`, darin der `Avatar` und ein `div` mit `CardTitle as="h4" className="text-h4"` (Name) und `CardDescription className="text-badge"` (Rolle).

Pastell-Töne: `soft` nutzt eigene Tokens (`bg-pink-soft`, `bg-purple-soft`, `bg-green-soft`, `bg-yellow-soft`, `bg-blue-soft`, `bg-orange-soft`, `bg-destructive-soft`) aus `tokens.css`. Sie sind per `color-mix` aus der Palettenfarbe berechnet — ändert sich eine Palettenfarbe, folgt der Pastell-Ton automatisch.

Eigene Farbe: `color` nimmt nur Palette-Namen, keine Hex-Werte. Soll eine neue Farbe dazukommen, legst du zuerst Token und `-soft`-Token in `tokens.css` an und trägst sie dann in der `SURFACE_CLASSES`-Tabelle in `Card.tsx` ein (die Klassen müssen dort als vollständige Strings stehen, damit Tailwind sie findet).

Gleich hohe Karten: In einem Grid (`grid gap-6 md:grid-cols-3`) strecken sich Karten einer Zeile auf dieselbe Höhe. Der Grid-Abstand sollte mindestens so groß sein wie der Schatten (hier `gap-6` = 24px bei 4–6px Schatten).

Hinweis: Der Default-Schatten ist 4px (früher 2px), `padding` ist 20px (früher 16px). Die Farbkacheln (`ColorSwatchCard`) setzen ihren Schatten selbst (2px) und sind nicht betroffen; Karten, die den Standard-Schatten oder `padding` benutzen, werden minimal größer.

Karten sind nicht anklickbar und haben keinen Hover-Effekt. Brauchst du eine klickbare Karte, setze einen Link oder Button hinein oder umschließe die Karte mit einem Link.

## Button

Aus `src/design-system/components/Button.tsx`. Erbt alle nativen `<button>`-Props (`onClick`, `type`, `form`, `aria-*` …) zusätzlich zu den eigenen.

| Prop       | Typ                                                                             | Default     | Bedeutung                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`  | `"primary" \| "secondary" \| "accent" \| "destructive" \| "outline" \| "ghost"` | `"primary"` | Farbe/Stil                                                                                                                                               |
| `size`     | `"sm" \| "md" \| "lg" \| "icon"`                                                | `"md"`      | Größe; `"icon"` = 40×40px quadratisch, nur Icon                                                                                                          |
| `loading`  | boolean                                                                         | `false`     | zeigt Spinner + "Loading", deaktiviert den Button automatisch, behält Farbe und Schatten der Variante (früher gelb — Gelb ist schon Warnung und Auswahl) |
| `icon`     | ReactNode                                                                       | —           | wird 16×16px vor dem Text gerendert (bei `size="icon"` der einzige Inhalt)                                                                               |
| `disabled` | boolean                                                                         | —           | Button ausgeblichen (40% Alpha) und nicht klickbar                                                                                                       |

Beispiele:

```tsx
import { Button } from "@/design-system/components";
import { Trash2, Settings } from "lucide-react";

<Button variant="primary">Speichern</Button>
<Button variant="secondary" size="lg">Großer Button</Button>
<Button variant="destructive" icon={<Trash2 />}>Löschen</Button>
<Button size="icon" aria-label="Einstellungen" icon={<Settings />} />
<Button variant="outline" disabled>Nicht verfügbar</Button>
<Button loading>Wird gespeichert</Button>
```

Hinweis Icon-Only: `size="icon"` zeigt keinen sichtbaren Text — immer ein `aria-label` mitgeben, sonst ist der Button für Screenreader-Nutzer unbenutzbar.

Breite: die Höhe ist pro Größe fix, die Breite ergibt sich aus Padding + Text—der Button wächst also automatisch mit längeren Labels, statt Text abzuschneiden.

### ButtonLink

Sieht genauso aus wie `Button`, ist aber ein echter Link (`<a>`). Regel: **Führt der Klick woanders hin, ist es ein `ButtonLink`. Tut er etwas auf dieser Seite, ist es ein `Button`.** Ein Shop-Link, ein Trailer, ein Download oder eine andere Seite ist also immer ein `ButtonLink`. Nur ein echter Link lässt sich in einem neuen Tab öffnen und kopieren, und Suchmaschinen folgen ihm.

```tsx
import { ButtonLink } from "@/design-system/components";
import Link from "next/link";

<ButtonLink href="https://store.steampowered.com/app/…" target="_blank" icon={<Heart />}>
  Auf Steam auf die Wunschliste
</ButtonLink>
<ButtonLink href="/presse/trailer.mp4" download variant="outline">Trailer (212 MB)</ButtonLink>
<ButtonLink href="/spiele" as={Link}>Alle Spiele</ButtonLink>  {/* ohne Neuladen in Next.js */}
```

| Prop      | Typ                     | Default     | Bedeutung                                                                 |
| --------- | ----------------------- | ----------- | ------------------------------------------------------------------------- |
| `href`    | string                  | —           | Ziel, Pflicht                                                              |
| `variant` | wie `Button`            | `"primary"` | gleiche Varianten und Farben wie `Button`                                  |
| `size`    | wie `Button`            | `"md"`      | bei `"icon"` ein `aria-label` mitgeben                                     |
| `icon`    | ReactNode               | —           | 16×16 vor dem Text                                                         |
| `as`      | ElementType             | `"a"`       | `as={Link}` für Navigation ohne Neuladen in Next.js                        |
| alle `<a>`-Attribute | —            | —           | `target`, `download`, `aria-label` …; bei `target="_blank"` wird `rel="noopener noreferrer"` automatisch gesetzt |

Kein `disabled` und kein `loading`: Einen Link kann man nicht deaktivieren. Ist das Ziel noch nicht da („Demo kommt bald“), zeig Text oder einen deaktivierten `Button` statt eines Links ins Leere.

## Badge

Aus `src/design-system/components/Badge.tsx`. Rein informativ, nicht klickbar — kein `onClick`, keine States wie bei `Button`.

| Prop        | Typ                                                                  | Default     | Bedeutung                           |
| ----------- | -------------------------------------------------------------------- | ----------- | ----------------------------------- |
| `variant`   | `"default" \| "secondary" \| "accent" \| "destructive" \| "outline"` | `"default"` | Farbe/Stil                          |
| `icon`      | ReactNode                                                            | —           | wird 12×12px vor dem Text gerendert |
| `children`  | ReactNode                                                            | —           | Label-Text                          |
| `className` | string                                                               | —           | optional                            |

Beispiele:

```tsx
import { Badge } from "@/design-system/components";
import { Star, Check, X } from "lucide-react";

<Badge variant="default">Default</Badge>
<Badge variant="outline">Outline</Badge>
<Badge icon={<Star />}>Featured</Badge>
<Badge variant="accent" icon={<Check />}>Verified</Badge>
<Badge variant="destructive" icon={<X />}>Removed</Badge>
```

Besonderheit `destructive`: Text ist dort weiß (`text-danger-foreground` auf `danger`; in Emaille 7,3:1). Badges haben keinen Schatten — sie sind Beschriftungen, keine Buttons.

## Avatar

Aus `src/design-system/components/Avatar.tsx`. Runder Profil-Kreis mit 2px Border, ohne Schatten (reine Anzeige — siehe Schatten-Regel unter Design Tokens). Zeigt ein Bild, zwei Buchstaben oder ein Icon auf einer Palettenfarbe. Dazu `AvatarGroup` für mehrere Personen. Beides Server-Components.

**Avatar**

| Prop        | Typ                                                                            | Default    | Bedeutung                                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`      | string                                                                         | —          | Name der Person. Ohne `src` werden daraus die Initialen abgeleitet („Jane Doe“ → „JD“); außerdem ist der Name der barrierefreie Name des Avatars |
| `initials`  | string                                                                         | —          | Überschreibt die abgeleiteten Initialen; höchstens 2 Zeichen, wird groß geschrieben                                                              |
| `src`       | string                                                                         | —          | Bild-URL. Mit `src` füllt das Bild den Kreis, Initialen und `children` entfallen                                                                 |
| `alt`       | string                                                                         | `name`     | Alt-Text zum Bild. Mit `name` wird er nicht gebraucht                                                                                            |
| `children`  | ReactNode                                                                      | —          | Inhalt ohne Bild und ohne Initialen: ein Icon (wird passend zur Größe skaliert) oder kurzer Text                                                 |
| `color`     | `"pink" \| "purple" \| "green" \| "yellow" \| "blue" \| "orange" \| "surface"` | `"purple"` | Hintergrund als Palette-Name. `surface` (weiß) ist für den „+N“-Kreis der Gruppe gedacht                                                         |
| `size`      | `"sm" \| "md" \| "lg"`                                                         | `"md"`     | 32px, 40px oder 56px. Initialen- und Icon-Größe wachsen mit                                                                                      |
| `className` | string                                                                         | —          | Klassen für den äußeren Wrapper                                                                                                                  |

Welche Variante gezeigt wird, entscheidet die Reihenfolge: `src` vor Initialen (`initials` oder aus `name`) vor `children`.

Initialen: Aus `name` werden die ersten Buchstaben der ersten zwei Wörter genommen („Jane Marie Doe“ → „JM“), bei einem Wort die ersten zwei Buchstaben („Jane“ → „JA“). Passt das nicht (z. B. wenn der Nachname gemeint ist), setzt du `initials` selbst.

Beispiele:

```tsx
import { User } from "lucide-react";
import { Avatar } from "@/design-system/components";

<Avatar name="Jane Doe" />                          {/* JD, lila, 40px */}
<Avatar name="Jane Doe" color="pink" size="lg" />   {/* groß, pink */}
<Avatar name="Jane Doe" src="/jane.jpg" size="sm" />
<Avatar initials="XY" color="blue" />
<Avatar><User aria-hidden="true" /></Avatar>        {/* Icon */}
```

Größen und Farben: 32px (`sm`), 40px (`md`), 56px (`lg`); Farben: die Palettenfarben `pink`, `purple`, `green`, `yellow`, `blue`, `orange` (Standard `purple`); ihre Werte stehen unter „Palette“. (Die frühere Farbe `destructive` gibt es beim Avatar nicht mehr.)

**AvatarGroup**

| Prop        | Typ                                                     | Default | Bedeutung                                                  |
| ----------- | ------------------------------------------------------- | ------- | ---------------------------------------------------------- |
| `users`     | `{ name?, initials?, src?, alt?, color?, children? }[]` | —       | Die Personen, jeweils mit denselben Feldern wie ein Avatar |
| `size`      | `"sm" \| "md" \| "lg"`                                  | `"md"`  | Größe aller Avatare in der Gruppe                          |
| `max`       | number                                                  | `4`     | Höchstzahl sichtbarer Kreise inklusive des „+N“-Kreises    |
| `label`     | string                                                  | —       | Barrierefreier Name der Gruppe, z. B. „Projektmitglieder“  |
| `className` | string                                                  | —       | Klassen für den äußeren Wrapper                            |

Die Avatare überlappen sich (6px bei `sm`, 8px bei `md`, 12px bei `lg`), der spätere liegt jeweils oben. Bis zu 4 Personen werden alle gezeigt. Ab der 5. Person werden nur 3 Avatare gezeigt und im 4. Platz steht ein weißer Kreis „+N“, wobei N alle nicht gezeigten Personen zählt — bei 5 Personen „+2“, bei 7 Personen „+4“. Mit `max={5}` zeigt die Gruppe entsprechend bis zu 4 Avatare plus „+N“.

```tsx
import { AvatarGroup } from "@/design-system/components";

const users = [
  { name: "Anna Berg", color: "pink" },
  { name: "Ben Kurz", color: "purple" },
  { name: "Cara Lind", color: "green" },
  { name: "Dan Moor", color: "yellow" },
  { name: "Eva Roth", src: "/eva.jpg" },
];

<AvatarGroup users={users} label="Projektmitglieder" />   {/* 3 Avatare + „+2“ */}
<AvatarGroup users={users.slice(0, 3)} size="lg" />
```

Hinweis: Wegen der Überlappung kann bei zweibuchstabigen Initialen der Buchstabe am rechten Rand teilweise vom nächsten Kreis verdeckt werden, vor allem bei breiter Schrift. Bei Bildern fällt das nicht auf. Wenn dir das zu eng ist, kannst du `OVERLAP_CLASSES` in `Avatar.tsx` anpassen.

Barrierefreiheit: Mit `name` ist der Avatar ein beschriftetes Bild (`role="img"`), die Buchstaben darin werden nicht zusätzlich vorgelesen. Der „+N“-Kreis ist mit „N more“ beschriftet (englisch, fest im Code). Die Gruppe ist `role="group"` und trägt `label`.

Das Bild wird mit einem normalen `<img>` ausgegeben, nicht mit `next/image` — die Library kann die Bild-Konfiguration deines Projekts nicht voraussetzen. Willst du `next/image`, tausche das `<img>` in `Avatar.tsx` aus.

## Alert

Aus `src/design-system/components/Alert.tsx`. Hinweisbox mit Icon, Titel und gedämpftem Text auf einer Farbfläche. Rahmen `--border-width`, Eckradius `rounded-brutal`, Schatten `--offset-raised`. Server-Component, ohne eigene Interaktion.

| Prop        | Typ                                           | Default           | Bedeutung                                      |
| ----------- | --------------------------------------------- | ----------------- | ---------------------------------------------- |
| `variant`   | `"info" \| "success" \| "warning" \| "error"` | `"info"`          | Bestimmt Farbe, Icon und ARIA-Rolle            |
| `title`     | ReactNode                                     | —                 | Fette erste Zeile neben dem Icon               |
| `children`  | ReactNode                                     | —                 | Die Meldung unter dem Titel, grau              |
| `icon`      | ReactNode                                     | Icon der Variante | Ersetzt das Standard-Icon                      |
| `className` | string                                        | —                 | Klassen für den äußeren Wrapper (z. B. Breite) |
| `flat`      | boolean                                       | `false`           | Ruhige Stufe: kein Schatten, dünnerer Rahmen, `role="note"` (Hinweis im Text statt Meldung) |

Die vier Varianten:

| Variante  | Fläche                       | Icon            | Rolle    |
| --------- | ---------------------------- | --------------- | -------- |
| `info`    | `bg-info-soft`               | `Info`          | `status` |
| `success` | `bg-success-soft`            | `CircleCheck`   | `status` |
| `warning` | `bg-warning-soft`            | `TriangleAlert` | `alert`  |
| `error`   | `bg-danger-soft`             | `CircleX`       | `alert`  |

Beispiele:

```tsx
import { Alert } from "@/design-system/components";

<Alert variant="info" title="Information">
  This is an informational message for the user.
</Alert>
<Alert variant="success" title="Success!">Your action was completed successfully.</Alert>
<Alert variant="warning" title="Warning">Please review before continuing.</Alert>
<Alert variant="error" title="Error">Something went wrong. Please try again.</Alert>
```

Im Showcase hat jeder Alert rechts daneben einen Button „Hide“/„Show“ zum Ausprobieren. Er steckt in `src/app/AlertDemo.tsx` (kein Teil der Design-Library, nur Showcase): eine kleine Client-Component, weil der Button ein `onClick` braucht, während die Seite selbst eine Server-Component bleibt. Das erneute Einblenden fügt ein neues `role`-Element in die Seite ein — das ist der Weg, auf dem Screenreader einen Alert normalerweise vorlesen (nicht mit einem Screenreader getestet), so kannst du das auch ausprobieren.

Rolle: `info` und `success` sind `role="status"` (Screenreader lesen sie höflich nach, ohne zu unterbrechen), `warning` und `error` sind `role="alert"` (werden sofort vorgelesen). Das ist fest an die Variante gekoppelt. Wird ein Alert erst nachträglich eingeblendet (z. B. nach einem Klick), liest der Screenreader ihn so vor; steht er schon beim Laden der Seite da, passiert nichts Besonderes.

Icon-Größe: Das Icon sitzt in einem 20px-Slot, das `svg` wird aber mit 24px gezeichnet und um 2px zurückgezogen. Lucide-Icons haben 2px Rand im 24px-Feld; bei 20px Größe wäre das sichtbare Symbol nur etwa 17px groß, so ist es die vollen 20px. Bei einem eigenen `icon` also ein Lucide-Icon (oder eines mit gleichem Rand) übergeben.

Titel: ein normaler Absatz in `text-card-title` semibold, kein Überschrift-Element (`h4` o. ä.) — ein Alert-Titel ist kein Abschnitt der Seite und würde die Überschriften-Gliederung verwässern. Die Größe entspricht `CardTitle` (= `text-h4`).

Farb-Token: Alle vier Flächen sind Rollen-Töne — `bg-info-soft`, `bg-success-soft`, `bg-warning-soft`, `bg-danger-soft`. Damit sind sie gleich laut und klar voneinander unterscheidbar; Fehler nutzt bewusst `danger`, nie die Farbe der Hauptaktion (`primary`).

Lesbarkeit: Der gedämpfte Text (`text-muted`) erreicht auf allen vier Flächen mehr als 4,5:1 (Emaille: 6,2 bis 6,5:1). Bei einem neuen Stil neu prüfen.

## Progress

Aus `src/design-system/components/Progress.tsx`. Fortschrittsbalken mit Label links und Prozentanzeige rechts über der Leiste. Die Leiste ist 20px hoch inklusive Rahmen (`--border-width`), Eckradius `rounded-pill` (voll rund), ohne Schatten (reine Anzeige). Standardfarbe ist die Rolle `accent`. Das Ende der Füllung wird durch einen 2px dunklen Strich markiert. Server-Component, ohne State.

| Prop         | Typ                                                                                | Default   | Bedeutung                                                                                           |
| ------------ | ---------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------- |
| `value`      | number                                                                             | —         | Aktueller Stand von 0 bis `max`; Werte außerhalb werden auf den Bereich begrenzt                    |
| `max`        | number                                                                             | `100`     | Der Wert, der „fertig“ bedeutet; die Anzeige ist immer in Prozent davon                             |
| `label`      | string                                                                             | —         | Text oben links. Ohne Label: `aria-label` setzen                                                    |
| `color`      | `"accent" \| "green" \| "pink" \| "purple" \| "yellow" \| "blue" \| "orange" \| "destructive"` | `"accent"` | Farbe der Füllung (Rolle `accent` oder Palette-Name)                                                                    |
| `showValue`  | boolean                                                                            | `true`    | Prozentzahl oben rechts anzeigen                                                                    |
| `aria-label` | string                                                                             | —         | Zugänglicher Name, wenn kein `label` gesetzt ist                                                    |
| `className`  | string                                                                             | —         | Klassen für den äußeren Wrapper (z. B. Breite); ohne Angabe füllt sie die Breite des Elternelements |

Beispiele:

```tsx
import { Progress } from "@/design-system/components";

<Progress label="Upload" value={25} color="pink" />
<Progress label="Processing" value={60} color="purple" />
<Progress label="Almost Done" value={85} color="green" />
<Progress label="Complete" value={100} color="yellow" />
<Progress label="Not Started" value={0} />
<Progress label="Speicher" value={150} max={200} />   {/* zeigt 75% */}
<Progress aria-label="Ladefortschritt" value={40} showValue={false} />
```

Wert: Die Prozentzahl wird gerundet (`value={33.4}` zeigt „33%“) und die Füllung nutzt denselben gerundeten Wert, damit Zahl und Balken zusammenpassen. Ist `max` 0 oder negativ, bleibt der Balken leer. Eine Änderung von `value` animiert die Füllung in 0,3s; bei aktivierter Systemeinstellung „Bewegung reduzieren“ springt sie stattdessen.

Barrierefreiheit: Die Leiste ist ein echtes `role="progressbar"` mit `aria-valuenow`, `aria-valuemin`/`-max` (immer 0 bis 100, in Prozent) und `aria-valuetext`; das Label ist per `aria-labelledby` verknüpft. Die sichtbare Prozentzahl ist für Screenreader ausgeblendet, damit sie nicht doppelt vorgelesen wird (nicht mit einem Screenreader getestet). Es gibt keinen „unbestimmten“ Zustand (Spinner-artig, wenn die Dauer unbekannt ist) — dafür ist die Komponente nicht gedacht.

Höhe: Die Vorgabe lautete zunächst 46px; das Referenzbild zeigt aber Leisten von etwa 20px. Umgesetzt sind 20px wie im Bild. Wer eine höhere Leiste will, ändert `h-5` in `Progress.tsx` (die Füllung passt sich an).

Eigene Farbe: wie beim Slider nur Palette-Namen. Neue Farbe zuerst als Token in `tokens.css` anlegen, dann in der `FILL_CLASSES`-Tabelle in `Progress.tsx` eintragen (vollständige Klassen-Strings, damit Tailwind sie findet).

Lesbarkeit: Die Prozentzahl ist `text-muted` auf `background` (Emaille: 5,8:1, über dem WCAG-Wert 4,5:1 für kleinen Text). Auf einer farbigen Fläche (z. B. in einer farbigen Card) neu prüfen.

## Tabs

Aus `src/design-system/components/Tabs.tsx`. Tab-Leiste oben, darunter (mit 20px Abstand) das Feld mit dem Inhalt des gewählten Tabs. Beide sind getrennte Flächen mit Rahmen `--border-width`, Eckradius `rounded-brutal`, Schatten `--offset-raised`. Der aktive Tab hat die Rolle `selected` (änderbar über `color`). Aufgebaut aus Bausteinen wie die Card, darunter `@radix-ui/react-tabs` (Pfeiltasten, Pos1/Ende, Fokus-Verwaltung und die ARIA-Rollen `tablist`/`tab`/`tabpanel`) — wir kleiden es nur ein, wie bei Select. Client-Component (`"use client"` steht schon in der Datei, alle vier Bausteine liegen in einer Datei).

Installation (zusätzlich zu den Quick-Start-Dependencies):

```
npm install @radix-ui/react-tabs
```

**Tabs** (Wurzel, hält den Zustand)

| Prop                      | Typ                                                                                | Default    | Bedeutung                                                     |
| ------------------------- | ---------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------- |
| `defaultValue`            | string                                                                             | —          | Anfangs gewählter Tab (unkontrolliert)                        |
| `value` / `onValueChange` | string / `(value: string) => void`                                                 | —          | Kontrollierte Variante, z. B. um den Tab von außen zu steuern |
| `color`                   | `"selected" \| "yellow" \| "pink" \| "purple" \| "green" \| "blue" \| "orange" \| "destructive"` | `"selected"` | Füllfarbe des aktiven Tabs (Rolle `selected` oder Palette-Name)                     |
| `className`               | string                                                                             | —          | Klassen für den äußeren Wrapper (z. B. Breite)                |

**Weitere Bausteine**

| Baustein      | Props                              | Aufgabe                                                                             |
| ------------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| `TabsList`    | `aria-label?`, `className?`        | Die Leiste. Die Tabs teilen sich ihre Breite gleichmäßig, getrennt durch 2px Linien |
| `TabsTrigger` | `value`, `disabled?`, `className?` | Ein Tab (52px hoch, Leiste insgesamt 56px)                                          |
| `TabsContent` | `value`, `className?`              | Das Inhaltsfeld zum Tab mit gleichem `value` (24px Innenabstand)                    |

Beispiel:

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/design-system/components";

<Tabs defaultValue="overview">
  <TabsList aria-label="Produktbereiche">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="features">Features</TabsTrigger>
    <TabsTrigger value="pricing">Pricing</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Inhalt der Übersicht …</TabsContent>
  <TabsContent value="features">Inhalt der Features …</TabsContent>
  <TabsContent value="pricing">Inhalt der Preise …</TabsContent>
</Tabs>

<Tabs defaultValue="a" color="pink">…</Tabs>   {/* anderer aktiver Tab */}
```

Kontrolliert (der Aufruf mit Funktion muss selbst in einer Client-Component stehen, nicht direkt in einer Server-Seite):

```tsx
"use client";
const [tab, setTab] = useState("overview");
<Tabs value={tab} onValueChange={setTab}>
  …
</Tabs>;
```

Nur der aktive Tab ist im DOM: die Inhalte der anderen Tabs werden nicht gerendert. Wechselt man den Tab, geht der interne Zustand von Inhalten im verlassenen Tab (z. B. ein halb ausgefülltes Formularfeld) verloren; soll er erhalten bleiben, muss er außerhalb der `TabsContent` gehalten werden.

Tastatur: Pfeil links/rechts wechselt den Tab (und wählt ihn gleich aus), Pos1/Ende springt zum ersten bzw. letzten, Tab führt von der Leiste ins Inhaltsfeld. Die Tabs haben bewusst keinen eigenen Fokus-Rahmen: Radix fokussiert einen Tab auch nach einem Mausklick per Skript, wodurch `:focus-visible` greift und ein Rahmen wie ein dickerer Rand des gewählten Tabs aussähe. Er ist auch nicht nötig, weil die Pfeiltasten den Tab gleich auswählen — der fokussierte Tab ist immer der gelbe. Das Inhaltsfeld bekommt einen Fokus-Rahmen (außen) nur bei Tastatur-Fokus, nicht nach einem Mausklick. Mit Maus und Tastatur im Browser geprüft; mit Screenreader nicht.

Schatten des Inhaltsfelds: Das Feld ist ein von Radix gerendertes Wrapper-Element (`asChild`), das auch den Schatten enthält — dadurch verschwindet der Schatten zusammen mit dem Feld, wenn der Tab nicht aktiv ist.

Schrift im Inhaltsfeld: Das Feld setzt `text-body` (16px); eigene Überschriften oder Komponenten darin bringen ihre eigene Größe mit. Im Referenzbild wirkt die Schrift etwas größer, die Feldhöhe liegt dadurch bei zwei Zeilen etwa 6px unter dem Bild; wer es genauer will, setzt `className="text-field"` auf den Text im Feld.

Eigene Farbe: wie beim Slider nur Palette-Namen. Neue Farbe zuerst als Token in `tokens.css` anlegen, dann in der `ACTIVE_CLASSES`-Tabelle in `Tabs.tsx` eintragen (vollständige Klassen-Strings, damit Tailwind sie findet).

Grenzen: Die Tabs sind immer gleich breit und füllen die Breite des Elternelements; bei vielen Tabs oder langen Beschriftungen wird es auf kleinen Bildschirmen eng, ein Umbruch oder Scrollen der Leiste ist nicht eingebaut. Ein senkrechtes Layout gibt es nicht.

## Accordion

Aus `src/design-system/components/Accordion.tsx`. Untereinander stehende Einträge mit Abstand dazwischen (12px). Jeder Eintrag ist eine eigene Fläche mit Rahmen `--border-width`, Eckradius `rounded-brutal`, Schatten `--offset-raised`; rechts in der Kopfzeile sitzt ein Pfeil-Icon (16×16), das sich beim Öffnen dreht. Ein geöffneter Eintrag hat eine Kopfzeile in der Rolle `selected` (änderbar über `color`) und darunter, durch eine Linie in `--border-width` getrennt, den Inhalt. Aufgebaut aus Bausteinen wie Card und Tabs, darunter `@radix-ui/react-accordion` (ARIA, Enter/Leertaste, Pfeiltasten, Pos1/Ende zwischen den Kopfzeilen, Höhen-Animation). Client-Component (`"use client"` steht schon in der Datei, alle Bausteine liegen in einer Datei).

Installation (zusätzlich zu den Quick-Start-Dependencies):

```
npm install @radix-ui/react-accordion
```

Außerdem braucht die Höhen-Animation zwei Einträge in `tokens.css` (`--animate-accordion-down/-up` samt `@keyframes`, im `@theme`-Block unten). Sie sind schon in der Datei; wer nur `Accordion.tsx` in ein anderes Projekt kopiert, muss auch diese Zeilen mitnehmen, sonst öffnet und schließt es ohne Animation.

**Accordion** (Wurzel)

| Prop                      | Typ                                                                                | Default        | Bedeutung                                                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `multiple`                | boolean                                                                            | `false`        | `false`: immer nur ein Eintrag offen (ein neu geöffneter schließt den alten). `true`: beliebig viele gleichzeitig        |
| `collapsible`             | boolean                                                                            | `true`         | Nur ohne `multiple`: kann der offene Eintrag per erneutem Klick geschlossen werden? Mit `false` bleibt immer einer offen |
| `defaultValue`            | string[]                                                                           | erster Eintrag | `value`s der anfangs offenen Einträge (unkontrolliert). `[]` = alles zu                                                  |
| `value` / `onValueChange` | string[] / `(value: string[]) => void`                                             | —              | Kontrollierte Variante. Ohne `multiple` hat das Array höchstens einen Eintrag                                            |
| `color`                   | `"selected" \| "yellow" \| "pink" \| "purple" \| "green" \| "blue" \| "orange" \| "destructive"` | `"selected"` | Farbe der Kopfzeile eines offenen Eintrags (Rolle `selected` oder Palette-Name)                                                                |
| `className`               | string                                                                             | —              | Klassen für den äußeren Wrapper (z. B. Breite)                                                                           |

**Weitere Bausteine**

| Baustein           | Props                                                   | Aufgabe                                                                          |
| ------------------ | ------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `AccordionItem`    | `value` (Pflicht, eindeutig), `disabled?`, `className?` | Ein Eintrag samt Rahmen und Schatten                                             |
| `AccordionTrigger` | `className?`                                            | Die Kopfzeile (mindestens 44px hoch) mit Titel und Pfeil; steckt in einem `<h3>` |
| `AccordionContent` | `className?`                                            | Der Inhalt unter der Kopfzeile                                                   |

Beispiel:

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/design-system/components";

<Accordion>   {/* erster Eintrag ist anfangs offen, immer nur einer */}
  <AccordionItem value="what">
    <AccordionTrigger>What is Neo-Brutalism?</AccordionTrigger>
    <AccordionContent>Neo-brutalism is a design style …</AccordionContent>
  </AccordionItem>
  <AccordionItem value="how">
    <AccordionTrigger>How do I use these components?</AccordionTrigger>
    <AccordionContent>Copy the design-system folder …</AccordionContent>
  </AccordionItem>
</Accordion>

<Accordion multiple color="blue">…</Accordion>        {/* mehrere gleichzeitig offen */}
<Accordion collapsible={false}>…</Accordion>          {/* einer bleibt immer offen */}
<Accordion defaultValue={[]}>…</Accordion>            {/* anfangs alles zu */}
<Accordion defaultValue={["how"]}>…</Accordion>       {/* anderer Eintrag anfangs offen */}
```

Kontrolliert (der Aufruf mit Funktion muss selbst in einer Client-Component stehen, nicht direkt in einer Server-Seite):

```tsx
"use client";
const [open, setOpen] = useState<string[]>(["what"]);
<Accordion value={open} onValueChange={setOpen}>
  …
</Accordion>;
```

Erster Eintrag offen: Ohne `defaultValue` liest die Wurzel den `value` des ersten direkten Kindes. Das funktioniert, wenn die `AccordionItem`s direkt in `<Accordion>` stehen (auch per `.map()`), aber nicht, wenn sie in einem eigenen Wrapper oder einem Fragment stecken — dann ist anfangs nichts offen, und `defaultValue` muss gesetzt werden.

Werte: Radix selbst nutzt für „einer offen“ einen String und für „mehrere“ ein Array; dieser Wrapper vereinheitlicht das auf `string[]`, damit man beim Umschalten von `multiple` nichts anpassen muss.

Tastatur: Pfeil hoch/runter, Pos1 und Ende bewegen den Fokus zwischen den Kopfzeilen, Enter/Leertaste öffnet oder schließt. Die Kopfzeile hat einen Fokus-Rahmen (innen, 2px), der nach einem Mausklick nicht erscheint, sondern nur bei Tastatur-Fokus (im Chromium geprüft; andere Browser nicht). Anders als bei den Tabs ist er nötig, weil der Fokus hier nicht automatisch auch das Öffnen bedeutet. Mit Screenreader nicht getestet.

Animation: Der Inhalt fährt in 0,2s auf bzw. zu. Ist in den Systemeinstellungen „Bewegung reduzieren“ aktiv, entfällt die Animation (`motion-reduce`).

Schriftgrößen: Titel 16px (`text-body`, semibold), Inhalt 16px (`text-body`) in voller Textfarbe auf `surface`. Früher war der Inhalt 13px und grau — in einer FAQ ist die Antwort aber der eigentliche Inhalt. Die Kopfzeile ist mindestens 44px hoch (bequemes Antippen).

Eigene Farbe: wie beim Slider nur Palette-Namen. Neue Farbe zuerst als Token in `tokens.css` anlegen, dann in der `OPEN_CLASSES`-Tabelle in `Accordion.tsx` eintragen (vollständige Klassen-Strings, damit Tailwind sie findet).

## Tooltip

Aus `src/design-system/components/Tooltip.tsx`. Kleine Sprechblase, die beim Hovern über einem Element erscheint, mit einem kleinen Dreieck zum Element hin. Rahmen `--border-width`, Eckradius `rounded-brutal`, Schatten `--offset-control`, Fläche `surface`. Die Seite ist wählbar: oben, rechts, unten oder links. Darunter `@radix-ui/react-tooltip`, das zusätzlich erledigt, was ein reiner CSS-Tooltip nicht kann: Er öffnet sich auch bei Tastatur-Fokus, schließt mit Esc, setzt `aria-describedby` für Screenreader, weicht automatisch auf die andere Seite aus, wenn am Bildschirmrand kein Platz ist, und wird außerhalb von `overflow: hidden`-Elternelementen gezeichnet. Client-Component (`"use client"` steht schon in der Datei).

Installation (zusätzlich zu den Quick-Start-Dependencies):

```
npm install @radix-ui/react-tooltip
```

| Prop            | Typ                                      | Default | Bedeutung                                                               |
| --------------- | ---------------------------------------- | ------- | ----------------------------------------------------------------------- |
| `content`       | ReactNode                                | —       | Der Text im Tooltip; kurz halten, er ist nicht anklickbar               |
| `side`          | `"top" \| "right" \| "bottom" \| "left"` | `"top"` | Auf welcher Seite des Elements er erscheint                             |
| `children`      | ReactElement                             | —       | Das Element, über dem man hovert (genau ein Element)                    |
| `delayDuration` | number                                   | `200`   | Millisekunden Hover, bevor er erscheint                                 |
| `className`     | string                                   | —       | Klassen für die Blase (z. B. andere Maximalbreite; Standard `max-w-xs`) |

Beispiel:

```tsx
import { Tooltip, Button } from "@/design-system/components";

<Tooltip content="Speichert deine Änderungen">
  <Button>Speichern</Button>
</Tooltip>

<Tooltip content="Löschen" side="right">
  <Button variant="destructive" size="icon" aria-label="Löschen"><Trash2 /></Button>
</Tooltip>
```

Das Element in `children` muss eine `ref` annehmen und seine Props an ein DOM-Element weiterreichen. `Button` und jedes normale HTML-Element tun das; `Avatar` nicht — dort ein `<span>` herum legen: `<Tooltip content="…"><span><Avatar name="…" /></span></Tooltip>`. Ein deaktivierter Button löst in der Regel keinen Hover aus (Browser senden für ihn kaum Maus-Events); auch dort hilft ein `<span>` als Auslöser. Nicht getestet.

Dreieck: Es ist ein SVG (16px breit, 8px hoch), dessen obere Kante 2px in die Blase hineinreicht und dort den Rahmen überdeckt, damit die Linie sauber in die Spitze übergeht. Das Dreieck selbst hat keinen Schlagschatten; der Schatten der Blase läuft hinter ihm durch.

Abstand und Ausweichen: Zwischen Spitze und Element sind 2px. Am Rand des Fensters hält die Blase 8px Abstand und klappt bei zu wenig Platz auf die Gegenseite (z. B. `bottom` am unteren Bildschirmrand wird zu oben). Das ist Radix' Standardverhalten und im Browser geprüft.

Tastatur und Touch: Fokus auf das Element öffnet den Tooltip, Esc schließt ihn (im Browser geprüft). Auf Touch-Geräten gibt es kein Hover, dort erscheint er in der Regel nicht — wichtige Information also nie nur im Tooltip unterbringen. Mit Screenreader nicht getestet.

Farbe: Die Blase ist fest weiß (`bg-surface`). Soll sie eine Palettenfarbe haben, müssen Fläche (`bg-*` auf dem inneren `div`) und Dreieck (`fill-*` am Fill-`path`) gemeinsam geändert werden, sonst passt die Spitze nicht zur Blase.

## Table

Aus `src/design-system/components/Table.tsx`. Tabelle mit Rahmen `--border-width`, Eckradius `rounded-brutal`, Schatten `--offset-raised`. Die Kopfzeile hat die Rolle `selected`; die Zeilen darunter wechseln zwischen `surface` und `sand` zu 30 %, getrennt durch Linien in `--border-width`. Aufgebaut aus Bausteinen wie die Card; es sind die echten HTML-Tabellen-Elemente (`table`, `thead`, `tbody`, `tr`, `th`, `td`), Semantik und Screenreader-Navigation bleiben also erhalten. Server-Components, ohne State.

| Baustein      | Props (zusätzlich zu den HTML-Attributen)                                        | Aufgabe                                                                                   |
| ------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `Table`       | `className?` (am äußeren Wrapper), alle `<table>`-Attribute (z. B. `aria-label`) | Zeichnet Rahmen und Schatten; scrollt seitlich, wenn der Inhalt breiter ist als der Platz |
| `TableHeader` | `color?` (Palette-Name oder `"selected"`, Default `"selected"`)                | Die Kopfzeile (`thead`) mit Hintergrund und Linie zum Inhalt                              |
| `TableBody`   | —                                                                                | Der Inhalt (`tbody`); färbt jede zweite Zeile ein                                         |
| `TableRow`    | —                                                                                | Eine Zeile (`tr`) mit Linie darunter (außer der letzten)                                  |
| `TableHead`   | —                                                                                | Eine Spaltenüberschrift (`th`, `scope="col"` als Default)                                 |
| `TableCell`   | —                                                                                | Eine Zelle (`td`); darf beliebige Komponenten enthalten (Badge, Button, …)                |


**Ruhige Stufe:** `<Table flat>` ohne Schatten, mit dünnerem Außenrahmen und feinen Linien zwischen den Zeilen. Für Tabellen im Fließtext, z. B. im Wiki.

Beispiel:

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/design-system/components";

<Table aria-label="Teammitglieder">
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Role</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Ada Lovelace</TableCell>
      <TableCell>Engineer</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>Grace Hopper</TableCell>
      <TableCell>Admiral</TableCell>
    </TableRow>
  </TableBody>
</Table>;
```

Zebra: Die zweite, vierte, … Zeile im `TableBody` bekommt `bg-sand/30` (Sand mit 30% Deckkraft auf `surface`). Die erste Zeile ist `surface`. Die Linien folgen `--border-width`, die Kopfzeile `--color-selected`.

Linien und Ränder: Die Trennlinien stehen als Unterkante an jeder Zeile (`border-b-2`), außer an der letzten — dort übernimmt der Außenrahmen. Die Linie unter der Kopfzeile ist in `TableHeader` extra gesetzt, damit sie nicht an der Regel „letzte Zeile ohne Linie“ hängen bleibt. Wer eigene `TableRow`-Klassen setzt, sollte dies im Kopf behalten.

Ausrichtung und Breite: Zellen sind linksbündig. Für Zahlen oder Aktionen `className="text-right"` auf `TableHead` und `TableCell` setzen. Spaltenbreiten ergeben sich aus dem Inhalt; feste Breiten per `className="w-32"` an `TableHead`.

Schmale Bildschirme: Die Tabelle scrollt dann seitlich innerhalb ihres Rahmens, statt die Seite zu verbreitern. Rahmen und Schatten bleiben stehen (bei 360px Breite im Browser geprüft). Einen eigenen „Karten“-Umbruch für Mobilgeräte gibt es nicht.

Nicht enthalten: Sortieren, Auswählen von Zeilen, Hover-Hervorhebung und Seitenumbruch — die Komponente ist reine Darstellung. Zusammen mit `Pagination` kann man die Zeilen selbst auf die aktuelle Seite zuschneiden.

Eigene Farbe der Kopfzeile: nur Palette-Namen über `color` an `TableHeader`; neue Farbe als Token in `tokens.css` anlegen und in der `HEADER_CLASSES`-Tabelle in `Table.tsx` eintragen.

## Breadcrumb

Aus `src/design-system/components/Breadcrumb.tsx`. Der ganze Pfad steht in einem einzigen Kasten (Rahmen `--border-width`, Eckradius `rounded-brutal`, ohne Schatten — Orientierung, keine Ebene), die Einträge sind durch ein `>` getrennt. Der letzte Eintrag ist die aktuelle Seite: grau (muted), nicht anklickbar, mit `aria-current="page"`. Der Kasten ist nur so breit wie sein Inhalt und bricht in mehrere Zeilen um, wenn es zu schmal wird. Server-Component.

| Prop         | Typ                                     | Default        | Bedeutung                                                               |
| ------------ | --------------------------------------- | -------------- | ----------------------------------------------------------------------- |
| `items`      | `{ label: ReactNode; href?: string }[]` | —              | Der Pfad von oben nach unten; der LETZTE Eintrag ist die aktuelle Seite |
| `aria-label` | string                                  | `"Breadcrumb"` | Name der Navigation für Screenreader                                    |
| `className`  | string                                  | —              | Klassen für den äußeren Wrapper                                         |

Beispiel:

```tsx
import { Breadcrumb } from "@/design-system/components";

<Breadcrumb
  items={[
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Detail" },
  ]}
/>;
```

Trenner: Ein `ChevronRight`-Icon (16px) aus `lucide-react`, für Screenreader ausgeblendet. Die Liste bleibt dadurch eine echte Liste (`ol`), ohne dass „größer als“ vorgelesen wird.

Links: Die Einträge mit `href` sind normale `<a>`-Links (Hover: unterstrichen), deshalb bleibt die Komponente eine Server-Component und funktioniert überall. In einer Next.js-App, die ohne Neuladen navigieren soll, ersetzt man in `Breadcrumb.tsx` das `<a>` durch `Link` aus `next/link`. Ein Eintrag ohne `href`, der nicht der letzte ist, wird als schwarzer Text ohne Link ausgegeben.

Aktuelle Seite: Der letzte Eintrag wird immer als aktuelle Seite behandelt, auch wenn er ein `href` hat — der Link wird dort ignoriert.

## Pagination

Aus `src/design-system/components/Pagination.tsx`. Seitenwechsler mit „Prev“ und „Next“ (Rahmen `--border-width`, Eckradius `rounded-brutal`, Schatten `--offset-raised`) und den Seitenzahlen dazwischen (gleiche Rahmen und Radius, Schatten `--offset-control`). Die aktuelle Seite ist gefüllt, standardmäßig in der Rolle `primary`. Bei vielen Seiten werden Lücken mit „…“ gekennzeichnet. Client-Component (`"use client"` steht schon in der Datei), weil sie den aktuellen Stand hält.

| Prop                    | Typ                                                                                | Default        | Bedeutung                                                              |
| ----------------------- | ---------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------- |
| `pageCount`             | number                                                                             | —              | Gesamtzahl der Seiten                                                  |
| `page` / `onPageChange` | number / `(page: number) => void`                                                  | —              | Kontrollierte Variante (Seiten zählen ab 1)                            |
| `defaultPage`           | number                                                                             | `1`            | Startseite, wenn nicht kontrolliert                                    |
| `siblings`              | number                                                                             | `1`            | Wie viele Seitenzahlen links und rechts der aktuellen angezeigt werden |
| `color`                 | `"primary" \| "pink" \| "purple" \| "green" \| "yellow" \| "blue" \| "orange" \| "destructive"` | `"primary"` | Füllfarbe der aktuellen Seite (Rolle `primary` oder Palette-Name)                           |
| `aria-label`            | string                                                                             | `"Pagination"` | Name der Navigation für Screenreader                                   |

**Zwei Paginations auf einer Seite** (z. B. oben und unten an einer langen Liste): jeder ein eigenes `aria-label` geben, etwa `"Seiten oben"` und `"Seiten unten"`. Sonst hört man im Screenreader zweimal „Pagination“ und weiß nicht, welche welche ist. Bei nur einer pro Seite reicht der Standard.

| `className`             | string                                                                             | —              | Klassen für die Navigation                                             |

Beispiel:

```tsx
import { Pagination } from "@/design-system/components";

<Pagination pageCount={5} />                                  {/* eigener Zustand */}
<Pagination pageCount={20} defaultPage={8} color="green" />

// Gesteuert, z. B. zusammen mit einer Tabelle:
"use client";
const [page, setPage] = useState(1);
<Pagination pageCount={20} page={page} onPageChange={setPage} />
```

Welche Seiten sichtbar sind: Immer die erste und die letzte Seite, die aktuelle mit `siblings` Nachbarn auf jeder Seite, dazwischen „…“. Die Zahl der Felder bleibt gleich (bei `siblings={1}` sieben), egal wo man ist, damit die Zeile beim Blättern nicht in der Breite springt. Bei sieben Seiten oder weniger werden alle gezeigt. Beispiele bei 20 Seiten: Seite 1 → `1 2 3 4 5 … 20`, Seite 10 → `1 … 9 10 11 … 20`, Seite 20 → `1 … 16 17 18 19 20`.

Prev/Next: Auf der ersten Seite ist „Prev“, auf der letzten „Next“ deaktiviert (ausgegraut, nicht anklickbar). Ein Klick auf die schon aktuelle Seite tut nichts.

Buttons statt Links: Die Pagination wechselt Zustand, sie navigiert nicht. Für URL-basierte Seiten (`?page=3`) ruft man im `onPageChange` den Router auf und gibt die Seite aus der URL über `page` zurück. Eine Variante mit echten Links gibt es nicht.

Bedienung: Die Buttons verhalten sich wie `Button` — beim Hovern heben sie sich leicht an (Prev/Next 2px, Seitenzahlen 1px), beim Drücken liegen sie flach auf dem Schatten. Die aktuelle Seite bewegt sich nicht. Der Fokus-Rahmen erscheint nur bei Tastatur-Fokus, nicht nach einem Mausklick (im Chromium geprüft; andere Browser nicht). Die aktuelle Seite trägt `aria-current="page"`, jede Seitenzahl das Label „Page N“. Mit Screenreader nicht getestet.

Schmale Bildschirme: Die Zeile bricht um, wenn sie nicht in eine Zeile passt (bei 360px Breite steht „Next“ in der zweiten Zeile). Im Browser bei 360px geprüft: nichts läuft über den Rand.

Beschriftungen: „Prev“, „Next“ und „Page N“ sind englisch fest im Code (`Pagination.tsx`); für andere Sprachen dort ändern.

Eigene Farbe: nur Palette-Namen. Neue Farbe zuerst als Token in `tokens.css` anlegen, dann in der `CURRENT_CLASSES`-Tabelle in `Pagination.tsx` eintragen (vollständige Klassen-Strings, damit Tailwind sie findet).

## Dropdown Menu

Aus `src/design-system/components/DropdownMenu.tsx`. Sieht aus und verhält sich wie das Select (gleicher Auslöser mit Rahmen `--border-width`, Eckradius `rounded-brutal`, Schatten `--offset-raised`; gleiche aufklappende Fläche, die beim Öffnen leicht angehoben wird), nur ist die Beschriftung des Auslösers fest, und die Einträge lösen etwas aus, statt einen Wert zu wählen. Die Einträge stehen untereinander, getrennt durch Linien; der gerade markierte (Hover oder Pfeiltasten) bekommt die Rolle `selected`, ein gefährlicher Eintrag („Delete“) hat rote Schrift. Darunter `@radix-ui/react-dropdown-menu`: Rollen `menu`/`menuitem`, Pfeiltasten, Pos1/Ende, Tippen springt zum Eintrag, Esc, Fokus zurück auf den Auslöser und Ausweichen am Bildschirmrand. Client-Component (`"use client"` steht schon in der Datei).

Installation (zusätzlich zu den Quick-Start-Dependencies):

```
npm install @radix-ui/react-dropdown-menu
```

| Prop        | Typ                            | Default   | Bedeutung                                                                                          |
| ----------- | ------------------------------ | --------- | -------------------------------------------------------------------------------------------------- |
| `label`     | string                         | —         | Feste Beschriftung des Auslösers (z. B. „Options“)                                                 |
| `icon`      | ReactNode                      | —         | Icon vor der Beschriftung, 16×16                                                                   |
| `items`     | `DropdownMenuItem[]`           | —         | Die Einträge von oben nach unten                                                                   |
| `align`     | `"start" \| "center" \| "end"` | `"start"` | An welcher Kante des Auslösers das Menü ausgerichtet ist (`"end"` für Menüs am rechten Seitenrand) |
| `disabled`  | boolean                        | `false`   | Auslöser deaktivieren                                                                              |
| `className` | string                         | —         | Klassen für den äußeren Wrapper                                                                    |

Ein Eintrag (`DropdownMenuItem`):

| Feld          | Typ          | Bedeutung                                                                 |
| ------------- | ------------ | ------------------------------------------------------------------------- |
| `label`       | ReactNode    | Text des Eintrags                                                         |
| `icon`        | ReactNode    | Icon vor dem Text, 14×14                                                  |
| `onSelect`    | `() => void` | Wird bei Klick, Enter oder Leertaste aufgerufen; danach schließt das Menü |
| `href`        | string       | Macht den Eintrag zu einem echten Link (`<a href>`) statt zu einem Button |
| `destructive` | boolean      | Rote, fette Schrift für gefährliche Aktionen                              |
| `disabled`    | boolean      | Ausgegraut, nicht wählbar                                                 |

Beispiel:

```tsx
"use client";
import { DropdownMenu } from "@/design-system/components";
import { Settings, User, Trash2 } from "lucide-react";

<DropdownMenu
  label="Options"
  icon={<Settings />}
  items={[
    { label: "Profile", icon: <User />, onSelect: () => openProfile() },
    { label: "Docs", href: "/docs" },
    {
      label: "Delete",
      icon: <Trash2 />,
      destructive: true,
      onSelect: () => remove(),
    },
  ]}
/>;
```

Client-Grenze: `onSelect` ist eine Funktion. Eine Server-Seite kann deshalb kein `DropdownMenu` mit `onSelect` direkt rendern — der Aufruf muss in einer eigenen Client-Component stehen, wie bei `AlertDemo` (hier: `src/app/DropdownDemo.tsx`, nur Showcase, kein Teil der Library). Einträge mit nur `href` brauchen keine Funktion und gehen auch in Server-Seiten.

Pfeil-Icon: Es schaltet wie beim Select zwischen Pfeil nach unten (zu) und nach oben (offen) um. Im Referenzbild steht bei offenem Menü der Pfeil nach unten; hier ist es bewusst wie beim Select gelöst, weil du „genau wie das Select“ gesagt hast.

Breite und Abstand: Das Menü ist mindestens so breit wie der Auslöser, aber nie schmaler als 144px (9rem). Der Abstand zum Auslöser beträgt ca. 6px sichtbar (4px Versatz plus die 2px, um die der Auslöser beim Öffnen angehoben ist). Die Einträge sind 30px hoch plus 2px Trennlinie (Pitch 32px wie im Referenzbild); das Menü mit fünf Einträgen ist damit etwa 163px hoch.

Tastatur: Enter oder Pfeil runter öffnet; Pfeil hoch/runter, Pos1 und Ende bewegen die Markierung, Enter/Leertaste wählt, Esc schließt und gibt den Fokus an den Auslöser zurück (im Browser geprüft). Tippen springt zum Eintrag mit passendem Anfang; das ist die Typeahead-Suche von Radix und nur stichprobenartig geprüft: Schnelles Tippen von „sh“ sprang im Browser zu „Share“, bei Tippen mit 200ms Pausen zwischen den Buchstaben blieb die Markierung auf „Settings“. Verlass dich also höchstens auf einen einzelnen Anfangsbuchstaben, nicht auf Mehrbuchstaben-Suche. Mit Screenreader nicht getestet.

Links: Ein Eintrag mit `href` wird als `<a>` ausgegeben (das Menü schließt beim Wählen, der Browser folgt dem Link). In einer Next.js-App, die ohne Neuladen navigieren soll, im Eintrag in `DropdownMenu.tsx` das `<a>` durch `Link` aus `next/link` ersetzen oder im `onSelect` den Router aufrufen.

Nicht enthalten: Untermenüs, Trenner-Zeilen und Gruppen-Überschriften, Häkchen- oder Radio-Einträge. Radix bietet sie an; die Komponente zeigt bisher nur eine flache Liste.

## Header (Navigation Bar)

Aus `src/design-system/components/Header.tsx`. Eine Leiste (Rahmen `--border-width`, Eckradius `rounded-brutal`, Schatten `--offset-raised`, mindestens 48px hoch) mit Marke links, Links in der Mitte und einem frei austauschbaren Bereich (`actions`) rechts — die drei Gruppen sind gleichmäßig über die Leiste verteilt. Der Name ist `Header`, weil `Navbar` schon die klebende Seitennavigation des Showcase ist (siehe Abschnitt „Section & Navbar“) und unverändert bleibt. Client-Component (`"use client"` steht schon in der Datei), weil sie auf schmalen Bildschirmen ein Menü öffnet.

| Prop         | Typ                                                                                              | Default  | Bedeutung                                                                                                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `brand`      | ReactNode                                                                                        | —        | Linke Seite, meist `<HeaderBrand … />`                                                                                                                                                                                               |
| `links`      | `HeaderNavItem[]` — Links `{ label, href, active? }` und/oder Gruppen `{ label, items: Link[] }` | `[]`     | Die Navigation in der Mitte; `active` markiert die aktuelle Seite (fett, unterstrichen, `aria-current="page"`). Eine Gruppe wird auf dem Desktop ein Aufklappmenü, im Handy-Menü ein beschrifteter Block. Ab etwa 6 Links gruppieren |
| `actions`    | ReactNode                                                                                        | —        | Rechte Seite: z. B. ein „Sign Up“-Button, nach dem Login ein Avatar oder `DropdownMenu`                                                                                                                                              |
| `aria-label` | string                                                                                           | `"Main"` | Name der Link-Navigation für Screenreader                                                                                                                                                                                            |
| `className`  | string                                                                                           | —        | Klassen für den äußeren Wrapper (z. B. Breite)                                                                                                                                                                                       |

Die Standard-Marke `HeaderBrand`:

| Prop   | Typ       | Default | Bedeutung                                                          |
| ------ | --------- | ------- | ------------------------------------------------------------------ |
| `name` | string    | —       | Der Name neben dem Icon                                            |
| `icon` | ReactNode | —       | Icon in einer Kachel in `primary` (26×26, Rahmen `--border-width`, Schatten `--offset-control`), 14×14 |
| `href` | string    | `"/"`   | Wohin ein Klick auf die Marke führt                                |

Beispiel:

```tsx
import { Header, HeaderBrand, Button } from "@/design-system/components";
import { Sparkles } from "lucide-react";

<Header
  brand={<HeaderBrand icon={<Sparkles />} name="NeoBrut" />}
  links={[
    { label: "Home", href: "/", active: true },
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
  ]}
  actions={<Button size="sm">Sign Up</Button>}
/>;
```

Rechts austauschbar: `actions` nimmt beliebige Elemente. Je nach Login-Status gibst du etwas anderes hinein, z. B. `actions={user ? <DropdownMenu label={user.name} … /> : <Button size="sm">Sign Up</Button>}`. Der Header selbst weiß nichts vom Login. Im Showcase zeigt `src/app/HeaderDemo.tsx` das: „Sign Up“ anklicken wechselt zu einem Benutzer-Menü, „Sign out“ wechselt zurück (nur Showcase, kein Teil der Library).

Schmale Bildschirme: Unter 768px (Tailwind `md`) verschwinden die Links UND der `actions`-Bereich hinter einem Hamburger-Button rechts. Der öffnet unter der Leiste ein Menü mit gleichem Rahmen und Schatten: die Links als Zeilen (40px hoch, durch Linien getrennt, Hover in `selected`), darunter, durch eine Linie abgesetzt, der `actions`-Bereich (z. B. der „Sign Up“-Button). Es schließt bei Esc (der Fokus geht zurück auf den Button), bei Klick außerhalb, bei Klick auf einen Link und wenn das Fenster wieder auf Desktop-Breite wächst. Im Browser bei 400px Breite geprüft, inklusive eines `DropdownMenu` im `actions`-Bereich des Menüs (dessen Einträge erscheinen außerhalb des Menüs, ein Klick darauf schließt das Hamburger-Menü nicht vorzeitig).

Doppelt gerendert: Der `actions`-Bereich steht für Desktop in der Leiste (auf schmalen Bildschirmen per CSS ausgeblendet) und, nur solange das Hamburger-Menü offen ist, ein zweites Mal im Menü. Innerhalb von `actions` also keine festen `id`s verwenden und nichts, das beim Mounten Nebenwirkungen hat (z. B. einen Request).

Sonderfälle (im Browser geprüft): Ohne `links` und ohne `actions` gibt es keinen Hamburger-Button und keine Link-Navigation, nur die Marke. Mit nur `links` oder nur `actions` erscheint der Hamburger-Button und enthält das jeweils Vorhandene.

Schrift: Marke, Links und Beschriftungen nutzen 14px (`text-small`). Im Referenzbild wirkt die Schrift etwas kleiner und der Button rechts (26px hoch) kleiner als der kleinste `Button` der Library (`size="sm"`, 32px) — hier wird der normale `Button size="sm"` verwendet, die Leiste ist 48px hoch.

Verteilung und Mitte: Die drei Gruppen sind per `justify-between` verteilt, nicht exakt zur Seitenmitte zentriert: die Links liegen in der Mitte zwischen Marke und `actions`, wie im Referenzbild. Sind Marke und `actions` unterschiedlich breit, sitzen die Links entsprechend verschoben.

Eigene Links: Es sind normale `<a>`-Links. In einer Next.js-App, die ohne Neuladen navigieren soll, in `Header.tsx` die `<a>` durch `Link` aus `next/link` ersetzen (je Stelle: Marke, Desktop-Links, Menü-Links).

Nicht enthalten: Eine „klebende“ Variante (`className="sticky top-4 z-40"` setzen, falls gewünscht), Untermenüs in den Links und ein Hamburger-Breakpoint zum Einstellen (fest `md`).

## Dialog / Modal

Aus `src/design-system/components/Dialog.tsx`. Ein Fenster über der Seite: dunkler Hintergrund (Overlay) und eine Box in `surface` mit Rahmen `--border-width`, Eckradius `rounded-brutal`, Schatten `--offset-raised`. Inhalt: Titel aus Icon (20×20) und einer Überschrift in `text-h4` (20px), darunter der erklärende Text in Grau, darunter die Buttons. Darunter liegt `@radix-ui/react-dialog`: `role="dialog"`, Fokus bleibt im Fenster gefangen (Tab springt nur zwischen den Elementen des Dialogs), Esc schließt, ein Klick auf das Overlay schließt, die Seite dahinter scrollt nicht, und der Fokus kehrt zum auslösenden Button zurück. Client-Component (`"use client"` steht schon in der Datei).

Installation (zusätzlich zu den Quick-Start-Dependencies):

```
npm install @radix-ui/react-dialog
```

Zwei Wege: der fertige `ConfirmDialog` für genau das Muster aus dem Bild (Titel, Text, „Delete“ und „Cancel“) oder die Bausteine zum freien Zusammenbauen.

`ConfirmDialog`:

| Prop                                  | Typ                                  | Default                    | Bedeutung                                                                                                         |
| ------------------------------------- | ------------------------------------ | -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `title`                               | ReactNode                            | —                          | Überschrift, z. B. „Confirm Delete?“                                                                              |
| `description`                         | ReactNode                            | —                          | Was passiert, z. B. „This action cannot be undone. Are you sure?“                                                 |
| `confirmLabel`                        | ReactNode                            | `"Delete"`                 | Beschriftung des Bestätigen-Buttons                                                                               |
| `cancelLabel`                         | ReactNode                            | `"Cancel"`                 | Beschriftung des Abbrechen-Buttons                                                                                |
| `onConfirm`                           | `() => void`                         | —                          | Wird beim Bestätigen aufgerufen; danach schließt der Dialog                                                       |
| `destructive`                         | boolean                              | `true`                     | Roter Bestätigen-Button (Destructive-Farbe); `false` = normaler pinker Button                                     |
| `icon`                                | ReactNode                            | orangefarbenes Warndreieck | Icon vor dem Titel, 20×20                                                                                         |
| `trigger`                             | ReactElement                         | —                          | Das Element, das den Dialog öffnet (z. B. ein `Button`). Weglassen = du steuerst per `open`/`onOpenChange` selbst |
| `open`, `defaultOpen`, `onOpenChange` | boolean / boolean / `(open) => void` | —                          | Gesteuerter oder ungesteuerter Zustand                                                                            |

Die Bausteine (alle exportiert aus derselben Datei):

| Baustein            | Aufgabe                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `Dialog`            | Hält den Zustand (`open`, `defaultOpen`, `onOpenChange`), zeichnet selbst nichts                                         |
| `DialogTrigger`     | Öffnet den Dialog; mit `asChild` wird dein eigener Button zum Auslöser                                                   |
| `DialogContent`     | Overlay und Box in `surface` mit Schatten; `className` geht an die Box (z. B. eine andere `max-w-*`)                            |
| `DialogTitle`       | Titelzeile; Prop `icon` (20×20). Gestaltet wie ein `h4`, ist aber ein `<h2>`-Element (Name des Dialogs für Screenreader) |
| `DialogDescription` | Erklärender Text, grau                                                                                                   |
| `DialogFooter`      | Zeile für die Buttons, linksbündig, bricht auf schmalen Bildschirmen um                                                  |
| `DialogClose`       | Schließt beim Klick; mit `asChild` um deinen eigenen Button                                                              |

Beispiele:

```tsx
import { Button, ConfirmDialog } from "@/design-system/components";

<ConfirmDialog
  trigger={<Button variant="destructive">Delete…</Button>}
  title="Confirm Delete?"
  description="This action cannot be undone. Are you sure?"
  onConfirm={() => removeItem()}
/>;
```

```tsx
import {
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Input,
} from "@/design-system/components";

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Rename…</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogTitle>Rename project</DialogTitle>
    <DialogDescription>Choose a new name.</DialogDescription>
    <Input aria-label="New name" />
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
</Dialog>;
```

Fokus beim Öffnen: Beim `ConfirmDialog` mit `destructive` (Standard) startet der Fokus auf „Cancel“, nicht auf dem roten Button — sonst würde ein versehentliches Enter oder Leertaste sofort löschen (Radix würde sonst den ersten Button fokussieren). Bei eigenem Inhalt fokussiert Radix das erste bedienbare Element (im Beispiel oben das Eingabefeld).

Titel und Beschreibung: Radix erwartet in jedem `DialogContent` einen `DialogTitle` und eine `DialogDescription` (Screenreader lesen beide beim Öffnen vor). Fehlen sie, meldet Radix im Entwicklungsmodus eine Warnung. Hat ein Dialog bewusst keine Beschreibung, gib `aria-describedby={undefined}` an `DialogContent`.

Client-Grenze: `onConfirm` ist eine Funktion. Eine Server-Seite kann einen `ConfirmDialog` mit `onConfirm` deshalb nicht direkt rendern — der Aufruf muss in einer eigenen Client-Component stehen, wie bei `AlertDemo` (hier: `src/app/DialogDemo.tsx`, nur Showcase, kein Teil der Library).

`onConfirm` ist synchron gedacht: Der Dialog schließt direkt nach dem Aufruf. Soll er bei einer laufenden Anfrage offen bleiben (z. B. mit Lade-Button), steuerst du ihn selbst über `open`/`onOpenChange` und baust ihn aus den Bausteinen.

Breite: Die Box ist maximal 384px (`max-w-sm`) breit und auf schmalen Bildschirmen 2rem schmaler als der Bildschirm (bei 320px: 288px). Im Referenzbild ist die Box etwa 305px breit — das ist dort eine feste Vorschau; hier passt der Beispieltext bei 14px Schrift in einer Zeile in 384px. Für eine andere Breite `className="max-w-xs"` o. ä. an `DialogContent`.

Overlay: `foreground` mit 50 % Deckkraft (`bg-foreground/50` in `Dialog.tsx`).

Buttons: Es sind die normalen `Button size="sm"` (32px hoch); im Referenzbild wirken sie etwas kleiner. Abstand zwischen den Buttons 12px.

Nicht enthalten: Ein Schließen-Kreuz (der Entwurf hat keins; Esc, Overlay-Klick und „Cancel“ schließen), Ein-/Ausblend-Animation, und eine statische Vorschau wie im Referenzbild („STATIC PREVIEW“): Titel und Beschreibung funktionieren nur innerhalb eines `Dialog` (Radix), deshalb öffnet der Showcase den Dialog per Button.

Toasts bei offenem Dialog: Ein Toast, der erscheint, während ein Dialog offen ist (z. B. „Failed to save“ aus dem Dialog heraus), ist per Maus klickbar und schließt den Dialog nicht (Klick auf das Kreuz zählt nicht als „Klick außerhalb“). Radix blendet die Seite hinter einem modalen Dialog aber für Screenreader aus — der Toast wird dann nicht vorgelesen und ist wegen der Fokus-Falle des Dialogs per Tastatur nicht erreichbar (Letzteres nicht getestet), solange der Dialog offen ist. Wichtige Meldungen deshalb zusätzlich im Dialog selbst anzeigen.

Im Browser geprüft (Chromium): Maße (damals im Klassik-Stil), Fokus-Falle beim Tabben, Esc, Overlay-Klick, „Cancel“ und „Delete“ (Fokus kehrt zum Auslöser zurück), Start-Fokus auf „Cancel“, ein Dialog mit Eingabefeld, 320px Breite. Mit Screenreader nicht getestet.

## Toast / Notification

Aus `src/design-system/components/Toast.tsx`. Kurze Meldungen, die in einer Ecke des Bildschirms erscheinen, sich nach 5 Sekunden selbst schließen und sich stapeln. Es gibt drei Arten: **Success** (`success-soft`), **Notification** (`info-soft`) und **Error** (`danger-soft`). Alle sind gleich aufgebaut — Rahmen `--border-width`, Eckradius `rounded-brutal`, Schatten `--offset-raised`, links ein Icon (20×20), dann der Text, ganz rechts das Schließen-Kreuz (16×16). 12px Abstand zwischen gestapelten Toasts. Darunter liegt `@radix-ui/react-toast`: Screenreader-Ansage (Success und Notification höflich, Error sofort), Timer pausiert bei Hover und Tastaturfokus, Wischen nach rechts schließt, F8 springt in den Toast-Stapel. Client-Component (`"use client"` steht schon in der Datei).

Installation (zusätzlich zu den Quick-Start-Dependencies):

```
npm install @radix-ui/react-toast
```

Einrichtung: genau ein `<Toaster />` im Root-Layout (`src/app/layout.tsx`), zum Beispiel direkt nach `{children}`:

```tsx
import { Navbar, Toaster } from "@/design-system/components";

// …im <body>:
<Navbar />;
{
  children;
}
<Toaster />;
```

Benutzen: Von überall im Browser-Code die Funktion `toast` aufrufen — in einem Klick-Handler, einem Effekt oder nach einer Anfrage:

```tsx
"use client";
import { toast } from "@/design-system/components";

toast.success("Saved successfully!");
toast.notify("New notification received");
toast.error("Failed to upload file");
toast.error("Upload failed", { duration: Infinity, id: "upload" }); // bleibt, bis man es schließt
toast.dismiss("upload"); // einen bestimmten Toast schließen
toast.dismiss(); // alle schließen
```

`toast.success`, `toast.notify` und `toast.error` nehmen eine Nachricht (Text oder JSX) und optional `{ duration, id }`; sie geben die `id` zurück.

| Option     | Typ    | Default                        | Bedeutung                                                                            |
| ---------- | ------ | ------------------------------ | ------------------------------------------------------------------------------------ |
| `duration` | number | die Dauer des `Toaster` (5000) | Millisekunden bis zum Selbstschließen; `Infinity` = nur das Kreuz schließt           |
| `id`       | string | automatisch                    | Eigene ID; ein zweiter Toast mit derselben ID ersetzt den ersten an derselben Stelle |

`Toaster`-Props:

| Prop       | Typ                                                            | Default                               | Bedeutung                                                                                          |
| ---------- | -------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `position` | `"bottom-right" \| "bottom-left" \| "top-right" \| "top-left"` | `"bottom-right"`                      | Ecke des Bildschirms; Toasts gleiten von der jeweiligen Seite ein                                  |
| `duration` | number                                                         | `5000`                                | Standard-Dauer in Millisekunden                                                                    |
| `limit`    | number                                                         | `5`                                   | Wie viele Toasts gleichzeitig sichtbar sein dürfen; der älteste schließt, wenn ein neuer dazukommt |
| `label`    | string                                                         | Radix-Standard („Notifications (F8)“) | Name des Meldungsbereichs für Screenreader                                                         |

Verhalten: Mit der Maus über einem Toast oder mit dem Fokus darauf pausiert der Timer; nach dem Verlassen schließt sich der Toast wie gewohnt selbst. Neue Toasts kommen ans Ende des Stapels: Bei `bottom-*` rücken die älteren dadurch nach oben, bei `top-*` bleiben sie stehen und der Stapel wächst nach unten. Lange oder mehrzeilige Nachrichten brechen um, das Icon bleibt vertikal zentriert.

Farben und Icons: Success `bg-success-soft` mit Haken-Kreis in `text-success-ink`, Notification `bg-info-soft` mit Glocke in `text-info-ink`, Error `bg-danger-soft` mit X-Kreis in `text-danger-ink`. Gleiche Flächen wie beim Alert; die Icons nutzen die `-ink`-Töne, damit sie auf der Fläche mind. 4,5:1 erreichen (das helle Grün und Pink lagen deutlich darunter). Notification ist nicht mehr gelb, weil Gelb Warnung und Auswahl bedeutet. Das Kreuz ist immer `text-muted`. Änderungen in der `VARIANTS`-Tabelle in `Toast.tsx`.

Grenzen: Nur im Browser aufrufbar: `toast.*()` geht in Event-Handlern, Effekten und `.then()`, aber nicht, während eine Server-Komponente rendert. Das Showcase nutzt dafür `src/app/ToastDemo.tsx` (nur Showcase, kein Teil der Library).

Ohne `<Toaster />` passiert scheinbar nichts: Die Toasts werden vorgemerkt und erscheinen alle auf einmal, sobald ein Toaster gemountet wird.

Mit zwei `<Toaster />` zeigt jeder dieselben Toasts — also immer nur einen einsetzen.

Bewegung reduzieren: Ist im Betriebssystem „Bewegung reduzieren“ an (`prefers-reduced-motion`), rutscht der Toast nicht herein, sondern erscheint direkt. Das Ausblenden bleibt (Ausblenden ist keine Bewegung), das Wegwischen auch (das löst die Person selbst aus).

Nicht enthalten: Fortschrittsbalken, Aktions-Buttons im Toast und ein Titel/Text-Aufbau; es ist eine Nachricht mit Kreuz, wie im Entwurf.

Ein Toast, der bei offenem modalem Dialog erscheint, ist klickbar, aber für Screenreader ausgeblendet (siehe Abschnitt Dialog / Modal).

Im Browser geprüft (Chromium, damals im Klassik-Stil): Hintergrundfarben, Rahmen, Radius, Schatten, Icon-Feld 20×20, Schrift 14px, Abstand 12px, Position unten rechts und oben links, Schließen per Kreuz, Selbstschließen, Pause bei Hover (7s Hover: Toast blieb), Limit 5 bei 8 schnellen Klicks, F8-Fokus, Wischen nach rechts, `Infinity`, `dismiss(id)` und `dismiss()`, Ersetzen per `id`, lange JSX-Nachricht. Mit Screenreader nicht getestet; die Ansage (`aria-live` polite bzw. assertive) ist im DOM vorhanden. (Stand vor der Umstellung auf Rollen-Farben am 12.10.2026 — die Farbwerte oben sind seitdem andere.)

## Input

Aus `src/design-system/components/Input.tsx`. Erbt alle nativen `<input>`-Props (`onChange`, `placeholder`, `required`, `aria-*` …) zusätzlich zu den eigenen. Client-Component ("use client") — braucht internen State für den Passwort-Sichtbarkeits-Toggle.

| Prop    | Typ       | Default | Bedeutung                                                                                                                                  |
| ------- | --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `label` | string    | —       | Label oberhalb des Feldes. Unabhängig von `icon` — beides, nur eins, oder keins                                                            |
| `icon`  | ReactNode | —       | wird 16×16px vor dem Feldinhalt gerendert. Wird immer explizit übergeben — auch beim Passwort-Feld gibt es kein automatisches Schloss-Icon |
| `error` | string    | —       | Feld bekommt roten Rahmen + roten Schatten, Text wird darunter angezeigt                                                                   |

Beispiele:

```tsx
import { Input } from "@/design-system/components";
import { Mail, User, Lock } from "lucide-react";

<Input placeholder="Type something..." />
<Input label="Email" icon={<Mail />} placeholder="you@example.com" />
<Input label="Username" icon={<User />} placeholder="johndoe" />
<Input label="Error State" placeholder="Invalid input" error="This field is required" />
<Input label="Disabled" placeholder="Can't type here" disabled />
<Input label="Password" icon={<Lock />} type="password" placeholder="Enter password" />
```

Fokus: Das Feld hebt sich um 2px an **und** bekommt denselben 2px-Fokusrahmen wie Button und Checkbox (auch bei Mausklick — man muss sehen, wo man tippt). Das Anheben allein war kein sichtbarer Fokus. Gilt genauso für Textarea; Select zeigt den Rahmen bei Tastatur-Fokus.

Passwort-Feld: `type="password"` schaltet automatisch einen Sichtbarkeits-Toggle (Auge-Icon) am Ende des Feldes frei, der zwischen maskierter und Klartext-Anzeige wechselt — der Rest, inklusive des Schloss-Icons links, kommt wie überall sonst explizit über `icon`.

## Textarea

Aus `src/design-system/components/Textarea.tsx`. Erbt alle nativen `<textarea>`-Props (`onChange`, `rows`, `required`, `aria-*` …) zusätzlich zu den eigenen — praktisch das mehrzeilige Geschwister von `Input` (gleiche Schatten-Technik, gleicher Fokus-Effekt), nur ohne Icon und ohne Passwort-Verhalten.

| Prop    | Typ    | Default | Bedeutung                                                                                                             |
| ------- | ------ | ------- | --------------------------------------------------------------------------------------------------------------------- |
| `label` | string | —       | Label oberhalb des Feldes. Bleibt auch im Error-State in `foreground` — nur Rahmen, Schatten und die Fehlermeldung werden rot |
| `error` | string | —       | Feld bekommt roten Rahmen + roten Schatten, Text wird darunter angezeigt                                              |

Beispiele:

```tsx
import { Textarea } from "@/design-system/components";

<Textarea placeholder="Write your message..." />
<Textarea label="With Label" placeholder="Describe your idea..." />
<Textarea label="Disabled" placeholder="Can't edit" disabled />
<Textarea label="Error" placeholder="Required field" error="Please fill in this field" />
```

Größe ist fix, kein natives Resize-Handle (`resize-none`): die Schatten-Fläche passt sich nicht automatisch an eine per Drag vergrößerte Textarea an, daher ist das Resizing bewusst deaktiviert statt sich auf ein zufällig passendes Ergebnis zu verlassen.

## Select

Aus `src/design-system/components/Select.tsx`. Kein gestyltes natives `<select>` — das native Popup lässt sich nicht an unser Rahmen/Schatten/Radius-System anpassen, und der Browser verrät auch nicht, ob es gerade offen ist, wodurch sich das Pfeil-Icon nicht wie gefordert umschalten ließe. Stattdessen auf `@radix-ui/react-select` aufgebaut: eine ungestylte, barrierefreie Primitive (Tastatur-Navigation, Fokus-Management, Klick-außerhalb-schließt, ARIA), die komplett mit unseren eigenen Klassen eingekleidet wird — dieselbe Idee wie bei `lucide-react` für Icons statt sie selbst zu zeichnen. Zusätzliche Dependency der Library (ebenso `@radix-ui/react-tabs` bei den Tabs); muss separat installiert werden (siehe unten).

| Prop                      | Typ                                                      | Default                 | Bedeutung                                                                                                             |
| ------------------------- | -------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `label`                   | string                                                   | —                       | Label oberhalb des Feldes. Bleibt auch im Error-State in `foreground` — nur Rahmen, Schatten und die Fehlermeldung werden rot |
| `options`                 | `{ value: string; label: string; disabled?: boolean }[]` | —                       | Liste der auswählbaren Einträge                                                                                       |
| `placeholder`             | string                                                   | `"Select an option..."` | Text, solange nichts ausgewählt ist                                                                                   |
| `value` / `onValueChange` | string / `(value: string) => void`                       | —                       | Kontrollierte Variante                                                                                                |
| `defaultValue`            | string                                                   | —                       | Unkontrollierte Variante                                                                                              |
| `error`                   | string                                                   | —                       | Feld bekommt roten Rahmen + roten Schatten, Text wird darunter angezeigt                                              |
| `disabled`                | boolean                                                  | —                       | Feld ausgeblichen (40% Alpha) und nicht bedienbar                                                                     |

Installation (zusätzlich zu den Quick-Start-Dependencies):

```
npm install @radix-ui/react-select
```

Beispiele:

```tsx
import { Select } from "@/design-system/components";

const FRUIT_OPTIONS = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "grape", label: "Grape", disabled: true },
];

<Select label="Fruit" placeholder="Choose a fruit..." options={FRUIT_OPTIONS} />
<Select label="Disabled" placeholder="Can't select" options={FRUIT_OPTIONS} disabled />
```

Pfeil-Icon: schaltet automatisch zwischen Aufklapp- und Zuklapp-Pfeil um — dafür wird kein eigener State gebraucht, sondern Radix' eigenes `data-state="open"|"closed"`-Attribut auf dem Trigger per CSS (`group-data-[state=open]:`) ausgewertet.

Fokus-Effekt: wie bei Input/Textarea kein Fokus-Ring — stattdessen hebt sich das Feld beim Öffnen etwas aus seinem Schatten (angelehnt an den Button-Hover-Effekt), gesteuert über denselben `data-state="open"`.

## Checkbox

Aus `src/design-system/components/Checkbox.tsx`. Erbt alle nativen `<input>`-Props (`checked`, `defaultChecked`, `onChange`, `name`, `value`, `required`, `aria-*` …) zusätzlich zu den eigenen. Basiert auf einem echten `<input type="checkbox">` (nur visuell versteckt, bleibt aber fokussierbar und im Screenreader-Baum) — dadurch funktionieren Formulare, Leertaste und Screenreader ohne Zusatzaufwand, und es wird keine neue Dependency gebraucht.

| Prop                   | Typ               | Default | Bedeutung                                                                                                           |
| ---------------------- | ----------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| `label`                | string            | —       | Text rechts neben der Box, anklickbar (schaltet die Box um). Bei `disabled` wird das Label wie die Box ausgeblichen |
| `checked` / `onChange` | boolean / Handler | —       | Kontrollierte Variante                                                                                              |
| `defaultChecked`       | boolean           | —       | Unkontrollierte Variante, startet angehakt                                                                          |
| `disabled`             | boolean           | —       | Box ausgeblichen (40% Alpha), nicht klickbar, übersprungen beim Tab                                                 |
| `className`            | string            | —       | Klassen für den äußeren Wrapper (z. B. Abstand)                                                                     |

Beispiele:

```tsx
import { Checkbox } from "@/design-system/components";

<Checkbox label="Unchecked" />
<Checkbox label="Checked" defaultChecked />
<Checkbox label="Disabled" disabled />
<Checkbox label="Disabled checked" disabled defaultChecked />
<Checkbox aria-label="Newsletter abonnieren" />
```

Maße: Box 20×20px, Eckradius `rounded-brutal-sm`, Rahmen `--border-width`, Schatten `--offset-control`. Angehakt: Fläche in der Rolle `primary` mit Haken in `primary-foreground` (16×16px Icon); nicht angehakt: `surface`.

Ohne `label` ist es nur die nackte Box — dann immer ein `aria-label` mitgeben, sonst weiß ein Screenreader-Nutzer nicht, wofür sie steht (gleiche Regel wie beim Icon-Only-Button).

Interaktion: bei Hover hebt sich die Box 1px aus ihrem Schatten (wie beim Button), beim Drücken schiebt sie sich auf den Schatten. Anders als bei Input/Textarea/Select gibt es hier zusätzlich einen Fokus-Ring, der aber nur bei Tastatur-Fokus erscheint (`:focus-visible`) — Mausnutzer sehen ihn nie. Das ist eine bewusste Abweichung: eine so kleine Box wäre sonst für Tastatur-Nutzer ohne jede Fokus-Anzeige.

## Radio Group

Aus `src/design-system/components/RadioGroup.tsx`. Wie die Checkbox auf echten, nur visuell versteckten `<input type="radio">`-Elementen gebaut — Einzelauswahl, Pfeiltasten-Navigation, Formular-Absenden und Screenreader funktionieren nativ, es wird keine zusätzliche Dependency gebraucht. Nimmt wie `Select` ein `options`-Array, damit Gruppen-Themen (gemeinsamer Name, Auswahl, disabled) an einer Stelle liegen.

| Prop                      | Typ                                                      | Default     | Bedeutung                                                                                                                         |
| ------------------------- | -------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `label`                   | string                                                   | —           | Gruppen-Titel über den Optionen (fett). Bleibt auch bei `disabled` voll lesbar                                                    |
| `options`                 | `{ value: string; label: string; disabled?: boolean }[]` | —           | Die Optionen; `disabled: true` sperrt nur diese eine                                                                              |
| `value` / `onValueChange` | string / `(value: string) => void`                       | —           | Kontrollierte Variante                                                                                                            |
| `defaultValue`            | string                                                   | —           | Unkontrollierte Variante: welche Option zu Beginn ausgewählt ist                                                                  |
| `name`                    | string                                                   | automatisch | Formular-Feldname. Wird erzeugt, wenn nicht angegeben — nur durch den gemeinsamen Namen verhalten sich die Radios als EINE Gruppe |
| `disabled`                | boolean                                                  | —           | Sperrt die ganze Gruppe; die gesetzte Auswahl bleibt sichtbar                                                                     |
| `aria-label`              | string                                                   | —           | Nur nötig, wenn es kein `label` gibt                                                                                              |
| `className`               | string                                                   | —           | Klassen für den äußeren Wrapper                                                                                                   |

Beispiele:

```tsx
import { RadioGroup } from "@/design-system/components";

<RadioGroup
  label="Choose one"
  defaultValue="a"
  options={[
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
    { value: "c", label: "Option C" },
  ]}
/>

<RadioGroup
  label="Disabled"
  defaultValue="a"
  disabled
  options={[
    { value: "a", label: "Locked A" },
    { value: "b", label: "Locked B" },
  ]}
/>
```

Kontrolliert (mit eigenem State):

```tsx
const [plan, setPlan] = useState("b");

<RadioGroup
  label="Plan"
  value={plan}
  onValueChange={setPlan}
  options={PLANS}
/>;
```

Maße: Kreis 20×20px, Eckradius `rounded-pill` (bei 20px Kantenlänge ein Vollkreis), Rahmen `--border-width`, Schatten `--offset-control`. Ausgewählt: Fläche in der Rolle `secondary` mit Punkt in `foreground` (8×8px) mittig; nicht ausgewählt: `surface`.

Disabled: die Auswahl, die du per `defaultValue` bzw. `value` setzt, bleibt sichtbar — im Beispiel oben ist „Locked A“ gesetzt und gesperrt. Kreis und Label der Einträge werden ausgeblichen (40% Alpha), der Gruppen-Titel bleibt voll lesbar. Gleiches Verhalten hat inzwischen auch das Label der Checkbox.

Interaktion: Hover-Lift, Drücken und Tastatur-Fokus-Ring wie bei der Checkbox. Per Tab landet man auf der ausgewählten Option, die Pfeiltasten wechseln die Auswahl (mit Umbruch am Anfang/Ende), Tab verlässt die Gruppe. Gesperrte Gruppen oder Optionen werden übersprungen.

Client-Component: `RadioGroup` hat `"use client"` am Dateianfang, weil es an jedes Radio selbst einen `onChange`-Handler hängt (der `onValueChange` aufruft) — eine Server-Component darf keine Event-Handler auf Elementen setzen. Du kannst sie trotzdem ganz normal in einer Server-Seite benutzen; nur `onValueChange` (eine Funktion) kannst du nur aus einer eigenen Client-Component heraus übergeben.

## Switch

Aus `src/design-system/components/Switch.tsx`. Gleiche Bauweise wie die Checkbox: ein echtes, nur visuell verstecktes `<input type="checkbox">` — mit `role="switch"`, damit Screenreader es als Ein/Aus-Schalter ansagen — plus gezeichneter Track und Knopf. Erbt alle nativen `<input>`-Props (`checked`, `defaultChecked`, `onChange`, `name`, `required`, `aria-*` …) zusätzlich zu den eigenen. Keine Client-Component und ohne eigenen State: die Ein/Aus-Optik wird per CSS direkt am Input abgelesen.

| Prop                   | Typ                                                                                | Default   | Bedeutung                                                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| `label`                | string                                                                             | —         | Text rechts neben dem Switch, anklickbar (schaltet um). Bei `disabled` wird das Label wie der Switch ausgeblichen |
| `color`                | `"accent" \| "green" \| "pink" \| "purple" \| "yellow" \| "blue" \| "orange" \| "destructive"` | `"accent"` | Farbe des Tracks im Zustand EIN (Rolle `accent` oder Palette-Name)                                                                 |
| `checked` / `onChange` | boolean / Handler                                                                  | —         | Kontrollierte Variante                                                                                            |
| `defaultChecked`       | boolean                                                                            | —         | Unkontrollierte Variante, startet eingeschaltet                                                                   |
| `disabled`             | boolean                                                                            | —         | Ausgeblichen (40% Alpha), nicht bedienbar, übersprungen beim Tab — der gesetzte Zustand bleibt sichtbar           |
| `aria-label`           | string                                                                             | —         | Nur nötig, wenn es kein `label` gibt                                                                              |
| `className`            | string                                                                             | —         | Klassen für den äußeren Wrapper                                                                                   |

Beispiele:

```tsx
import { Switch } from "@/design-system/components";

<Switch label="Active" defaultChecked />
<Switch label="Inactive" />
<Switch label="Custom Color" color="purple" defaultChecked />
<Switch label="Disabled On" disabled defaultChecked />
<Switch label="Disabled Off" disabled />
```

Maße: Track 48×28px, Rahmen `--border-width`, Eckradius `rounded-pill`, Schatten `--offset-control`. Knopf 20×20px, Rahmen `--border-width`, Eckradius `rounded-pill`, Fläche `surface`; er sitzt 2px vom Rand und rutscht beim Einschalten 20px nach rechts. Farben: EIN = Rolle `accent` (Default, änderbar über `color`), AUS = immer `sand` — eigenes Token in `tokens.css`, nutzbar als `bg-sand`.

Eigene Farbe: `color` nimmt nur Namen aus der Palette, keine beliebigen Hex-Werte — so bleibt der Switch an den Tokens hängen. Soll eine Farbe hinzukommen, die noch nicht in der Liste ist, legst du zuerst ein Token in `tokens.css` an und trägst sie dann in der `ON_COLOR_CLASSES`-Tabelle in `Switch.tsx` ein (dort steht, warum die Klassen als vollständige Strings da stehen müssen).

Interaktion: Hover-Lift, Drücken und Tastatur-Fokus-Ring wie bei der Checkbox. Leertaste schaltet um. Wie bei allen Komponenten kannst du `onChange` nur aus einer Client-Component übergeben (siehe „Server- vs. Client-Components“).

## Slider

Aus `src/design-system/components/Slider.tsx`. Unter der Haube ein echtes, unsichtbar darübergelegtes `<input type="range">` — das erledigt Ziehen, Klick auf die Leiste, Touch, Pfeiltasten, Pos1/Ende, Bild auf/ab und die Screenreader-Semantik. Leiste, Füllung und Knopf werden selbst gezeichnet und aus dem aktuellen Wert positioniert (native Range-Inputs können weder eine gefüllte Strecke noch einen harten Schatten browserübergreifend zuverlässig darstellen). Weil dafür State nötig ist, ist der Slider eine Client-Component (`"use client"` steht schon in der Datei).

| Prop                      | Typ                                                                                | Default                          | Bedeutung                                                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `label`                   | string                                                                             | —                                | Text oben links über der Leiste, anklickbar (fokussiert den Slider). Ohne Label: `aria-label` setzen                   |
| `color`                   | `"accent" \| "green" \| "pink" \| "purple" \| "yellow" \| "blue" \| "orange" \| "destructive"` | `"accent"` | Farbe der Füllung (Rolle `accent` oder Palette-Name)                                                                                    |
| `min` / `max` / `step`    | number                                                                             | `0` / `100` / native Vorgabe (1) | Wertebereich und Schrittweite                                                                                          |
| `value` / `onValueChange` | number / `(value: number) => void`                                                 | —                                | Kontrollierte Variante                                                                                                 |
| `defaultValue`            | number                                                                             | `min`                            | Unkontrollierte Variante, Startwert                                                                                    |
| `showValue`               | boolean                                                                            | `true`                           | Wert oben rechts über der Leiste anzeigen                                                                              |
| `display`                 | `"percent" \| "value"`                                                             | `"percent"`                      | Was oben rechts steht: Position in Prozent ("60%") oder der echte Zahlenwert ("150")                                   |
| `unit`                    | string                                                                             | —                                | Einheit hinter dem Wert bei `display="value"`, z. B. `"px"` → "150 px". Bei Prozent wirkungslos                        |
| `formatValue`             | `(value: number) => string`                                                        | —                                | Voller Zugriff auf den Anzeigetext (und `aria-valuetext`), überschreibt `display` und `unit`, z. B. `(v) => v + " px"` |
| `disabled`                | boolean                                                                            | —                                | Ausgeblichen (40% Alpha), nicht bedienbar, übersprungen beim Tab — der Wert bleibt sichtbar                            |
| `className`               | string                                                                             | —                                | Klassen für den äußeren Wrapper                                                                                        |

Beispiele:

```tsx
import { Slider } from "@/design-system/components";

<Slider label="Volume" defaultValue={60} />
<Slider label="Brightness" defaultValue={30} />
<Slider label="Accent" color="purple" defaultValue={45} />
<Slider label="Max 200" max={200} defaultValue={150} display="value" />
<Slider label="Width" max={500} step={10} defaultValue={320} display="value" unit="px" />
<Slider label="Locked" defaultValue={50} disabled />
```

Maße: Leiste 12px hoch, Rahmen `--border-width`, Eckradius `rounded-pill`, Schatten `--offset-control`. Knopf 20×20px, Rahmen `--border-width`, Eckradius `rounded-pill`, Fläche `surface` — derselbe wie beim Switch. Er sitzt vollständig innerhalb der Leiste (Mittelpunkt läuft von 10px bis Breite−10px). Die Füllung reicht bis zur Knopfmitte; sie ist standardmäßig die Rolle `accent`.

Maximum ungleich 100: `max` (und `min`/`step`) setzt du einfach als Prop. Der Default zeigt aber immer die Position in Prozent — bei `max={200}` und Wert 150 also „75%“. Für den echten Wert gib `display="value"` mit (optional `unit="px"`); für ganz eigene Texte `formatValue`. Das Maximum legt der Entwickler im Code fest; ein Eingabefeld, mit dem Besucher das Maximum selbst ändern, gibt es nicht.

Eigene Farbe: `color` nimmt nur Palette-Namen, keine Hex-Werte. Eine neue Farbe legst du zuerst als Token in `tokens.css` an und trägst sie dann in der `FILL_CLASSES`-Tabelle in `Slider.tsx` ein (die Klassen müssen dort als vollständige Strings stehen, damit Tailwind sie findet).

Interaktion: Tastatur-Fokus-Ring am Knopf (nur per Tastatur, nicht beim Klicken). Kein Hover-Lift — der Knopf folgt dem Mauszeiger beim Ziehen. `onValueChange` bekommt eine Zahl (kein Event); aus einer Server-Seite kannst du es wie bei allen Komponenten nicht übergeben (siehe „Server- vs. Client-Components“).

Bekannte Grenzen: Getestet nur in Chromium (Firefox/Safari nutzen dieselben Standard-Pseudo-Elemente, sind aber nicht geprüft). Ein `<form>`-Reset-Button setzt das native Input zurück, aber vermutlich nicht den gezeichneten Knopf — nicht getestet, bei Formularen mit Reset-Button also vorher ausprobieren. `aria-valuetext` folgt der Anzeige: bei `display="percent"` also Prozent, nicht der Rohwert.

## Section & Seiten-Navigation

**Section** (`Section.tsx`) ist der Wrapper für einen Abschnitt der Showcase-Seite: Überschrift + horizontale Linie, plus ein Anker für die Navigation.

| Prop        | Typ       | Bedeutung                                                |
| ----------- | --------- | -------------------------------------------------------- |
| `id`        | string    | Anker-ID, z. B. `"buttons"` → erreichbar über `#buttons` |
| `title`     | string    | Abschnittstitel (als `Heading2`)                         |
| `children`  | ReactNode | Inhalt des Abschnitts                                    |
| `className` | string    | optional                                                 |

```tsx
<Section id="buttons" title="Buttons">
  {/* Inhalt */}
</Section>
```

**Navigation der Showcase-Seite:** Die Seite nutzt nicht mehr `Navbar`, sondern den Library-eigenen `Header` mit Gruppen (`ShowcaseHeader` in `src/app/layout.tsx`). Er gilt für beide Showcase-Seiten: die Komponenten-Übersicht (`/`) und die Spiele-Bausteine (`/spiele`, Gruppe „Spiele“). Neuen Abschnitt hinzugefügt? Dort in `SECTIONS` in der passenden Gruppe einen Eintrag ergänzen, `href` mit Seite und passender `id` der `Section`:

```tsx
{ label: "Forms", items: [
  { label: "Buttons", href: "/#buttons" },
  { label: "Neue Komponente", href: "/#neu" },
] },
```

Immer mit Seite davor (`/#buttons`, `/spiele#shelf`), nie nur `#buttons`: Ein reiner Anker gilt für die Seite, auf der man gerade ist. Von `/spiele` aus würde `#buttons` auf `/spiele#buttons` zeigen, das es nicht gibt.

Die beiden Seiten verlinken sich auch untereinander: Die Übersicht hat unten den Abschnitt „Spiele“ (kleines Regal plus Link), die Spiele-Seite oben eine Breadcrumb zurück zur Library.

`Navbar.tsx` wird nirgends mehr verwendet und kann gelöscht werden (dann auch den Export in `components/index.ts` entfernen).

## Spiele-Bausteine

Fünf Bausteine (plus `GameTheme`), um eigene Spiele vorzustellen: eine Übersicht als Regal (`Shelf`), der Kopf einer Spielseite (`GameCase`), die „Rückseite“ mit Screenshots und Features (`BackSite`), die Fakten vor dem Kauf (`FactBar`) und das Pressekit (`PressKit`). Alle fünf sind Server-Components. Eine Beispielseite mit allen fünf liegt unter `/spiele` (`src/app/spiele/page.tsx`).

**Eine Farbe pro Spiel, einmal gesetzt.** Jedes Spiel bekommt genau eine Farbe aus der Palette (`green`, `pink`, `purple`, `yellow`, `blue`, `orange`, `sky`, Typ `GameColor`). Sie wird **einmal** mit `<GameTheme color="green">` um die Spielseite (und die Wiki-Seiten dieses Spiels) gesetzt; alles darin übernimmt sie: Key-Art-Platzhalter, Band oben auf der BackSite, Feature-Marker, Infobox-Titel. Die `color`-Props an den Bausteinen sind nur noch für Ausnahmen da. Einzige Stelle, an der du sie pro Element setzt: die Rücken im Regal, denn dort ist jeder Rücken ein anderes Spiel. Ohne `GameTheme` fallen alle auf `sky` zurück.

```tsx
<GameTheme as="main" color="green">
  <GameCase title="Moosleuchten" … />
  <BackSite …>…</BackSite>
</GameTheme>
```

Technisch setzt `GameTheme` nur zwei CSS-Variablen (`--game`, `--game-soft`), die Bausteine lesen sie. Deshalb bleibt alles Server-Component, und ein inneres `GameTheme` gewinnt über ein äußeres. Die Hauptaktion bleibt `primary`: Die Spielfarbe ist Erkennung, keine Bedeutung. Text auf der Spielfarbe ist immer `foreground` (in Emaille mindestens 5,2:1). Bei einem neuen Stil prüfen.

### Shelf

```tsx
<Shelf>
  <ShelfSpine
    title="Moosleuchten"
    year="2025"
    color="green"
    href="/spiele/moosleuchten"
    height={288}
  />
  <ShelfSpine
    title="Sternwarte 9"
    year="2027"
    color="yellow"
    href="/spiele/sternwarte-9"
  />
  <ShelfSpine title="Bald im Regal" year="2028" placeholder />
</Shelf>
```

| Prop (`ShelfSpine`) | Typ         | Bedeutung                                                |
| ------------------- | ----------- | -------------------------------------------------------- |
| `title`             | string      | Titel auf dem Rücken                                     |
| `year`              | string      | oben auf dem Rücken, z. B. `"2027"` oder `"TBA"`         |
| `color`             | `GameColor` | Spielfarbe dieses Rückens (hier pro Rücken setzen); ohne: aus dem `GameTheme`, sonst `sky` |
| `href`              | string      | Link zur Spielseite; ohne ist der Rücken nicht klickbar  |
| `height`            | number      | Rückenhöhe in px auf dem Desktop (240–320), Standard 280. Lange Titel brauchen mehr: Passt der Titel nicht, wird er sichtbar abgeschnitten (Screenreader lesen ihn trotzdem ganz). „Kilotonnen-Küche“ braucht etwa 300 |
| `placeholder`       | boolean     | gestrichelter, leerer Rücken für ein angekündigtes Spiel |

Ältestes Spiel links, das Regal wächst nach rechts. Beim Zeigen oder Fokussieren rutscht der Rücken heraus. Unter `sm` werden die Rücken zu waagerechten Streifen. Mehr als etwa 12 Spiele: ein zweites `Shelf` darunter, nicht seitlich scrollen lassen. `Shelf` nimmt `aria-label` (Standard „Spiele“).

### GameCase

```tsx
<GameCase
  title="Moosleuchten"
  pitch="Ein Gärtner, ein verlassenes Gewächshaus und Pflanzen, die nachts leuchten."
  status="demo"
  art={<Image src="/moos/key-art.jpg" alt="" fill className="object-cover" />}
  actions={
    <>
      <Button icon={<Heart />}>Auf Steam auf die Wunschliste</Button>
      <Button variant="outline" icon={<Play />}>
        Trailer ansehen (1:42)
      </Button>
    </>
  }
/>
```

| Prop      | Typ                                         | Bedeutung                                                                           |
| --------- | ------------------------------------------- | ----------------------------------------------------------------------------------- |
| `title`   | string                                      | wird das `<h1>` der Seite                                                           |
| `pitch`   | string                                      | EIN Satz, der sagt, was man im Spiel tut                                            |
| `art`     | ReactNode                                   | Key Art 3:4 als Element; ohne erscheint ein Platzhalter mit Format und Mindestgröße |
| `logo`    | ReactNode                                   | Logo statt getipptem Titel; das `<h1>` behält den Titel als Text                    |
| `status`  | `"development"` \| `"demo"` \| `"released"` | Badge mit Icon und Text: In Entwicklung, Demo spielbar, Erschienen                  |
| `color`   | `GameColor`                                 | nur für eine Ausnahme, sonst aus dem `GameTheme`                                    |
| `actions` | ReactNode                                   | Buttons: genau einer `primary`, der Rest `outline`                                  |

Kein Text über der Key Art. Ein Trailer startet erst auf Klick.

### BackSite

```tsx
<BackSite
  screenshots={[<img key="1" src="/moos/1.jpg" alt="Gewächshaus bei Nacht" />, …]}
  features={["Repariere das Gewächshaus Raum für Raum.", …]}
>
  <FactBar platforms="PC, Switch" players="1–2" release="Frühjahr 2027" languages="Deutsch, Englisch" />
</BackSite>
```

| Prop          | Typ         | Bedeutung                                                                                 |
| ------------- | ----------- | ----------------------------------------------------------------------------------------- |
| `title`       | string      | Standard „Was dich erwartet“                                                              |
| `screenshots` | ReactNode[] | höchstens drei, 16:9, das wichtigste zuerst (wird groß); ohne erscheinen drei Platzhalter |
| `features`    | ReactNode[] | drei oder vier Tätigkeiten, mit einem Verb am Anfang                                      |
| `color`       | `GameColor` | nur für eine Ausnahme, sonst aus dem `GameTheme`                                          |
| `children`    | ReactNode   | darunter, meist eine `FactBar`                                                            |

Mehr als drei Screenshots gehören in eine Galerie darunter.

### FactBar

| Prop                                                        | Typ                  | Bedeutung                                                            |
| ----------------------------------------------------------- | -------------------- | -------------------------------------------------------------------- |
| `platforms`, `players`, `release`, `languages`, `ageRating` | ReactNode            | immer in dieser Reihenfolge; fehlt ein Wert, steht dort „noch offen“ |
| `extra`                                                     | `{ label, value }[]` | weitere Fakten danach, z. B. Preis oder Spieldauer                   |

Flach, ohne Schatten (Information, keine Ebene). Altersfreigaben als Text; offizielle Kennzeichen nur als Originaldatei der Prüfstelle.

### PressKit

```tsx
<PressKit
  archive={{ href: "/presse/moos.zip", size: "266 MB" }}
  files={[
    {
      name: "Factsheet",
      description: "PDF, 2 Seiten",
      size: "180 KB",
      href: "/presse/factsheet.pdf",
    },
    {
      name: "Trailer",
      description: "MP4, 1080p, 1:42",
      size: "212 MB",
      href: "/presse/trailer.mp4",
    },
  ]}
/>
```

Jede Datei bekommt eine eigene Zeile mit Inhalt und Größe. Die Größe ist Pflicht. Die Links sind echte `<a download>` im Button-Look, kein `Button`: Ein Download ist Navigation und soll sich in einem neuen Tab öffnen oder als Link kopieren lassen. Reihenfolge: Factsheet, Logos, Screenshots, Key Art, Trailer.

## Wiki-Bausteine und ruhige Stufe

Für Seiten zum Lesen (Spiele-Wiki, Anleitungen, lange Artikel). Die Library ist laut gebaut: dicke Rahmen, harte Schatten. Auf einer langen Seite mit Tabelle, zwei Hinweisen und einem Steckbrief wird das schwer, weil nichts mehr zurücktritt. Die **ruhige Stufe** folgt der Schattenregel strenger: Information liegt flach, nur was man anfasst, wirft Schatten.

**Ruhige Stufe an bestehenden Bausteinen:** `flat` an `Card`, `Table` und `Alert`. Kein Schatten, Rahmen in `--border-width-flat` (2px statt 3px). Eine flache Tabelle trennt die Zeilen nur noch mit feinen Linien. Ein flacher Alert hat `role="note"` statt `status`/`alert`: Er ist Teil des Textes, keine Meldung, die gerade erscheint, und soll nicht beim Laden der Seite vorgelesen werden.

```tsx
<Table flat aria-label="Fundorte">…</Table>
<Alert flat variant="warning" title="Nicht neben Glimmfarn pflanzen">…</Alert>
<Card flat padding>…</Card>
```

Faustregel: Auf einer Wiki-Seite ist alles im Artikel `flat`. Buttons behalten ihren Schatten, die werden ja angefasst.

Eine Beispielseite mit allem liegt unter `/wiki` (`src/app/wiki/page.tsx`): drei Spalten ab `lg` (Seitennavigation, Artikel, Inhaltsverzeichnis), darunter alles untereinander.

### Infobox

Steckbrief eines Artikels, wie der Kasten oben rechts in einem Lexikon.

```tsx
<Infobox
  className="mb-6 lg:float-right lg:mb-4 lg:ml-8 lg:w-72"
  title="Leuchtmoos"
  image={<img src="/wiki/moos.jpg" alt="Leuchtmoos auf einem Stein, nachts" />}
  caption="Ausgewachsenes Polster in der 5. Nacht"
  rows={[
    { label: "Art", value: "Bodendecker" },
    { label: "Fundort", value: "Nordflügel, Kellertreppe" },
  ]}
/>
```

| Prop      | Typ                   | Bedeutung                                                              |
| --------- | --------------------- | ---------------------------------------------------------------------- |
| `title`   | string                | Name der Sache; steht im Band in der Spielfarbe                        |
| `image`   | ReactNode             | optional, mit echtem `alt` (das Bild trägt hier meist Information)     |
| `caption` | ReactNode             | kurze Zeile unter dem Bild                                             |
| `rows`    | `{ label, value }[]`  | 4–10 Fakten; mehr gehört in den Text oder eine Tabelle                 |
| `color`   | `GameColor`           | nur für eine Ausnahme, sonst aus dem `GameTheme`                       |

Die Platzierung ist Sache der Seite: auf breiten Bildschirmen rechts neben dem Text (`lg:float-right`), auf dem Handy über dem Text.

### TableOfContents

Sprungliste zu den Überschriften eines Artikels. h3-Einträge sind unter ihrem h2 eingerückt.

```tsx
<TableOfContents
  sticky
  items={[
    { id: "fundorte", label: "Fundorte" },
    { id: "pflege", label: "Pflege" },
    { id: "giessen", label: "Gießen", level: 3 },
  ]}
/>
```

| Prop     | Typ                         | Bedeutung                                              |
| -------- | --------------------------- | ------------------------------------------------------ |
| `items`  | `{ id, label, level? }[]`   | die Überschriften in Seitenreihenfolge; `level` 2 oder 3 |
| `title`  | string                      | Standard „Inhalt“                                      |
| `sticky` | boolean                     | bleibt ab `lg` beim Scrollen stehen                    |

Erst ab etwa drei Abschnitten sinnvoll. Die Ziel-Überschriften brauchen `scroll-mt-24`, sonst verdeckt der klebende Header sie nach dem Sprung. Markiert nicht den Abschnitt, den man gerade liest: Das bräuchte eine Client-Component mit `IntersectionObserver`. Erst einbauen, wenn Artikel so lang werden, dass man sich verliert.

### SideNav

Alle Wiki-Seiten in Gruppen, die aktuelle hervorgehoben (Rolle `selected`, wie bei Tabs und Menü).

```tsx
<SideNav
  aria-label="Moosleuchten-Wiki"
  groups={[
    { label: "Pflanzen", items: [
      { label: "Leuchtmoos", href: "/wiki/leuchtmoos", current: true },
      { label: "Glimmfarn", href: "/wiki/glimmfarn" },
    ] },
  ]}
/>
```

| Prop         | Typ                                              | Bedeutung                                                         |
| ------------ | ------------------------------------------------ | ----------------------------------------------------------------- |
| `groups`     | `{ label, items: { label, href, current? }[] }[]` | Gruppen mit Links; `current` setzt `aria-current="page"`          |
| `aria-label` | string                                           | Name der Navigation, auch Beschriftung der Klappe auf dem Handy   |

Ab `lg` eine Spalte; darunter eine zugeklappte Klappe (`<details>`) über dem Artikel, damit auf dem Handy der Artikel zuerst kommt. Braucht kein JavaScript. Normale `<a>`-Links; für Navigation ohne Neuladen in Next.js gegen `Link` aus `next/link` tauschen.

## Server- vs. Client-Components

In Next.js (App Router) ist jede Komponente standardmäßig eine Server-Component; `"use client"` in der ersten Zeile einer Datei macht sie zur Client-Component. Beides lässt sich in der Library frei mischen — die Grenze gilt pro Datei.

| Komponente                                                                                                                                | Client? | Grund                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| `Input`                                                                                                                                   | ja      | internen State (Passwort-Toggle) und eigener `onClick`                                                       |
| `Select`                                                                                                                                  | ja      | baut auf Radix auf, das intern Zustand verwaltet — zur Sicherheit als Client markiert                        |
| `RadioGroup`                                                                                                                              | ja      | hängt an jedes Radio einen eigenen `onChange`-Handler                                                        |
| `Slider`                                                                                                                                  | ja      | hält den Wert im State, um Knopf und Füllung zu positionieren                                                |
| `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`                                                                                          | ja      | baut auf Radix Tabs auf und teilt die Farbe per React-Context — alles in einer Datei mit `"use client"`      |
| `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`                                                                      | ja      | baut auf Radix Accordion auf und teilt die Farbe per React-Context — alles in einer Datei mit `"use client"` |
| `Tooltip`                                                                                                                                 | ja      | baut auf Radix Tooltip auf, das Zustand (offen/zu) und Event-Handler braucht                                 |
| `Pagination`                                                                                                                              | ja      | hält die aktuelle Seite im State und hat eigene Klick-Handler                                                |
| `DropdownMenu`                                                                                                                            | ja      | baut auf Radix Dropdown Menu auf, braucht Zustand und `onSelect`-Funktionen                                  |
| `Header`, `HeaderBrand`                                                                                                                   | ja      | `Header` hält State für das Hamburger-Menü und hat Event-Listener (`HeaderBrand` allein bräuchte es nicht)   |
| `Dialog`, `ConfirmDialog`                                                                                                                 | ja      | baut auf Radix Dialog auf (Zustand, Fokus-Falle), `onConfirm` ist eine Funktion                              |
| `Toaster`, `toast`                                                                                                                        | ja      | globaler Speicher mit `useSyncExternalStore`, Radix Toast; `toast.*()` nur aus Browser-Code aufrufen         |
| `Button`, `ButtonLink`, `Badge`, `Card`, `Checkbox`, `Textarea`, `ColorSwatchCard`, `Switch`, Typografie, `Section`, `Navbar`                           | nein    | rendern nur aus Props; Handler reichen sie lediglich durch                                                   |
| `Alert`, `Avatar`, `AvatarGroup`, `Progress`, `Table`-Bausteine, `Breadcrumb`, `CardHeader`, `CardTitle`, `CardDescription`, `CardFooter` | nein    | rendern nur aus Props, keine Hooks oder eigenen Handler                                                      |
| `Shelf`, `ShelfSpine`, `GameCase`, `BackSite`, `FactBar`, `PressKit`, `GameTheme`, `Infobox`, `TableOfContents`, `SideNav`                | nein    | rendern nur aus Props; Regalrücken, Klappe der SideNav und Spielfarbe sind reines CSS                         |

Wann braucht eine (neue) Komponente `"use client"`: wenn sie Hooks nutzt (außer `useId`), selbst Event-Handler setzt (`onClick={() => …}`) oder Browser-APIs benutzt (`window`, `localStorage`). Interaktion, die nur CSS ist — Hover, Fokus, „angehakt“ über Tailwind — braucht es nicht; deshalb ist z. B. die Checkbox keine Client-Component. Faustregel: Hook oder eigener Handler → `"use client"`, sonst nicht. Zu viel `"use client"` kostet nur etwas Bundle-Größe; fehlt es, wo es nötig ist, bricht der Build mit einer klaren Fehlermeldung ab.

Was beim Einsatz auf einer Webseite trotzdem passieren kann: Solange du den Komponenten nur Daten gibst (Texte, Zahlen, Booleans, JSX), funktionieren sie in Server- wie in Client-Seiten ohne Zusatz. Nicht möglich ist es, aus einer Server-Seite eine Funktion zu übergeben — also `onClick`, `onChange`, `onValueChange`. Das gilt für alle Komponenten der Library, auch für die, die selbst keine Client-Components sind (getestet mit einem echten Next-Build: `Button`, `Checkbox`, `Input`, `Select` und `RadioGroup` brechen jeweils ab, sobald eine Funktion aus einer Server-Seite übergeben wird; ohne Funktionen laufen alle durch). Das ist eine Next.js-Regel und lässt sich in der Library nicht wegbauen — `"use client"` an der Komponente hilft hier nicht.

Lösung: den interaktiven Teil in eine kleine eigene Client-Component packen und die in der Seite benutzen:

```tsx
// src/components/PlanPicker.tsx
"use client";

import { useState } from "react";
import { RadioGroup } from "@/design-system/components";

const PLANS = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
];

export function PlanPicker() {
  const [plan, setPlan] = useState("free");
  return (
    <RadioGroup
      label="Plan"
      value={plan}
      onValueChange={setPlan}
      options={PLANS}
    />
  );
}
```

Die Seite bleibt eine Server-Component und benutzt einfach `<PlanPicker />`. Alternativ kannst du die ganze Seite mit `"use client"` markieren — einfacher, aber dann läuft die komplette Seite als Client-Code.

Außerhalb des Next.js App Routers (z. B. Vite oder Pages Router) ist `"use client"` nach meinem Kenntnisstand wirkungslos und schadet nicht — das habe ich nicht getestet.

## Eigene Funktionalität hinzufügen

Die Komponenten in `design-system/` enthalten bewusst keine Business-Logik — sie kümmern sich nur ums Aussehen/Verhalten der UI. Funktionalität gibst du beim Einsatz mit, nicht in der Komponente selbst.

Das funktioniert, weil z. B. `ButtonProps` alle nativen `<button>`-Props (u. a. `onClick`) übernimmt und ungenutzte Props via `{...props}` direkt ans `<button>`-Element durchreicht:

```tsx
<Button variant="primary" onClick={() => console.log("geklickt")}>
  Speichern
</Button>
```

Achtung: Dieses Beispiel funktioniert nur in einer Client-Component (Datei mit `"use client"`). Direkt in einer Server-Seite bricht der Build ab, sobald du eine Funktion wie `onClick` an eine Komponente gibst — Details und Lösung im Abschnitt „Server- vs. Client-Components“.

Für einen Button, der z. B. einen API-Call macht und währenddessen den `loading`-State zeigen soll, verwaltest du den State in deiner eigenen Komponente:

```tsx
const [isSaving, setIsSaving] = useState(false);

async function handleSave() {
  setIsSaving(true);
  try {
    await saveToApi();
  } finally {
    setIsSaving(false);
  }
}

<Button variant="primary" loading={isSaving} onClick={handleSave}>
  Speichern
</Button>;
```

Warum die Trennung wichtig ist: `Button`, `Card` & Co. sind Teil der kopierbaren Library und werden projektübergreifend wiederverwendet. Stünde Logik (API-Calls, Navigation) direkt in der Komponente, müsstest du sie bei jeder Wiederverwendung wieder auseinandernehmen. So bleibt die Library stabil, und Funktionalität lebt dort, wo sie inhaltlich hingehört — in deiner jeweiligen Seiten-/Feature-Komponente.
