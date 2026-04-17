# Banjo Master — Design System

**Warm & Handcrafted.** The app should feel like picking up a well-loved instrument: aged paper, walnut fretboard, brass hardware, catgut strings. Nothing synthetic. Nothing shiny. Every surface has a story.

This document is the source of truth — when code and this document disagree, update the document _or_ update the code.

---

## Design Principles

1. **Texture over gradient.** A tiny paper-grain overlay reads warmer than any linear-gradient().
2. **Material, not abstraction.** Components reference real banjo parts: _head_, _fret_, _pot_, _string_, _tailpiece_.
3. **Typography carries the tone.** Lora (with SOFT + WONK axes active) does the hand-lettered work — stop reaching for a script font.
4. **Limit color saturation.** Colors come from nature and metal, not the SaaS rainbow. Prefer the warm ramp over Tailwind's stock slate/blue/purple/green.
5. **Motion settles, never springs.** The ease curve is an old door hinge, not a trampoline.

---

## Palette Tokens

The current `:root` and `.dark` blocks in `src/app/globals.css` are the canonical ramp. Below is the refined set, extending them with banjo-specific accents. Hex values already match globals.css where noted.

### Core (Light)
| Token | Hex | Role |
|---|---|---|
| `--background` | `#f5efe4` | Aged paper — primary canvas |
| `--foreground` | `#2b1810` | Walnut ink — primary text |
| `--surface` | `#fbf7ef` | Fresh page — card and panel fill |
| `--surface-hover` | `#efe7d8` | Dog-eared page — hover / pressed card |
| `--border` | `#d8cdb8` | Soft deckle edge |
| `--muted` | `#a89684` | Pencil mark — secondary text |

### Core (Dark)
| Token | Hex | Role |
|---|---|---|
| `--background` | `#1a1108` | Rosewood at dusk |
| `--foreground` | `#f0e5d1` | Candlelit parchment |
| `--surface` | `#271a0f` | Lamp-lit wood |
| `--surface-hover` | `#322316` | Polished grain |
| `--border` | `#3f2e1d` | Shadowed seam |
| `--muted` | `#8a7562` | Dust on brass |

### Accent Ramp (shared with small light/dark shifts)
| Token | Light | Dark | Role |
|---|---|---|---|
| `--primary` | `#b4531f` | `#e68a3b` | Burnt orange / clay — primary CTA, active state |
| `--primary-light` | `#d97706` | `#f4a85c` | Marigold — hover, subtle fills |
| `--primary-dark` | `#7c2d12` | `#b4531f` | Fired brick — pressed, focus outline |
| `--secondary` | `#7a6655` | `#b8a08a` | Walnut — secondary text on surface |
| `--accent` | `#c8932b` | `#d9a84e` | Brass fretwire — highlights, badges |

### Banjo-Specific Extensions (propose adding)
| Token | Light | Dark | Role |
|---|---|---|---|
| `--brass` | `#c8932b` | `#d9a84e` | Hardware, 5th-string capo, frets |
| `--catgut` | `#ecd9a6` | `#c9b47d` | Head/string highlight — subtle yellow-cream |
| `--mahogany` | `#6b3010` | `#8f4a24` | Deep panel accent — use sparingly |
| `--clover` | `#5b8c3e` | `#7fb35a` | Success / "in-tune" indicator |
| `--terracotta` | `#b4362d` | `#d25747` | Danger / "out of tune" indicator |

### Status tokens (rename for clarity)
| Token | Current | Rename to | Why |
|---|---|---|---|
| `--success` | `#5b8c3e` | keep, alias as `--clover` | Still a leaf, now named like one |
| `--danger` | `#b4362d` | keep, alias as `--terracotta` | Fired-clay red reads warmer |
| `--warning` | `#c08a2b` | keep, alias as `--brass` | Same hue as accent, share token |

> **Action:** add the three new tokens (`--brass`, `--catgut`, `--mahogany`) and the two aliases to the `:root`/`.dark`/`@theme inline` blocks in `globals.css`.

### Badge palette (fix RecommendationCards.tsx)
Replace the `bg-blue-100 text-blue-800` family with palette-driven pairs:

```tsx
const TYPE_BADGE_COLORS: Record<string, string> = {
  lesson:         'bg-primary/10 text-primary-dark',
  song:           'bg-accent/15 text-[var(--mahogany)]',
  'chord-practice': 'bg-[var(--catgut)]/40 text-[var(--mahogany)]',
  technique:      'bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[color-mix(in_srgb,var(--success)_80%,black)]',
  review:         'bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[color-mix(in_srgb,var(--danger)_80%,black)]',
};
```

This keeps the whole app in-palette in both modes — the current stock Tailwind colors blow the dark-mode contrast.

---

## Typography

**Keep the current stack.** Lora is doing a lot of work here — a warm, book-style serif with a soft calligraphic italic. Nunito's rounded terminals pair warmly with it. Caveat earns its keep as punctuation — tags, call-out labels, margin notes.

### Stack
| Role | Font | Weight(s) | Tailwind var | Use for |
|---|---|---|---|---|
| Display / H1 | **Lora** | 600 / 700 | `--font-serif` | Page titles, hero headings |
| Heading / H2-H4 | **Lora** | 500 / 600 | `--font-serif` | Section headings |
| Body | **Nunito** | 400 / 500 / 600 | `--font-sans` | Paragraphs, labels, nav |
| Hand / Accent | **Caveat** | 500 / 700 | `--font-hand` | Badges, quotes, "NEW" tags, tool-tip flavor text |
| Mono | **Geist Mono** | 400 / 600 | `--font-mono` | Chord names, fret numbers, tab notation |

### Google Fonts import (already present via `next/font/google`)

```ts
// src/app/layout.tsx — reference only, currently correct
Lora({ variable: "--font-lora", subsets: ["latin"] })
Nunito({ variable: "--font-nunito", subsets: ["latin"] })
Caveat({ variable: "--font-caveat", subsets: ["latin"] })
Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })
```

### Scale (Tailwind-friendly)
| Class | Size / Leading | Use |
|---|---|---|
| `text-xs` | 12 / 16 | Meta, captions |
| `text-sm` | 14 / 20 | Secondary body, dense tables |
| `text-base` | 16 / 24 | Default body |
| `text-lg font-serif` | 18 / 26 | H4 |
| `text-xl font-serif` | 20 / 28 | H3 |
| `text-2xl font-serif` | 24 / 32 | H2 |
| `text-4xl font-serif font-semibold tracking-tight` | 36 / 40 | H1 |
| `font-hand text-3xl` | 30 / 36 | Hero flourish, onboarding |

### Usage rules
- **Never mix Lora and Caveat in the same line.** Caveat is an accent — one word, a label, a badge. Lora carries the weight.
- **Body text stays Nunito** — do not set serif on paragraphs, it tires the eye.
- **Numbers in chord diagrams and tabs = Geist Mono**, tabular nums enabled: `font-mono tabular-nums`.
- **Caveat is not a body font.** If you find yourself using it on a sentence longer than ~6 words, switch to Lora italic.

---

## Textures

### Paper grain (already present)
The inline SVG noise in `globals.css:78` is doing the right thing — kept at ~4% opacity so it reads as fiber, not pattern. **Keep. Do not make it denser.**

### Wood grain (propose adding — optional, for large surfaces only)
For sidebar fills or full-height hero panels, a linear wood-grain overlay reinforces the fretboard metaphor without drowning content:

```css
.wood-grain {
  background-image:
    /* vertical grain streaks */
    repeating-linear-gradient(
      90deg,
      rgba(82, 45, 20, 0.04) 0px,
      rgba(82, 45, 20, 0.04) 1px,
      transparent 1px,
      transparent 7px
    ),
    /* warm base */
    linear-gradient(180deg, var(--surface) 0%, var(--surface-hover) 100%);
}
.dark .wood-grain {
  background-image:
    repeating-linear-gradient(
      90deg,
      rgba(255, 220, 170, 0.05) 0px,
      rgba(255, 220, 170, 0.05) 1px,
      transparent 1px,
      transparent 7px
    ),
    linear-gradient(180deg, var(--surface) 0%, var(--surface-hover) 100%);
}
```

Use sparingly — Sidebar, ExercisePreflight hero, or the Metronome pot, not every card.

### Brass halo (for focus / active fret)
When showing a selected chord shape or an active fret on the camera feed, a soft brass glow makes it feel lit rather than highlighted:

```css
.fret-active {
  box-shadow:
    0 0 0 1px var(--brass),
    0 0 12px -2px color-mix(in srgb, var(--brass) 70%, transparent);
}
```

### What to avoid
- **No pixel-grain filters** — the existing SVG is calibrated, don't layer a second noise.
- **No skeuomorphic wood photographs** — they clash with the flat paper grain. If you want wood, use the gradient above.
- **No glassmorphism / heavy backdrop-blur** — breaks the paper metaphor. The one exception is the Header's `bg-surface/80 backdrop-blur` which works because it's reading as tracing paper over the canvas.

---

## Motion

The existing `--ease-warm: cubic-bezier(0.25, 0.46, 0.45, 0.94)` is our single default easing — think _old door hinge_, settles without bounce.

### Durations
| Token | Value | Use |
|---|---|---|
| `--motion-quick` | `150ms` | Hover color change, cursor state |
| `--motion-default` | `240ms` | Card lift, button press, link underline |
| `--motion-settle` | `380ms` | Dialog entrance, sheet slide, tab pane |
| `--motion-page` | `520ms` | Route transitions (Next.js view-transitions), exercise countdown fade |

Add these to `@theme inline` so Tailwind can consume them as arbitrary values.

### Rules
- Every `transition-*` utility gets `duration-[240ms]` (or one of the tokens) and `[transition-timing-function:var(--ease-warm)]`.
- **No scale-on-hover** for layout blocks — shifts neighbors, feels cheap. Use color, shadow, border-color instead.
- `prefers-reduced-motion` is already honored in `globals.css:124` — keep.
- Metronome tick animation stays on `transform` only, at 60fps. Never animate `width`/`height`.

### Micro-interactions
- **Button press:** `active:translate-y-px active:shadow-[var(--shadow-soft)]` — a tiny, felt depress.
- **Card hover:** `hover:shadow-[var(--shadow-lift)] hover:border-primary/30` — lifts, does not scale.
- **Input focus:** border warms to `--primary`, a 1px brass underline draws left-to-right over `240ms`.

---

## Components

### Card
The workhorse. Two variants: `paper` (default) and `deckle` (rough-edge callouts).

```tsx
// Default paper card
<div className="
  bg-surface
  border border-border
  rounded-xl
  shadow-[var(--shadow-soft)]
  p-4
  transition-[box-shadow,border-color,background-color]
  duration-[240ms]
  [transition-timing-function:var(--ease-warm)]
  hover:shadow-[var(--shadow-lift)]
  hover:border-primary/30
">
  ...
</div>
```

```tsx
// Deckle-edge variant (for hero callouts, saved chord sheets)
<div className="
  bg-surface
  border border-border
  rounded-[18px_4px_18px_4px]     // uneven corners = torn page
  shadow-[var(--shadow-lift)]
  p-5
  relative
  before:absolute before:inset-0
  before:rounded-[inherit]
  before:pointer-events-none
  before:[background-image:url('data:image/svg+xml;utf8,…tiny-deckle-noise…')]
  before:opacity-30
">
  ...
</div>
```

**Rules:**
- Radius: `rounded-xl` (12px) for default, never `rounded-full` on content cards.
- Padding: 16px (`p-4`) for list cards, 20px (`p-5`) for hero, 24px (`p-6`) for dialogs.
- Border is always 1px `var(--border)` — no `border-2`, no double borders.

### Button

Three variants.

```tsx
// Primary — clay / burnt orange
<button className="
  inline-flex items-center gap-2
  px-4 py-2
  bg-primary text-background font-semibold
  rounded-lg
  shadow-[var(--shadow-soft)]
  transition-all duration-[240ms] [transition-timing-function:var(--ease-warm)]
  hover:bg-primary-light
  active:translate-y-px active:shadow-none active:bg-primary-dark
  disabled:opacity-50 disabled:cursor-not-allowed
  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-dark
">
  Start Practice
</button>

// Secondary — walnut outline
<button className="
  inline-flex items-center gap-2
  px-4 py-2
  bg-surface text-foreground
  border border-border
  rounded-lg
  transition-colors duration-[240ms]
  hover:bg-surface-hover hover:border-primary/40
  active:bg-surface-hover
">
  Cancel
</button>

// Ghost — no chrome
<button className="
  inline-flex items-center gap-2
  px-3 py-1.5
  text-muted
  rounded-lg
  transition-colors duration-[150ms]
  hover:text-foreground hover:bg-surface-hover
">
  Skip
</button>
```

**Rules:**
- Minimum touch target: 44×44px on mobile. For icon-only buttons, use `p-2` + `w-11 h-11` or equivalent.
- Always pair icon-only buttons with `aria-label`.
- `cursor-pointer` on every button — verify. React 19 doesn't add it automatically.
- Loading state: swap label for a spinner, keep button width stable (reserve space).

### Input

Paper-and-pencil aesthetic — subtle underline that warms on focus.

```tsx
<label className="block">
  <span className="block text-sm font-medium text-foreground mb-1">
    Song Title
  </span>
  <input
    type="text"
    className="
      w-full
      bg-surface
      border border-border
      rounded-lg
      px-3 py-2
      text-foreground
      placeholder:text-muted/70
      transition-[border-color,box-shadow] duration-[240ms]
      [transition-timing-function:var(--ease-warm)]
      hover:border-primary/40
      focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
      disabled:bg-surface-hover disabled:text-muted disabled:cursor-not-allowed
    "
  />
</label>
```

**Hand-lettered variant** — use Caveat for the label when the input represents a personal note (practice journal, song title you're naming yourself):

```tsx
<span className="block font-hand text-lg text-foreground mb-1">Your note</span>
```

**Rules:**
- Always `label` + `for`/`id` (or wrap). Never placeholder-as-label.
- Error state: border → `--terracotta`, helper text `text-danger text-xs mt-1`.
- Inputs and buttons share `rounded-lg` (8px) — cards are `rounded-xl` (12px). One step down for interactive elements reads as "these are the pressed/typed-into things."

### Dialog

Slides in with a settle, paper-card body, optional torn edge.

```tsx
<Dialog.Root>
  <Dialog.Overlay className="
    fixed inset-0 z-40
    bg-foreground/40 backdrop-blur-[2px]
    data-[state=open]:animate-in data-[state=open]:fade-in-0
    data-[state=closed]:animate-out data-[state=closed]:fade-out-0
    duration-[380ms]
  " />
  <Dialog.Content className="
    fixed left-1/2 top-1/2 z-50
    w-[92vw] max-w-md
    -translate-x-1/2 -translate-y-1/2
    bg-surface
    border border-border
    rounded-xl
    shadow-[var(--shadow-lift)]
    p-6
    focus:outline-none
    data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2
    data-[state=closed]:animate-out data-[state=closed]:zoom-out-95
    duration-[380ms]
    [transition-timing-function:var(--ease-warm)]
  ">
    <Dialog.Title className="font-serif text-xl font-semibold text-foreground mb-2">
      Title
    </Dialog.Title>
    <Dialog.Description className="text-sm text-muted mb-5">
      Short explanation.
    </Dialog.Description>
    {/* body */}
    <div className="flex justify-end gap-2 mt-6">
      <Dialog.Close className="/* secondary button */">Cancel</Dialog.Close>
      <button className="/* primary button */">Confirm</button>
    </div>
  </Dialog.Content>
</Dialog.Root>
```

**Rules:**
- Overlay is `foreground/40` not `black/50` — the warm scrim matches the canvas.
- Close via: X icon (top-right, ghost button), Esc, click-outside. Provide all three.
- Never nest dialogs. Use a sheet or a step-through inside.
- Body scroll-locked when open (`@radix-ui/react-dialog` handles this — use it).

### Additional component patterns

- **Badge / Pill**: `px-2 py-0.5 rounded-full text-[10px] font-medium` + one of the palette pairs above. Don't exceed 10 characters inside.
- **Tab nav** (for Tuner/Metronome tool tabs): underline-style, active tab has 2px bottom border in `--primary` that slides between tabs on `240ms`.
- **Fretboard diagram**: bone/catgut fills (`--catgut`), brass fret lines (`--brass`), walnut fingerboard fill (`--mahogany` at 15% opacity over surface). Position markers (3/5/7/9/12) in Caveat at small size.
- **Empty state**: Lora H3 + Nunito sub + a small hand-drawn SVG (not a stock illustration). Think _marginalia_, not _mascot_.

---

## Icons

- **Never emojis as UI icons.** `RecommendationCards.tsx:43` currently renders `{rec.icon}` as a `text-2xl` emoji — replace with a 20px Lucide or Tabler SVG mapped from `rec.type`.
- Stroke icons only, `stroke-width=1.6`, 20px or 22px viewBox. Match existing Header style.
- Color via `currentColor` so the icon inherits text color on hover.

---

## Accessibility Floor

- All interactive elements have visible `:focus-visible` — rely on the existing `globals.css:117` outline rule, don't override per-component.
- Color contrast ≥ 4.5:1 for body text, ≥ 3:1 for large (18pt+) — verify the muted-on-surface pair in light mode especially.
- Camera-based practice view needs text alternatives for anything the hand-feedback overlay communicates (mute toggle for audio, live-region announcements for "chord detected").
- `prefers-reduced-motion`: no new animation should be added without checking this query.

---

## Dark-mode specifics

The dark ramp already inverts correctly. Watch out for:
- **Surfaces too dark to distinguish.** `--surface` (`#271a0f`) sits 1 step above `--background` (`#1a1108`) — ensure cards don't disappear. Add a soft border even in dark mode.
- **Brass/accent saturation.** `--accent` is brighter in dark (`#d9a84e`) — use it sparingly, it can overwhelm.
- **Paper grain is lighter in dark mode** (opacity 0.06 vs 0.04). Correct. Do not raise further.

---

## Checklist before shipping a new screen

- [ ] All colors come from palette tokens — grep for `bg-blue`, `bg-slate`, `text-gray`, fail the check.
- [ ] Lora used for every heading ≥ `text-lg`.
- [ ] No emojis as icons — SVG only.
- [ ] Every interactive element has `cursor-pointer` and `:focus-visible`.
- [ ] `transition-*` utilities paired with `duration-[240ms]` and the `--ease-warm` timing function.
- [ ] Tested in both light and dark.
- [ ] Tested at 375px, 768px, 1024px.
- [ ] `prefers-reduced-motion` respected for any new animation.
