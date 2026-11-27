# Saran Chotsuwan Portfolio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A recruiter-facing bento-grid portfolio SPA for Saran Chotsuwan, with four case-study overlays. Each route gets its own shareable HTML. The site deploys on Vercel at saranchotsuwan.com.

**Architecture:** A Vite + React + TS single-page app. All copy lives in typed `src/content/*` modules. A tiny History-API router maps `/`, `/about` and `/projects/:slug` to home plus an optional overlay. A post-build Node script stamps per-route `index.html` files with route-specific meta and OG tags, then writes the sitemap, robots and 404 files, and fails the build on `draft: true` in production.

**Tech Stack:**
- Vite 6, React 19, TypeScript 5
- Tailwind CSS v4 (`@tailwindcss/vite`), `motion` (`motion/react`), `lenis`, `lucide-react`
- Vitest + @testing-library/react + jsdom
- Playwright (Chromium + WebKit) + `@axe-core/playwright`
- `satori` + `@resvg/resvg-js` for OG images

**Spec:** `docs/superpowers/specs/2026-11-26-portfolio-design.md`

## Global Constraints

- **Never use the reference site's assets.** No monogram, Lottie files, videos, images, copy, Android-green accent (`#3DDC84`/`#0F9D58`) or HKG→LHR card.
- **Never publish internal Introhive details:**
  - ticket IDs (regex `/\bIHS-\d+/`)
  - internal repo, service and hive names: a private denylist, stored only as SHA-256 hashes in `tests/unit/content.test.ts`
  - colleague names, or PR/ticket/line counts
- **Introhive MCP role text must say test automation / deletion-pipeline coverage.** Never "built the MCP".
- **No store, coaching, eBook, video-feedback, booking, forms, preloader, custom cursor or Lottie.**
- **Production build fails if any content item has `draft: true`.**
- **Fixed content values:**
  - Timezone `America/Moncton`, label "Fredericton, NB"
  - Email `saran.chotsuwan000@gmail.com`, LinkedIn `https://www.linkedin.com/in/saran-chotsuwan-5b38682b5`, GitHub `https://github.com/schotsuw`, domain `https://saranchotsuwan.com`
  - PRs: squat 180 kg, bench 100 kg, deadlift 200 kg, total 480 kg, bodyweight 68 kg
  - Roles, as in spec §5.1: Introhive Associate Machine Learning Engineer, May 2025 – Apr 2026 co-op and Oct 2026 – present part-time; UNB TA Information to Cybersecurity, Jan – Apr 2025; Sonrai Security Junior Software Development Engineer in Test, Sep – Dec 2024; UNB TA Multiple Programming Languages, Jan – Apr 2024
- **Design tokens:** typography and radii from the blueprint (`--text-caption` 12/16 … `--text-jumbo` 104/1). Page bg light `#f0f0f0` / dark `#000000`; card `#ffffff` / `#161616`; text `#121212` / `#ffffff`; secondary `#666666` / `#9E9E9E`.
- **Every `backdrop-filter`** has `-webkit-backdrop-filter`. Every `mask-composite: exclude` has `-webkit-mask-composite: xor`.
- **Every `<video>`** has `autoPlay loop muted playsInline` and `poster`.
- **`prefers-reduced-motion: reduce`** disables Lenis, in-view animation, hover color cycling and the overlay slide (a fade is used instead).
- **Breakpoints:** desktop grid at `lg` (≥1024px). Mobile flow below that.
- **Quality targets:**
  - Lighthouse mobile Performance ≥ 90 and Accessibility ≥ 95 on `/`
  - axe: 0 serious or critical violations

## Review Focus

1. **Direct-loading `/projects/<slug>` then pressing Close or Esc** must go to `/` and stay on the site. It must not call `history.back()` out of the site. Test lives in Task 4.
2. **An unknown path or slug** (`/projects/nope`, `/foo`) renders home without throwing or showing an overlay. Test in Task 4.
3. **The clipboard API being unavailable or rejected** makes Copy email fall back to `mailto:`. Test in Task 7.
4. **`localStorage` throwing** (Safari private mode) makes the theme fall back to `prefers-color-scheme` without a crash, in both the head script and the provider. Test in Task 3.
5. **Laptop widths of 1024–1279px**: no horizontal overflow and no clipped card text, in WebKit too. Test in Task 12.

---

## File Structure

```
index.html                      head theme script, base meta
vercel.json                     rewrites
public/resume.pdf, public/fonts/OpenRunde-{400,500,600,700}.woff2, public/og/*.png (generated), public/photos/
scripts/postbuild.ts            per-route HTML, sitemap, robots, 404, draft guard
scripts/og.tsx                  OG image generation
src/main.tsx, src/App.tsx
src/styles/index.css            tailwind import, @theme tokens, fonts, dark variant
src/styles/glass.css            glass button/chip, bottom blur
src/content/types.ts            Project, Role, Site, StackGroup, Personal, Section types
src/content/{site,projects,experience,stack,personal}.ts
src/content/index.ts            re-exports + getProject(slug), adjacentProjects(slug)
src/lib/router.tsx              RouterProvider, useRoute, navigate, parsePath
src/lib/theme.tsx               ThemeProvider, useTheme, THEME_SCRIPT string
src/lib/time.ts                 zonedParts(date, tz)
src/lib/career.ts               roleAt(year), RULER_YEARS
src/lib/motion.ts               useReducedMotion re-export, useLenis
src/components/glass/{GlassButton,GlassChip}.tsx
src/components/overlay/Overlay.tsx
src/components/cards/{Hero,ProjectCard,AboutMini,ExperienceMini,StackCard,ResumeBanner,PersonalityCard,ThemeCard,CareerRuler,ClockCard}.tsx
src/components/art/{Monogram,RagDiagram,McpDiagram,PlantLoop,SlangPair}.tsx
src/components/layout/{DesktopGrid,MobileHome,MobileDock,Footer}.tsx
src/components/pages/{CaseStudy,About}.tsx
src/components/case/{MetaStrip,SectionBlock}.tsx
tests/unit/*.test.ts(x)         Vitest
tests/e2e/*.spec.ts             Playwright
CONTENT_TODO.md
```

---

### Task 1: Scaffold, theme tokens, test harness

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles/index.css`, `public/fonts/*`, `vitest.setup.ts`, `playwright.config.ts`, `eslint.config.js`, `.gitignore`
- Test: `tests/unit/app.test.tsx`

**Interfaces:**
- Produces:
  - npm scripts `dev`, `build` (= `tsc -b && vite build && tsx scripts/postbuild.ts`), `test` (vitest run), `e2e` (playwright test), `lint`
  - `App` default export

- [ ] **Step 1:** Run `npm create vite@latest . -- --template react-ts` and install the stack listed in the header. Download the Open Runde woff2 files (OFL) from github.com/lauridskern/open-runde into `public/fonts/`, and add the `LICENSE` next to them.
- [ ] **Step 2: Write the failing test.** `app.test.tsx`: `render(<App/>)`, then `expect(screen.getByRole('main')).toBeInTheDocument()`.
- [ ] **Step 3:** Run `npm test` and confirm it fails.
- [ ] **Step 4:** Make `App` render `<main>`. In `index.css`:
  - add `@import "tailwindcss";`
  - add `@custom-variant dark (&:where(.dark, .dark *));`
  - define `@theme` tokens from Global Constraints
  - add `@font-face` for Open Runde 400–700 with `font-display: swap`, falling back to `Inter, system-ui, sans-serif`
  - add `--color-accent`: an original accent of the builder's choice that isn't green
  - add `--color-status-shipped` and `--color-status-progress: #64b5f6`

  Then configure `playwright.config.ts` with projects `chromium` and `webkit`, and `webServer: npm run build && npx vite preview --port 4173`.
- [ ] **Step 5:** Run `npm test && npm run build`. Both should pass.
- [ ] **Step 6:** Run `git init` (if needed), then commit with the message `chore: scaffold vite react tailwind v4`.

### Task 2: Content model + safety lint

**Files:**
- Create: `src/content/types.ts`, `site.ts`, `projects.ts`, `experience.ts`, `stack.ts`, `personal.ts`, `index.ts`, `CONTENT_TODO.md`
- Test: `tests/unit/content.test.ts`

**Interfaces:**
- Produces:
  - `type Status = 'shipped' | 'in-progress'`
  - `type Section = { kind: 'text'; heading: string; body: string } | { kind: 'list'; heading: string; items: string[] } | { kind: 'stats'; heading: string; items: { label: string; value: string }[] } | { kind: 'quote'; text: string } | { kind: 'diagram'; art: ArtId; caption: string } | { kind: 'image'; src: string; alt: string }`
  - `type ArtId = 'rag' | 'mcp' | 'plant' | 'slang'`
  - `interface Project { slug; title; tagline; status: Status; role; org; timeline; stack: string[]; team; cardSize: 'tall'|'medium'|'small'; art: ArtId; video?: { src: string; poster: string }; links: { label: string; href: string }[]; sections: Section[]; og: { title: string; description: string }; draft: boolean }`
  - `interface Role { org; title; start: string /* YYYY-MM */; end: string | null; kind: 'co-op'|'part-time'|'term'; summary; draft: boolean }`. Introhive appears as two `Role` entries.
  - `site: { name; headline; subline; statusChip; email; github; linkedin; resume: '/resume.pdf'; location: 'Fredericton, NB'; timezone: 'America/Moncton'; url: 'https://saranchotsuwan.com'; photo?: string; draft: boolean }`
  - `getProject(slug: string): Project | undefined`
  - `adjacentProjects(slug: string): { prev: Project; next: Project }` (wraps around)
  - `allContentItems(): { id: string; draft: boolean; text: string }[]` (flattened strings, for linting)

- [ ] **Step 1: Write the failing tests.** In `content.test.ts`:
  - `slugs are unique and url-safe`: `/^[a-z0-9-]+$/`.
  - `projects in order`: `['ask-introhive','plant-as-battery','slang-or-not','introhive-mcp']`, with statuses `shipped, in-progress, in-progress, shipped`.
  - `no internal Introhive identifiers`: for every item in `allContentItems()`, the text doesn't match `/\bIHS-\d+/` and no 1-3 word token n-gram hashes into the private denylist (hashes in `tests/unit/content.test.ts`).
  - `MCP role never claims building`: `getProject('introhive-mcp').role` matches `/test automation/i` and doesn't match `/\bbuilt the mcp\b/i`.
  - `fixed facts`:
    - `site.email === 'saran.chotsuwan000@gmail.com'`
    - `personal.total === 480`, and squat + bench + deadlift === total
    - `personal.bodyweight === 68`
    - the experience titles and dates equal the Global Constraints values
  - `adjacentProjects wraps`: prev of the first is the last.
- [ ] **Step 2:** Run `npm test` and confirm it fails.
- [ ] **Step 3:** Write the content.
  - Ask Introhive `sections` are paraphrased only from spec §5.1: overview, my role, what I built (platform features list), deletion pipeline, text-to-SQL quality, relationship trends, and stack.
  - Introhive MCP: one line on the product from the public page, then the testing approach and deletion coverage. The test-automation work is labelled in progress.
  - Plant as Battery and Slang-or-Not come from spec §5. Slang-or-Not links to its repo.
  - Mark all Claude-drafted copy `draft: true`.
  - List every draft item and missing asset in `CONTENT_TODO.md`: photo, real project media, Slang-or-Not results.
- [ ] **Step 4:** Run `npm test`. It should pass.
- [ ] **Step 5:** Commit with the message `feat: typed content model with safety lint`.

### Task 3: Theme

**Files:**
- Create: `src/lib/theme.tsx`, `src/components/cards/ThemeCard.tsx`
- Modify: `index.html` (inline script), `src/App.tsx`
- Test: `tests/unit/theme.test.tsx`

**Interfaces:**
- Produces:
  - `ThemeProvider`
  - `useTheme(): { theme: 'light'|'dark'; toggle(): void }`
  - `THEME_SCRIPT: string` (also inlined verbatim in `index.html`; a test asserts they're equal)
  - `ThemeToggle` (glass, `aria-pressed`, label "Toggle dark mode")

- [ ] **Step 1: Write the failing tests.**
  - `toggle adds .dark to documentElement and persists 'dark'`.
  - `falls back to matchMedia when localStorage.getItem throws` (Review Focus 4): stub `Storage.prototype.getItem` to throw and `matchMedia` to dark. Expect `.dark` to be present and no throw. Then run `new Function(THEME_SCRIPT)()` under the same stubs and expect no throw.
  - `index.html contains THEME_SCRIPT`: read the file with `fs`.
- [ ] **Step 2:** Run the tests and confirm they fail.
- [ ] **Step 3:** Implement. Wrap all storage access in try/catch.
- [ ] **Step 4:** Run the tests. They should pass.
- [ ] **Step 5:** Commit with the message `feat: theme provider with no-flash script`.

### Task 4: Router

**Files:**
- Create: `src/lib/router.tsx`
- Test: `tests/unit/router.test.tsx`

**Interfaces:**
- Produces:
  - `type Route = { name: 'home' } | { name: 'about' } | { name: 'project'; slug: string }`
  - `parsePath(path: string): Route` (unknown path → home; unknown slug → home)
  - `RouterProvider`
  - `useRoute(): Route`
  - `navigate(to: string, opts?: { replace?: boolean }): void`
  - `closeOverlay(): void`: calls `history.back()` only if the current entry was pushed in-app from home (tracked in `history.state.fromHome`), otherwise `navigate('/', { replace: true })`
  - `Link` component: renders `<a href>`. It intercepts plain left-clicks only; modifier and middle clicks pass through.

- [ ] **Step 1: Write the failing tests.**
  - `parsePath('/projects/slang-or-not')` → project.
  - `parsePath('/projects/nope')` and `parsePath('/foo')` → home (Review Focus 2).
  - `parsePath('/about/')` (trailing slash) → about.
  - `Link click pushes state and updates route`.
  - `ctrl+click is not intercepted`.
  - `closeOverlay after direct load replaces to /` (Review Focus 1): set `history.replaceState(null,'','/projects/ask-introhive')`, mount, call `closeOverlay()`, and expect `location.pathname === '/'` and `history.length` unchanged.
  - `closeOverlay after in-app open goes back`.
  - `popstate updates route`.
- [ ] **Step 2:** Run the tests and confirm they fail.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the tests. They should pass.
- [ ] **Step 5:** Commit with the message `feat: history api router`.

### Task 5: Glass components + bottom blur

**Files:**
- Create: `src/styles/glass.css`, `src/components/glass/GlassButton.tsx`, `GlassChip.tsx`
- Test: `tests/unit/glass.test.tsx`

**Interfaces:**
- Produces:
  - `GlassButton({ as?: 'button'|'a', href?, onClick?, icon?, children, tint?: 'default'|'accent' })`
  - `GlassChip({ status: Status, children? })`: dot color from the status tokens. Default label "Shipped" / "In progress".
  - The `.bottom-gradient-blur` class

- [ ] **Step 1: Write the failing tests.**
  - `GlassChip renders 'In progress' for in-progress`.
  - `glass.css pairs every backdrop-filter with -webkit-backdrop-filter and every mask-composite with -webkit-mask-composite`: read the file and compare regex match counts.
  - `glass.css registers @property --glass-angle-1 and --glass-angle-2`.
  - `glass.css has @supports not (backdrop-filter` fallback`.
  - `.bottom-gradient-blur has pointer-events: none`.
- [ ] **Step 2:** Run the tests and confirm they fail.
- [ ] **Step 3:** Implement the 4-layer structure (root/surface/content/shadow) per the blueprint §2.4.
- [ ] **Step 4:** Run the tests. They should pass.
- [ ] **Step 5:** Commit with the message `feat: liquid glass button and chip`.

### Task 6: Overlay shell

**Files:**
- Create: `src/components/overlay/Overlay.tsx`, `src/lib/motion.ts`
- Test: `tests/unit/overlay.test.tsx`

**Interfaces:**
- Consumes: `closeOverlay` (Task 4), `ThemeToggle` (Task 3)
- Produces:
  - `Overlay({ open: boolean; label: string; children })`: `role="dialog"`, `aria-modal="true"`, `aria-label={label}`, `data-lenis-prevent`, sticky top-right ThemeToggle + Close (`aria-label="Close"`). Esc closes, focus is trapped, focus returns to the opener on close, and `document.body.style.overflow='hidden'` is set while open.
  - `useLenis(): Lenis | null`: desktop only, null under reduced motion. It's stopped while any overlay is open (via a context flag).

- [ ] **Step 1: Write the failing tests.**
  - `Esc calls closeOverlay`.
  - `Tab from last focusable wraps to first`.
  - `body overflow restored on unmount`.
  - `focus returns to opener`.
- [ ] **Step 2:** Run the tests and confirm they fail.
- [ ] **Step 3:** Implement. Use `AnimatePresence`: a slide-up, or opacity only when `useReducedMotion()` is true.
- [ ] **Step 4:** Run the tests. They should pass.
- [ ] **Step 5:** Commit with the message `feat: accessible overlay shell`.

### Task 7: Home cards and widgets

**Files:**
- Create:
  - `src/components/cards/*` (Hero, ProjectCard, AboutMini, ExperienceMini, StackCard, ResumeBanner, PersonalityCard, CareerRuler, ClockCard)
  - `src/components/art/*` (Monogram, RagDiagram, McpDiagram, PlantLoop, SlangPair)
  - `src/lib/time.ts`, `src/lib/career.ts`
- Test: `tests/unit/time.test.ts`, `career.test.ts`, `hero.test.tsx`, `cards.test.tsx`

**Interfaces:**
- Consumes: content (Task 2), `Link` (Task 4), glass (Task 5)
- Produces:
  - `zonedParts(date: Date, tz: string): { h: number; m: number; s: number; label: string /* 'h:mm:ss AM' */; abbr: string /* 'AST'|'ADT' */ }`, using `Intl.DateTimeFormat`
  - `RULER_YEARS = [2023, 2024, 2025, 2026, 2027]`
  - `roleAt(year: number): Role | null`: the latest role starting on or before Dec of that year, null for 2023
  - `ProjectCard({ project })`: `<Link href="/projects/{slug}">`. Height comes from `cardSize` via aspect ratio or min-height, never fixed px.
  - `Hero`: headline with `aria-label={site.headline}`, decorative spans `aria-hidden`
  - The `art` components are original SVGs that use `currentColor` and tokens

- [ ] **Step 1: Write the failing tests.**
  - `zonedParts(new Date('2026-07-01T16:00:00Z'),'America/Moncton')` → `h 13`, `abbr 'ADT'`.
  - `zonedParts(new Date('2026-12-01T16:00:00Z'),'America/Moncton')` → `h 12`, `abbr 'AST'`.
  - `roleAt(2025).org === 'Introhive Services Inc.'`, `roleAt(2024).org === 'Sonrai Security Inc.'`, `roleAt(2023) === null`.
  - CareerRuler: `ArrowLeft moves to previous year, shows role, reveals 'Reset to present'`, and `role="slider"` with `aria-valuenow`.
  - Hero `Copy email writes to clipboard and shows 'Copied'`.
  - Hero `Copy email falls back to mailto when clipboard rejects` (Review Focus 3): `navigator.clipboard.writeText` rejects, or `navigator.clipboard` is undefined. Expect `window.location.href` set to `mailto:saran.chotsuwan000@gmail.com`.
  - Hero `Résumé button links /resume.pdf with target _blank rel noopener`.
  - `every project renders as a link to /projects/{slug}`.
  - `PersonalityCard shows 180, 100, 200, 480 kg and 68 kg`.
  - `ClockCard shows 'Fredericton, NB'`.
- [ ] **Step 2:** Run the tests and confirm they fail.
- [ ] **Step 3:** Implement. Clock: one `requestAnimationFrame`, or a 1s interval under reduced motion. Hand angles come from `zonedParts`. Hero hover color cycling is skipped under reduced motion.
- [ ] **Step 4:** Run the tests. They should pass.
- [ ] **Step 5:** Commit with the message `feat: home cards and widgets`.

### Task 8: Desktop grid + footer

**Files:**
- Create: `src/components/layout/DesktopGrid.tsx`, `Footer.tsx`
- Modify: `src/App.tsx`
- Test: `tests/unit/grid.test.tsx`

**Interfaces:**
- Consumes: Task 7 cards
- Produces: `DesktopGrid`, `hidden lg:grid lg:grid-cols-3 lg:gap-8` with max-w 1440 and `px-12`. Each column is `flex flex-col gap-8`, with the order from spec §8.1.

- [ ] **Step 1: Write the failing test.** `column 1 first child is Ask Introhive; column 2 first major block contains the hero heading`.
- [ ] **Step 2:** Run it and confirm it fails.
- [ ] **Step 3:** Implement. Column balance is tuned in Task 12.
- [ ] **Step 4:** Run the test. It should pass.
- [ ] **Step 5:** Commit with the message `feat: desktop bento grid`.

### Task 9: Case study + About overlays

**Files:**
- Create: `src/components/pages/CaseStudy.tsx`, `About.tsx`, `src/components/case/MetaStrip.tsx`, `SectionBlock.tsx`
- Modify: `src/App.tsx` (route → overlay)
- Test: `tests/unit/casestudy.test.tsx`

**Interfaces:**
- Consumes: `useRoute`, `Overlay`, `getProject`, `adjacentProjects`
- Produces: `CaseStudy({ project })` has:
  - a MetaStrip with labels `Org`, `My role`, `Timeline`, `Stack`, `Team`
  - `SectionBlock` for each `Section.kind`
  - Prev/Next `Link`s that use `replace`
  - `document.title = \`${project.title} — Saran Chotsuwan\``

- [ ] **Step 1: Write the failing tests.**
  - `route /projects/ask-introhive opens dialog labelled 'Ask Introhive'`.
  - `Next from introhive-mcp goes to ask-introhive`.
  - `each Section kind renders`, using a fixture.
  - `About shows all 4 roles in order newest first`.
  - `About shows photo when site.photo set, else Monogram`.
- [ ] **Step 2:** Run the tests and confirm they fail.
- [ ] **Step 3:** Implement. The hero media is up to 1100px wide and the text column up to 860px.
- [ ] **Step 4:** Run the tests. They should pass.
- [ ] **Step 5:** Commit with the message `feat: case study and about overlays`.

### Task 10: Mobile home + dock

**Files:**
- Create: `src/components/layout/MobileHome.tsx`, `MobileDock.tsx`
- Modify: `src/App.tsx`
- Test: `tests/unit/mobile.test.tsx`

**Interfaces:**
- Produces:
  - `MobileHome` (`lg:hidden`): sections `#m-home`, `#m-projects`, `#m-about`, `#m-contact` in the order from spec §8.2.
  - `MobileDock`: `fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]` with 4 buttons labelled Home/Projects/About/Contact and `aria-current` driven by IntersectionObserver. The bottom blur sits at `z-40`.

- [ ] **Step 1: Write the failing tests.**
  - `dock has 4 labelled buttons`.
  - `intersecting #m-about sets aria-current on About`: mock IntersectionObserver.
  - `clicking Projects scrolls #m-projects into view`.
- [ ] **Step 2:** Run the tests and confirm they fail.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the tests. They should pass.
- [ ] **Step 5:** Commit with the message `feat: mobile layout and dock`.

### Task 11: Build output — per-route HTML, OG, SEO, draft guard, Vercel

**Files:**
- Create: `scripts/postbuild.ts`, `scripts/og.tsx`, `vercel.json`
- Test: `tests/unit/postbuild.test.ts`

**Interfaces:**
- Consumes: `projects`, `site`, `allContentItems`
- Produces:
  - `renderRouteHtml(template: string, meta: { title; description; url; image }): string`
  - `runPostbuild(distDir: string, opts: { production: boolean }): Promise<void>`. It writes:
    - `dist/projects/<slug>/index.html`
    - `dist/about/index.html`
    - `dist/404.html` (with `<meta name="robots" content="noindex">`)
    - `sitemap.xml` (`/`, `/about`, 4 project URLs on `https://saranchotsuwan.com`)
    - `robots.txt`
    - `public/og/<slug>.png` and `home.png`, 1200×630, generated by `og.tsx`
  - It throws `Draft content in production build: <ids>` when `production` is true and any item is draft. `production` = `process.env.VERCEL_ENV === 'production'`.

- [ ] **Step 1: Write the failing tests.**
  - `renderRouteHtml replaces <title>, meta description, canonical, og:title, og:description, og:url, og:image, twitter:card summary_large_image`.
  - `runPostbuild writes 4 project files + about + 404 + sitemap`: use a temp dir with a fake index.html.
  - `404.html has noindex`.
  - `throws listing draft ids when production and drafts exist; succeeds when production false`.
  - `vercel.json rewrites non-file paths to /index.html`: parse the JSON and assert `{ source: '/((?!.*\\.).*)', destination: '/index.html' }`.
- [ ] **Step 2:** Run the tests and confirm they fail.
- [ ] **Step 3:** Implement. Add home JSON-LD (`Person` + `ProfilePage` only) to `index.html`.
- [ ] **Step 4:** Run `npm test && npm run build`, then `ls dist/projects/*/index.html`. Expect 4 files.
- [ ] **Step 5:** Commit with the message `feat: per-route html, og images, seo, draft guard`.

### Task 12: Motion polish, layout balance, end-to-end verification

**Files:**
- Modify: card and grid components as needed
- Create: `tests/e2e/routes.spec.ts`, `layout.spec.ts`, `a11y.spec.ts`

**Interfaces:**
- Consumes: everything above

- [ ] **Step 1:** Add the `motion` in-view fade/raise on cards (off under reduced motion) and wire up Lenis on desktop.
- [ ] **Step 2: Write the e2e tests.** Each runs in Chromium and WebKit.
  - `routes`:
    - Direct load of each `/projects/<slug>` shows the dialog. Close lands on `/` (Review Focus 1).
    - `/projects/nope` shows home with no dialog.
    - Opening from the grid then pressing browser Back closes it, and Forward reopens it.
    - Fetching `/projects/ask-introhive` returns HTML whose `og:title` contains "Ask Introhive".
  - `layout`: at 390×844, 768×1024, 1024×768, 1152×800, 1280×800 and 1440×900, in light and dark:
    - `document.documentElement.scrollWidth <= innerWidth` (Review Focus 5)
    - no card has `scrollHeight > clientHeight + 1` on its text container
    - at 1280 and 1440, the column bottoms are within 24px of each other
    - take a screenshot into `test-results/`
  - `a11y`: axe on `/` and `/projects/ask-introhive` in both themes, with 0 serious/critical violations. With `reducedMotion: 'reduce'`, `html` lacks the `lenis` class.
- [ ] **Step 3:** Run `npm run e2e` and fix failures until everything passes. Review the screenshots by eye.
- [ ] **Step 4:** Run Lighthouse (`npx lighthouse http://localhost:4173 --preset=desktop` and the mobile default). Expect Performance ≥ 90 and Accessibility ≥ 95.
- [ ] **Step 5:** Run `npm run lint && npx tsc -b`. Expect them to be clean.
- [ ] **Step 6:** Commit with the message `test: e2e routes, layout, a11y; motion polish`.

### Task 13: Ship to preview

Needs Saran first: an empty `schotsuw/portfolio-new` repo, attached with push access, and the Vercel project connected to it.

- [ ] **Step 1:** Add the remote, push `main`, and confirm the Vercel preview deploy succeeds.
- [ ] **Step 2:** On the preview URL, run the route checks from Task 12 against the live host. A direct `/projects/slang-or-not` load must return 200.
- [ ] **Step 3:** Hand Saran the preview link and `CONTENT_TODO.md`. Production (saranchotsuwan.com) is promoted only after he clears the drafts. The draft guard enforces this.
