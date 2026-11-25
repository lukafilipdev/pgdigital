# PG INŽENIRING — Digital

Single-page marketing site for PG INŽENIRING's web design & development studio.
Built with Next.js 16 (App Router), React 19 and Tailwind CSS v4.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
npm run lint
npm run capture # re-take project screenshots from their live URLs
```

## Structure

```
src/
  app/                 layout (fonts, metadata), page composition, global styles & theme tokens
  actions/             server actions (contact form)
  assets/              static imports (logo)
  content/site.ts      all copy and data: nav, services, projects, process steps
  hooks/               useFrame, useMagnetic, useMediaQuery, useInView, scroll helpers…
  lib/                 math, shared rAF loop, pointer tracking, class-name helper
  components/
    intro/             loader + context that starts the hero intro when it finishes
    effects/           custom cursor
    layout/            header, mobile menu, footer
    ui/                small presentational primitives
    sections/
      hero/            pinned hero + canvas engine (engine/*)
      services/        service list + tilting showcase panel (slides/*)
      projects/        horizontal scroll track + case-study dialog
      process/         pinned process walkthrough + browser mock (mock/*)
      contact/         contact section and form
```

## How the animation works

- **One animation loop.** `lib/frame-loop.ts` runs a single `requestAnimationFrame`
  loop; components subscribe with `useFrame(callback, enabled)`. Sections pass
  `enabled = inViewport` so off-screen work stops.
- **No per-frame re-renders.** Frame callbacks write styles directly to refs.
  React state only changes on discrete events (active service, process step…).
- **Pinned sections** are tall `<section>`s with a `position: sticky` stage;
  `getPinProgress()` maps the scroll position to 0–1.
- **Hero canvas** (`sections/hero/engine`): `HeroScene` composes a spring mesh,
  a lens that reveals the code under the headline, a 3D stack of four layers
  (code → structure → form → experience; textures painted once into offscreen
  canvases and perspective-mapped) that lands one layer per scroll stage, merges
  into the finished, front-facing site, and a perspective floor whose buildings
  turn digital under the closing statement. The scroll timeline lives in
  `TIMELINE` at the top of `Hero.tsx`.
- **Cursor hints.** Any element can opt in with `data-cursor="link" | "view" | "explore"`
  and an optional `data-cursor-label`.
- `prefers-reduced-motion` and coarse pointers disable the cursor, magnetic and
  tilt effects and freeze ambient motion.

> Tailwind v4 note: `translate-*`/`scale-*` utilities use the CSS `translate`/`scale`
> properties, which stack with `style.transform`. Elements animated from JS get
> their initial transform via `style`, not utility classes.

## To finish before launch

- **Contact form:** `src/actions/contact.ts` validates input but does not deliver
  it anywhere yet — connect an email provider or CRM there.
- **Projects** live in `src/content/site.ts`. Each has a `url`; `npm run capture`
  screenshots it (using your installed Chrome/Edge, cookie banners declined)
  into `public/images/projects/`: a desktop or phone view depending on the
  project's `cardView` (cards take that shot's aspect ratio at a shared height,
  so nothing is cropped), plus a 2:1 cover. Set `embeddable: true` to show the live site in the case-study
  pop-up — only for sites that work inside an iframe (Midnight Auto Studio
  currently crashes there due to unguarded `localStorage` access).
