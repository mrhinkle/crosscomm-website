# CrossComm design system

The working design reference for the CrossComm review site, based on the implementation as of 4 October 2026. Maintain it alongside changes to the site. This documents the review build; it is not a company-wide brand approval.

Fonts and the navy and orange come from the CrossComm brand templates (Google Drive, CrossComm Branding / Final): Archivo Narrow bold for headings, Open Sans for body, Dark Navy `#272F39`, Orange `#F2994A`. The direction for this review build is an editorial technology studio on that brand: navy and ice fields, the original CrossComm wordmark, brand orange for primary actions with a deeper orange for text on light surfaces, neutral mist for quiet bands, and the original favicon blue as a small accent on navy. That continues three choices already made for the build: keep the existing public logo, use a cool navy and grey field with those complements, and share the React/Vite and content-record architecture, rather than inventing a new one. CrossComm paths follow its own legacy URL inventory. Do not add purple gradients, glowing orbs, large orange panels, or stock dashboard charts.

## Mark

Provenance and hashes live only in [docs/SOURCES.md](docs/SOURCES.md). Do not copy that list here, and do not redraw the mark or invent a four-square icon.

| Asset | Role |
| --- | --- |
| `client/public/logo.png` | Original white wordmark. Intrinsic size 676×129. Header and footer render it at 205px wide, height automatic, in `.logo img` (`client/src/styles.css`). No stretch, filter, or recolor. Home link name is “CrossComm home” (`client/src/components/chrome.tsx`). |
| `client/public/favicon.svg` | Original SVG favicon, linked from `client/index.html`. |
| `client/public/og.png` | 1200×630 social card. Rendered offline from `scripts/og-card.html` by `scripts/render-og.ts`. Same logo file, unchanged, on brand navy with an 8px brand-orange rule and the line “Make the next thing.” Not a public route. |

The card template sets the headline in self-hosted Archivo Narrow 700 at 64px. `scripts/og-card.html` loads `archivo-narrow-latin-700-normal.woff2` from `node_modules` with a file URL relative to the template. It does not request a font from the network. `scripts/render-og.ts` waits until that face is loaded and `document.fonts.ready` has settled before it writes `client/public/og.png`.

## Color

Tokens are the custom properties on `:root` in `client/src/styles.css`. Hex values below match that file.

| Token | Hex | Use |
| --- | --- | --- |
| `--ice` | `#f2f5f7` | Page background. Selection text on slate. |
| `--ice-deep` | `#e3eaf0` | Review banner, fallback note, footer tagline. |
| `--slate` | `#272f39` | Brand Dark Navy. Body text, header, footer, dark bands, label on orange controls. |
| `--slate-soft` | `#465d6e` | Secondary text. Also the border of inputs and textareas. |
| `--line` | `#cad5de` | Dividers and decorative rules. Not the field border. |
| `--copper` | `#9b5518` | Deeper brand-hue orange for text on light surfaces: default links, display accent, service numbers. Brand orange itself is too light for text on ice (2.03:1). |
| `--copper-hover` | `#854914` | Hover for copper links on light surfaces. |
| `--copper-light` | `#f2994a` | Brand Orange as text on navy: footer links, “Make it matter.” in the home hero. Not text on ice. |
| `--orange` | `#f2994a` | Brand Orange fill for primary controls (`.btn-deep`, `.talk`), with a navy label. |
| `--orange-hover` | `#f6b37a` | Hover fill for primary controls. |
| `--white` | `#fcfdfe` | Footer link hover. Preview and code wells. |
| `--mist` | `#e8ecf0` | Neutral light band (`.band-mist`, the home Approach band), occasional panel, and photo well. Replaced the earlier pale teal so the palette stays navy, orange, and neutrals. |
| `--brand-blue` | `#89b6d5` | Header rule, current-page underline, focus ring on dark chrome. Not small text on ice. |
| `--danger` | `#7a1e12` | Over-limit counts and `.form-errors`. Kept distinct from copper. |
| `--photo-matte` | `#123f4a` | Well Aware card well only (`.slug-well-aware .media`). |
| `--slate-deep` | `#1b2831` | Body of the home hero agent panel (`.agent-steps`) only. |

On dark slate, footer anchors use `--copper-light` and turn `--white` on hover. Header navigation links are `--ice`, not light copper. Primary buttons are a navy label on `--orange`, and on `--orange-hover`, everywhere, including the report dialog. The feedback dialog forces its links back to copper, because it sits on ice inside the dark footer.

The home hero band draws its grid and sweep line in brand blue at 9% and 55% opacity, and the agent panel border in brand blue at 28%. Those are decoration, not text.

One color is not a token: the dialog backdrop `rgba(39, 55, 67, 0.72)` (slate at 72% opacity).

The ratios below are WCAG contrast math for these hex pairs, computed when the brand colors were applied. They are not an axe or browser audit: slate on ice 12.36:1, slate-soft on ice 6.29:1, copper on ice 5.17:1, copper hover on ice 6.48:1, slate on orange 6.08:1, slate on orange hover 7.51:1, slate on mist 11.4:1, slate-soft on mist 5.8:1, orange on slate 6.08:1, orange on slate-deep 7.28:1, brand blue on slate 6.26:1, copper on mist 4.77:1, danger on ice 9.49:1. Design targets are 4.5:1 for body text, 3:1 for large text, and 3:1 for focus indicators and other essential control boundaries. A pair meeting that math is not conformance.

## Type

Self-hosted, first four lines of `client/src/styles.css`: Archivo Narrow latin 700 (`@fontsource/archivo-narrow` 5.3.0), Open Sans latin 400 and 600 (`@fontsource/open-sans` 5.3.0), IBM Plex Mono latin 400. Archivo Narrow and Open Sans are the brand fonts. Stacks are `--display`, `--sans`, and `--mono`, each with a system fallback. `--display` is `"Archivo Narrow", "Arial Narrow", "Helvetica Neue", sans-serif`. Body is Open Sans at `1.125rem` / line-height 1.6. Headings and other display text are Archivo Narrow bold (rules ask for 600; only the 700 face is loaded, so 700 renders), roman, line-height 1.05, letter-spacing `-0.01em`, unless a class overrides them. There is no italic display cut.

`clamp()` sizes are copied from the stylesheet. At a 16px root, `1rem` is 16px. These are current values, not a new scale.

| Role | Rule | Size | Line height |
| --- | --- | --- | --- |
| Home hero title | `.display` | `clamp(3.25rem, 7vw, 6.875rem)` (52px to 110px) | 0.92 |
| “Make it matter.” Roman, weight 600, copper. Not italic. In the dark home hero band it is `--copper-light`. | `.line-matter` | inherits `.display` | 0.92, inherited |
| Other page titles | `.page-intro h1` | `clamp(3rem, 7vw, 5.75rem)` | 1.05 |
| Service titles | `.service-intro h1` | `clamp(2.6rem, 4.4vw, 4.15rem)` | 1.05 |
| Section titles | `.section-head h2`, `.band h2`, `.faqs h2`. Interior `h1` sizes are the rows above; `.page-intro h1` is overridden later in the stylesheet. | `clamp(2.4rem, 5vw, 4.25rem)` | 1.05 |
| Deck | `.deck` | `clamp(1.2rem, 2vw, 1.45rem)` | 1.45 |
| Eyebrow | `.eyebrow` | `0.75rem`, mono, uppercase | — |

Do not style a service or interior `h1` with `.display`. That class is the home hero only. The 404 numeral (`.giant`) is separate: `clamp(6rem, 22vw, 14rem)`, line-height 0.8, copper.

Reading measure is set in CSS, not by a global column: decks `38rem`, section heads `40rem`, section decks `36rem`, page intros `46rem`, service intros `64rem`, row copy `46rem`, FAQ answers `42rem`, band leads `38rem`, archive summaries `40rem`.

Eyebrows are mono, `0.75rem`, weight 400, tracking `0.14em`, uppercase, in `--slate-soft`. On a dark band, `.eyebrow-on-dark` uses `--brand-blue`. Eyebrows are for section labels only; stat labels, card captions, and the footer do not use them. The dialog eyebrow stays `--slate-soft` on ice. Selection is slate fill with ice text.

## Layout

`--page` is `1320px`. `.wrap` is `min(1320px, calc(100% - 40px))`, so the default side gutter is 20px. At `min-width: 960px` it becomes `calc(100% - 120px)`, so 60px each side. The review banner uses the same 20px / 60px padding. There is no 8px spacing system. Section padding, gaps, and type use the `clamp()` and `rem` values in the stylesheet.

| Breakpoint | What changes |
| --- | --- |
| `800px` and up | Proof row goes to four columns. Service rows sit on one line. Portfolio grid is three columns. Footer is three columns. Home FAQ is a two-column list under its heading. |
| `900px` and up | Desktop nav replaces the menu button. Below that (`max-width: 899px`) the button shows. |
| `960px` and up | Wider gutters and the desktop hero: two columns, shorter crop, large first case card. |

Vertical space is fluid. Examples from the same file: home hero padding `clamp(2.75rem, 6vw, 5.5rem)` on top, sections `clamp(5rem, 10vw, 9rem)`, bands `clamp(5rem, 10vw, 8.5rem)`, interior pages `clamp(2rem, 4vw, 3.5rem)` on top. At 960px the home hero padding drops to `1.5rem 2rem` because the desktop crop is shorter.

The header is sticky, `--header` is `4.75rem`, and a 1px `--brand-blue` rule sits on its bottom edge. Desktop links are Services, Work, Approach, and Insights, in ice at `1.05rem`, plus a brand-orange “Let’s talk” with a navy label. The current page gets an inset brand-blue underline. “Let’s talk” uses an ice underline instead, so the orange button does not grow a blue bar.

The mobile menu is `position: fixed` and, until placed, sits at `top: 100dvh` with `visibility: hidden`. When open, `client/src/components/Shell.tsx` sets `--nav-top` to the header’s bottom edge and adds `data-placed` so the panel becomes visible under the real header. Links there are Archivo Narrow bold at `2.4rem`. The menu closes on Escape and when the viewport reaches 900px. Without JavaScript, `.nav-noscript` shows the same destinations in a wrapping row.

## Components

- **Primary** (`.btn-deep`, header `.talk`): brand-orange fill, navy label, lighter orange-hover fill. `.talk` is at least 44px tall. `.btn` is at least 48px.
- **Secondary** (`.btn-line`): slate outline, slate label. Hover fills slate with ice text. Pressed filter chips do the same.
- **Ghost** (`.btn-ghost`): ice outline and label for use on dark bands. Hover fills ice with slate text. `.btn-paper` is the ice-filled button on dark bands (slate label; hover fills white). It is not a paper color.
- **Text links** (`.text-link`): slate, weight 600, no underline. Hover turns the label copper and, when motion is allowed, nudges the arrow 4px.
- **Disabled**: `opacity: 0.55` and `cursor: not-allowed`.
- **Services**: numbered rows, copper Archivo Narrow index, title, copy, arrow. The whole row is one link.
- **Cases**: photograph in a 16/11 well (`.media`), mist behind the crop, category tags, title, summary. Cards carry no caption line; the image caption lives on the case-study page (`ProjectPage` figcaption). Tags are pill outlines: Open Sans 600 at `0.82rem`, slate on ice, `--line` border. The 0.45rem dot (`.sq`) is the home hero caption only, in `--copper-light` there. The case-study hero is 16/9. ACS CARES is the large home card (4/5 in that slot), with its own object position, not a fake device. Well Aware uses `--photo-matte` behind the image. The six files are `client/public/images/`. Alt text stays on the project record. Do not generate a picture and caption it as the client’s product. Rights are still open. See [docs/BACKLOG.md](docs/BACKLOG.md).
- **FAQ**: question in an `h3`, answer in a visible paragraph. Not a disclosure widget. On the home page (`.home-faqs`) the heading sits above and the four answers run in two columns from 800px.
- **Proof row** (home): Since 1998, Founder Don Shin, Offices Durham & Cleveland, Practices (the count of service records). Labels are plain Open Sans in `--slate-soft`, not mono.
- **Footer**: three columns with no eyebrows. Logo, tagline, offices and founding line; site links; email, phone, and the report launcher. Links are brand orange (`--copper-light`) on navy.
- **Service rows**: `5.5rem` number column and `1.75rem` row padding from 800px.
- **Contact**: fields are white with a `--slate-soft` border. The composer opens a `mailto:` draft or copies the brief. The status line says the mail app must send it. Nothing is stored here. The consultation form is the existing CrossComm form, opened in a new tab from a mist panel. A lead inbox is not wired. See [docs/BACKLOG.md](docs/BACKLOG.md).
- **Feedback**: **Report a problem** prepares a note you can read, copy, download, or open as a GitHub draft. The dialog says it does not file the report. Do not describe a report as sent. Permission and intake changes belong to [docs/BACKLOG.md](docs/BACKLOG.md) and [docs/FEEDBACK.md](docs/FEEDBACK.md), not to a redesign in this file. The dialog is `min(42rem, calc(100% - 40px))`, ice background, `--line` border. Its backdrop is slate at 72% opacity. Choice labels are at least 44px tall. Over-limit text is `--danger` and `aria-invalid`.

- **Home hero**: a full-width `.hero-band.band-forest` (slate, ice text) with a faint 56px brand-blue grid. Buttons are `.btn-deep` and `.btn-ghost`. The right column is `AgentRun` (`client/src/components/AgentRun.tsx`): a mono panel that plays an agent brief, three MCP tool calls, a note, and a finished plan. It is captioned “Illustration · an AI agent using MCP tools”. It is not a client project; do not attach a client name or invented results to it. Every step is in the prerendered HTML; the loop starts only after hydration, pauses off screen, and does not run when the visitor asks for less motion.

Hover motion, when the visitor has not asked for less motion, is a 500ms ease on photographs and the hero crop (scale 1.03 on card hover or focus) and a 4px arrow nudge. Also inside the same `no-preference` query:

- The hero headline lines, copy, and agent panel rise in once on load (800ms, staggered 0 to 380ms). A 1px brand-blue line sweeps down the hero every 9s.
- Agent steps fade in one at a time. The current step shows a blinking block caret, and the status dot pulses while it runs.
- Scroll reveal: blocks marked `data-reveal` fade and rise 1.5rem as they enter the viewport (700ms, plus `--i` × 70ms for staggered service rows). `useReveal` (`client/src/lib/reveal.ts`, called from `Shell`) only hides blocks that start below the fold, so prerendered content on screen never flashes. Print shows everything.
- Service rows: the number and title shift 0.5rem right on hover or keyboard focus.

Reduced motion removes all of it. Do not add a second animation that ignores that query.

## Accessibility

This is the current behavior, not a conformance certificate.

- Keyboard focus uses `:focus-visible`: 3px outline, 3px offset. Light surfaces use slate. Header, footer, mobile nav, and `.band-forest` start from brand blue. `.band-forest` then overrides the ring to ice. `.report-dialog` forces the ring back to slate on the ice dialog. A page `h1` that receives focus on route change (`tabindex="-1"`) shows no ring: it is not a control, and the focus is for screen readers.
- Targets of at least 44px are implemented on the header talk link, the menu button, filter chips, the report launcher, and dialog choice labels. Primary `.btn` controls are 48px.
- Do not convey state by color alone. Current page uses an underline as well as color. Work filters set `aria-pressed` and hide or show projects; the fill and text color are not the non-color cue. Example: `aria-pressed="true"` on Web, with the status “1 project” and only that card shown. Form errors use text in `.form-errors` and `aria-invalid` on the feedback fields.
- `prefers-reduced-motion: reduce` turns off smooth scroll, animations, and transitions, including the photo zoom.
- Pages use one `h1`, breadcrumb and footer landmarks, skip link “Skip to content”, and visible labels. The dialog traps focus while it is open.

## Content, SEO, and AEO

Write answers a person can read, and keep case proof inside what the source page actually said. Structure, titles, and meta descriptions should name the same thing as the visible page. The editing rules are [docs/CONTENT-GUIDE.md](docs/CONTENT-GUIDE.md). The search plan is [docs/SEO-AEO-STRATEGY.md](docs/SEO-AEO-STRATEGY.md).

This review build is `noindex`. `siteConfig.indexable` stays false, and the `X-Robots-Tag` header stays `noindex` until the owner asks for that cutover in the pull request that does it. A docs-only change does not flip indexing. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Where to edit

| Change | File |
| --- | --- |
| Tokens, type, layout, components | `client/src/styles.css` |
| Header, footer, cards, FAQ | `client/src/components/chrome.tsx`, `client/src/components/Shell.tsx` |
| Sentences and routes | `client/src/content/` |
| Logo, favicon, photographs | `client/public/` |
| Social card | `scripts/og-card.html`, then `node --experimental-strip-types scripts/render-og.ts`. Inspect the 1200×630 output and the shared `ogImageAlt` in `client/src/lib/seo.ts`. |

`client/src/generated/build-meta.ts` is generated. Do not edit it.

## Review checklist

- Logo is the white wordmark at 205px, not recolored, and the favicon is still the original SVG.
- New text sits on a pair from the token table. Dividers use `--line`. Fields use `--slate-soft`.
- A new page title is not given the home `.display` size by mistake.
- At a narrow width the page does not scroll sideways. The mobile menu opens under the header, not over it.
- Home and interior titles still use different clamps. A service `h1` was not restyled as the home display.
- Buttons and the menu control keep their minimum target size. Focus is visible on ice and on slate.
- Motion still respects `prefers-reduced-motion`.
- Contact and feedback copy still say draft, copy, or download. They do not say sent or filed.
- A UI change runs `pnpm check`. Someone other than the author reviews the pull request. A docs-only edit does not invent a new test.

## What not to treat as the system

- Do not import a spacing scale. If a new gap is needed, match a nearby `rem` or `clamp()` already used for that kind of block.
- Do not recolor the wordmark to work on ice. It is white. It belongs on `--slate`.
- Do not use `--brand-blue` for small labels on `--ice`. It is an accent on dark surfaces.
- Do not use `--copper-light` on ice. It is the footer link color on slate.
- Category tags are 0.82rem, smaller than body text. Treat them as small text and preserve at least 4.5:1 contrast. They use slate on ice with the line border.
- The feedback dialog is the only place that renders `.form-errors`. The contact composer does not validate into that list. It opens or copies a draft.
- The footer tagline is the string in `client/src/site-config.ts`: “Independent thinking. Lasting impact.” It renders in `--ice-deep` on slate. The home eyebrow names Durham, North Carolina and Cleveland, Ohio. Do not invent a headcount or a client count.
- The skip link sits at the top left, with ice text on a slate background, and only moves into view on focus. `main` is the target.
- Home and portfolio share `ProjectCard` but intentionally use different grid compositions. Review a shared-card change in both `.home-work` and `.portfolio-grid` while retaining their distinct compositions.

## Still open

Photography rights, consultation-lead delivery, legal and privacy text, and a CMS are open decisions. They are tracked in [docs/BACKLOG.md](docs/BACKLOG.md) (issues 5, 3, 2, and 10). This document does not decide them.
