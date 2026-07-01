# attestto.com

Marketing site for Attestto Inc. Built with [Astro](https://astro.build) v5.

**Live:** https://attestto.com

## Stack

- **Astro 5** — static site generator, content collections
- **IBM Plex** — Sans + Serif + Mono, self-hosted via `@fontsource/*`
- **Design tokens** — CSS custom properties in `src/styles/tokens.css`
- **Light default, dark first-class** — respects `prefers-color-scheme`
- **Deploy** — GitHub Actions to GitHub Pages, custom domain `attestto.com` via CNAME

## Local development

```bash
pnpm install
pnpm dev
```

Site runs at http://localhost:4321.

Drafts (`draft: true` in blog frontmatter) are visible in dev but hidden in production builds.

## Build

```bash
pnpm build      # produces dist/
pnpm preview    # serves dist/ locally
```

## Quality check

Every deploy runs a quality check that enforces:

- **Semantic HTML** — `<html lang>`, `<main>` landmark, skip link, `<title>`
- **SEO metadata** — meta description length, OG tags, Twitter card, canonical, hreflang
- **Structured data** — Organization + WebSite schemas everywhere; FAQPage + SoftwareApplication on home; BlogPosting + BreadcrumbList on posts
- **AI/GEO discovery** — `llms.txt`, `robots.txt` with per-agent allows (GPTBot / ClaudeBot / PerplexityBot / Google-Extended / Applebot-Extended), sitemap
- **Content discipline** — no em-dashes in public content, no "self-sovereign" / "SSI" phrases, correct "Attestto" spelling (grep-check for common misses like "Attesto")
- **Governance** — no old EEZZEER LEI leaking through
- **Accessibility** — every `<img>` has `alt` attribute

```bash
pnpm check          # builds, then runs quality check (blocks on errors)
pnpm check:only     # runs against existing dist/ without rebuilding
```

CI runs the same check before deploying to Pages — a failing check blocks deployment. To add new checks, edit `scripts/check-quality.mjs`.

## Structure

```
attestto.com/
├── public/                 static assets served as-is (CNAME, favicons, og-image, robots.txt)
├── src/
│   ├── components/         reusable Astro components (Header, Footer)
│   ├── content/
│   │   ├── config.ts       content collection schemas (blog)
│   │   └── blog/           blog posts as .md files
│   ├── layouts/            BaseLayout + BlogLayout
│   ├── pages/              file-based routing
│   │   ├── index.astro        home
│   │   ├── personas.astro     citizen (Spanish primary, Web2 UX only)
│   │   ├── firma-digital.astro  regulated buyer (full technical vocab)
│   │   ├── empresa.astro
│   │   ├── 404.astro
│   │   └── blog/
│   │       ├── index.astro
│   │       └── [...slug].astro
│   └── styles/             tokens.css + global.css
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Design system reference

- **Wireframes source of truth:** first-pass design 2026-07-01 (see `~/Attestto/2-marketing/attestto-com-redesign-2026-07/` if archived)
- **Color palette:** navy `#0f172a`, action blue `#2563eb`, verified green `#15803d`, slate neutrals
- **Type:** IBM Plex — Sans for UI, Serif for hero display + blog body, Mono for identifiers and code
- **CTA rule:** blue only for CTAs, green ONLY for verified state (never generic success)
- **Copy rules:** no em-dashes, no self-sovereign / SSI, Bóveda in ES / Vault in EN, Attestto with double-t twice

## Content workflow

1. Draft blog posts in `src/content/blog/<slug>.md` with `draft: true`
2. Local review via `pnpm dev`
3. Cori editorial pass (during onboarding override: Eduardo + Claude draft, Cori reviews)
4. Eduardo signs off, flip `draft: false`
5. Push to `main` → GitHub Actions builds and deploys

## Deployment

GitHub Actions workflow at `.github/workflows/deploy.yml` builds on push to `main` and deploys to GitHub Pages.

**One-time setup required in repo settings:** switch Pages source to "GitHub Actions".

The `public/CNAME` file preserves the custom `attestto.com` domain across builds.

## Related

- [attestto.org](https://github.com/Attestto-com/attestto.org) — open governance / standards-body voice (deprecating blog)
- [spec.attestto.com](https://spec.attestto.com/) — public technical specifications (did-pki, did-sns, ieal)
- [attestto-app](https://github.com/Attestto-com/attestto-app) — citizen web wallet (linked as CTA target)

## License

Content: proprietary, © Attestto Inc.
Code: internal, not licensed publicly.
