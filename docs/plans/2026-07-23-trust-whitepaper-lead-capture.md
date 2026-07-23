# Trust Whitepaper + Lead Capture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the trust whitepaper as an ungated EN + ES page on attestto.com and capture opt-in leads through a shared Buttondown subscribe form in the global footer and on the whitepaper page, tagged per placement.

**Architecture:** Reuse the existing Astro content-collection + layout pattern (as the blog does). A new `whitepaper` collection holds the markdown; a `WhitepaperLayout` renders it with a PDF download and a full subscribe form; a shared `SubscribeForm.astro` posts directly to Buttondown's embed endpoint (no backend) and is also dropped into the site-wide `Footer.astro`. SEO comes from a `TechArticle` JSON-LD block and proper EN↔ES hreflang pairing via a small backward-compatible `alternates` prop on `BaseLayout`.

**Tech Stack:** Astro 5, Astro content collections, plain HTML forms, Buttondown (embed endpoint), design-token CSS. No backend, no new dependencies.

## Verification approach (READ FIRST — this repo has no unit-test runner)

This is a static content site. There is **no vitest/jest**. Do **not** add a test framework. The verification harness for every task is:

- **Build + quality gate:** `npm run check` — runs `astro build` then `node scripts/check-quality.mjs`. The quality gate (exit 1 on error) enforces: `<html lang>`, `<main>`, `<title>`, meta description, OG/Twitter tags, canonical link, no em-dashes (warn), correct "Attestto" spelling (error), no old EEZZEER LEI, images have `alt`. It runs against `dist/`.
- **Targeted assertions:** after a successful build, grep the generated files under `dist/` to confirm task-specific output (form `action`, hidden `tag`, JSON-LD `@type`, PDF link, hreflang hrefs). Exact `grep` commands are given per task.
- **Manual (final only):** one real end-to-end subscribe against Buttondown staging to confirm the tag lands.

`npm run check` builds into `dist/`. All grep assertions below run against `dist/`.

## Global Constraints (apply to every task)

- **Brand spelling:** "Attestto" (double-t) everywhere. The quality gate errors on "Attesto".
- **No em-dashes** in any public-facing copy (quality gate warns; treat as must-fix). Use commas/colons.
- **Clean URLs**, no query-string PII. Astro `build.format: 'directory'` is already set.
- **i18n = Spanish-slug routes**, no `/es/` prefix. EN slug for EN, ES slug for ES (convention: `products/` ↔ `productos/`).
- **Design tokens only.** Available tokens: `--color-accent` (#1e40af), `--color-dark` (#0f172a), `--color-dark-border` (rgba(255,255,255,0.08)), `--radius-md` (0.5rem), `--space-sm` (1rem), `--space-3` (0.75rem), `--text-small-size` (0.9375rem), `--text-muted`, `--font-mono`. No hardcoded hex except inside `SubscribeForm.astro`'s own fallbacks (`var(--token, fallback)` form).
- **Privacy discipline:** consent checkbox `required`; visible "we never sell your data" line; double opt-in is configured in Buttondown (not code).
- **Progressive enhancement:** the form must work as a plain HTML POST with JS disabled. JS only adds an inline success state.
- **Buttondown endpoint:** `https://buttondown.com/api/emails/embed/subscribe/attestto`. This exact URL and the field names MUST be confirmed against Buttondown → "Set up your subscribe form" before launch (Buttondown has used both `buttondown.email` and `buttondown.com` hosts). It is marked in code with a `CONFIRM:` comment.
- **User-provided build-time inputs** (scaffold with clearly-marked placeholders; do NOT invent final copy): final EN/ES whitepaper markdown body, the two PDFs, the OG image (optional; falls back to `/og-image.png`).

---

### Task 1: Whitepaper content collection + placeholder entries

**Files:**
- Modify: `src/content/config.ts`
- Create: `src/content/whitepaper/root-of-digital-trust.md`
- Create: `src/content/whitepaper/raiz-de-la-confianza-digital.md`

**Interfaces:**
- Produces: a `whitepaper` collection with entry `data` shape `{ title: string; description: string; publishDate: Date; lang: 'en'|'es'; pdf: string; altHref: string; ogImage?: string; canonicalUrl?: string; draft: boolean }`, and two entries with slugs `root-of-digital-trust` and `raiz-de-la-confianza-digital`. Consumed by Tasks 3.

- [ ] **Step 1: Add the `whitepaper` collection to the content config**

Edit `src/content/config.ts` so it defines and exports the new collection alongside `blog`:

```ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    author: z.string().default('Attestto'),
    tags: z.array(z.string()).default([]),
    canonicalUrl: z.string().url().optional(),
    lang: z.enum(['en', 'es']).default('en'),
    draft: z.boolean().default(false),
    heroImage: z.string().optional(),
  }),
});

const whitepaper = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    lang: z.enum(['en', 'es']).default('en'),
    // Absolute path to the self-hosted PDF in public/. User-provided file.
    pdf: z.string(),
    // Absolute path of the other-language version of this whitepaper, for hreflang.
    altHref: z.string(),
    ogImage: z.string().optional(),
    canonicalUrl: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, whitepaper };
```

- [ ] **Step 2: Create the EN placeholder entry**

Create `src/content/whitepaper/root-of-digital-trust.md`. The body is a **placeholder clearly marked for user fill-in** — do not write final marketing copy:

```md
---
title: 'The Root of Digital Trust'
description: 'Why verifying a foreign digital signature is still hard, and how a public mirror of national PKI trust anchors resolves it.'
publishDate: 2026-07-23
lang: 'en'
pdf: '/whitepaper/root-of-digital-trust.pdf'
altHref: '/documentos/raiz-de-la-confianza-digital'
draft: false
---

<!-- USER-PROVIDED: replace this body with the final English whitepaper copy.
     Keep the double-t "Attestto" spelling and no em-dashes. -->

Placeholder body. The final English whitepaper text goes here.
```

- [ ] **Step 3: Create the ES placeholder entry**

Create `src/content/whitepaper/raiz-de-la-confianza-digital.md`:

```md
---
title: 'La raíz de la confianza digital'
description: 'Por qué verificar una firma digital extranjera sigue siendo difícil, y cómo un espejo público de anclas de confianza PKI nacionales lo resuelve.'
publishDate: 2026-07-23
lang: 'es'
pdf: '/whitepaper/raiz-de-la-confianza-digital.pdf'
altHref: '/whitepaper/root-of-digital-trust'
draft: false
---

<!-- USER-PROVIDED: replace this body with the final Spanish whitepaper copy.
     Keep the double-t "Attestto" spelling and no em-dashes. -->

Cuerpo de marcador de posición. El texto final del whitepaper en español va aquí.
```

- [ ] **Step 4: Verify the collection compiles**

Run: `npm run build`
Expected: build succeeds with no schema errors. The whitepaper entries are not yet routed (no pages), so they only need to type-check and compile.

- [ ] **Step 5: Commit**

```bash
git add src/content/config.ts src/content/whitepaper/root-of-digital-trust.md src/content/whitepaper/raiz-de-la-confianza-digital.md
git commit -m "feat(whitepaper): add whitepaper content collection with EN/ES placeholder entries"
```

---

### Task 2: SubscribeForm component + global footer integration

**Files:**
- Create: `src/components/SubscribeForm.astro`
- Modify: `src/components/Footer.astro`
- Test: build + grep `dist/index.html` (EN footer) and `dist/personas/index.html` (an existing ES page for the ES footer)

**Interfaces:**
- Produces: `<SubscribeForm lang?: 'en'|'es' source: string variant?: 'compact'|'full' />`. `source` becomes the Buttondown `tag` hidden field. Consumed by `Footer.astro` (this task, `variant="compact"`) and `WhitepaperLayout.astro` (Task 3, `variant="full"`).
- Consumes: nothing from earlier tasks.

- [ ] **Step 1: Create the shared SubscribeForm component**

Create `src/components/SubscribeForm.astro`:

```astro
---
/**
 * <SubscribeForm> — consent-based email opt-in that posts directly to Buttondown's
 * embed endpoint. No backend. Works as a plain HTML POST; JS only adds an inline
 * success state. `source` is attached as the Buttondown `tag` so each placement
 * (footer, whitepaper EN, whitepaper ES) is attributable in the Buttondown dashboard.
 */
interface Props {
  lang?: 'en' | 'es';
  source: string;
  variant?: 'compact' | 'full';
}

const { lang = 'en', source, variant = 'compact' } = Astro.props;

// CONFIRM before launch against Buttondown -> "Set up your subscribe form" snippet.
// Buttondown has used both buttondown.email and buttondown.com hosts.
const ACTION = 'https://buttondown.com/api/emails/embed/subscribe/attestto';

const copy = {
  en: {
    heading: variant === 'compact' ? 'Follow the trust directory' : 'Get notified as the directory grows',
    subtext: 'New countries, PKI trust anchors, and did:pki resolution, as they ship. No spam, and we never sell your data.',
    consent: 'Notify me when new countries are added to the directory.',
    placeholder: 'you@example.com',
    button: 'Subscribe',
    privacy: 'We never sell your data.',
    confirm: 'Check your inbox to confirm your subscription.',
  },
  es: {
    heading: variant === 'compact' ? 'Sigue el directorio de confianza' : 'Recibe avisos cuando el directorio crece',
    subtext: 'Nuevos países, anclas de confianza PKI y resolución did:pki, conforme se publican. Sin spam, y nunca vendemos tus datos.',
    consent: 'Avísame cuando se agreguen nuevos países al directorio.',
    placeholder: 'tu@ejemplo.com',
    button: 'Suscribirme',
    privacy: 'Nunca vendemos tus datos.',
    confirm: 'Revisa tu correo para confirmar tu suscripción.',
  },
}[lang];

const fieldId = `sub-email-${source}`;
---
<form class:list={['subscribe', `subscribe--${variant}`]} action={ACTION} method="post" data-confirm={copy.confirm}>
  <div class="subscribe__intro">
    <p class="subscribe__heading">{copy.heading}</p>
    {variant === 'full' && <p class="subscribe__subtext">{copy.subtext}</p>}
  </div>
  <div class="subscribe__row">
    <label class="visually-hidden" for={fieldId}>{copy.placeholder}</label>
    <input id={fieldId} class="subscribe__email" type="email" name="email" required placeholder={copy.placeholder} autocomplete="email" />
    <input type="hidden" name="tag" value={source} />
    <input type="hidden" name="embed" value="1" />
    <button class="subscribe__button" type="submit">{copy.button}</button>
  </div>
  <label class="subscribe__consent">
    <input type="checkbox" name="consent" required />
    <span>{copy.consent} <span class="subscribe__privacy">{copy.privacy}</span></span>
  </label>
</form>

<script>
  // Progressive enhancement: keep the user on the page. Falls back to native POST.
  document.querySelectorAll('form.subscribe').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('.subscribe__button');
      if (button) button.setAttribute('disabled', 'true');
      try {
        await fetch(form.action, { method: 'POST', body: new FormData(form), mode: 'no-cors' });
        const confirm = form.getAttribute('data-confirm') || 'Check your inbox to confirm.';
        form.innerHTML = `<p class="subscribe__heading">${confirm}</p>`;
      } catch {
        // Network failed: let the native form flow take over.
        form.submit();
      }
    });
  });
</script>

<style>
  .subscribe { display: flex; flex-direction: column; gap: var(--space-3); }
  .subscribe__heading { color: rgba(255, 255, 255, 0.85); font-weight: 600; margin: 0; }
  .subscribe__subtext { color: rgba(255, 255, 255, 0.6); margin: 0; font-size: var(--text-small-size); }
  .subscribe__row { display: flex; gap: var(--space-3); flex-wrap: wrap; }
  .subscribe__email {
    flex: 1 1 16rem;
    padding: 0.6rem 0.75rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--color-dark-border, rgba(255, 255, 255, 0.15));
    border-radius: var(--radius-md, 0.5rem);
    color: #fff;
  }
  .subscribe__email:focus-visible { outline: 2px solid var(--color-accent, #1e40af); outline-offset: 1px; }
  .subscribe__button {
    padding: 0.6rem 1.1rem;
    border: 0;
    border-radius: var(--radius-md, 0.5rem);
    background: var(--color-accent, #1e40af);
    color: #fff;
    font-weight: 600;
    cursor: pointer;
  }
  .subscribe__button:hover { filter: brightness(1.12); }
  .subscribe__consent {
    display: flex;
    gap: var(--space-3);
    align-items: flex-start;
    color: rgba(255, 255, 255, 0.6);
    font-size: var(--text-small-size);
  }
  .subscribe__privacy { color: rgba(255, 255, 255, 0.78); }
  .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  @media (max-width: 600px) { .subscribe__row { flex-direction: column; } }
</style>
```

- [ ] **Step 2: Add the compact form to the footer**

Modify `src/components/Footer.astro`. Import the component and render it inside `.footer-inner` (before `.footer-links`), passing the footer's `lang` and a fixed `source="footer"`.

Change the frontmatter import block to add:

```astro
import SubscribeForm from './SubscribeForm.astro';
```

Change the footer markup so `.footer-inner` includes the form. Replace the existing `.footer-inner` block with:

```astro
  <div class="container footer-inner">
    <div class="footer-brand">
      <span class="brand-name">Attestto</span>
      <LEIBadge />
    </div>

    <div class="footer-subscribe">
      <SubscribeForm lang={lang} source="footer" variant="compact" />
    </div>

    <div class="footer-links">
      {links.map((l) => (
        <a href={l.href} {...(l.external ? { rel: 'noopener', target: '_blank' } : {})}>{l.label}</a>
      ))}
    </div>
  </div>
```

Add to the footer `<style>` block (keeps the form from stretching the whole row on wide screens):

```css
  .footer-subscribe { flex: 1 1 22rem; max-width: 30rem; }
```

- [ ] **Step 3: Build and verify the footer form renders in both languages**

Run: `npm run check`
Expected: build succeeds; quality gate exits 0 (no new errors). Then assert the form is present with the correct action, tag, consent, and privacy line:

```bash
grep -o 'api/emails/embed/subscribe/attestto' dist/index.html | head -1
grep -o 'name="tag" value="footer"' dist/index.html | head -1
grep -o 'type="checkbox" name="consent" required' dist/index.html | head -1
grep -o 'We never sell your data.' dist/index.html | head -1
# ES footer copy on an existing Spanish page:
grep -o 'Nunca vendemos tus datos.' dist/empresa/index.html | head -1
```
Expected: each grep prints its match (non-empty). The last confirms the ES page's footer rendered Spanish copy (proves `lang` passthrough works).

- [ ] **Step 4: Commit**

```bash
git add src/components/SubscribeForm.astro src/components/Footer.astro
git commit -m "feat(subscribe): shared Buttondown SubscribeForm + global footer opt-in"
```

---

### Task 3: Whitepaper layout, routes, and SEO

**Files:**
- Modify: `src/layouts/BaseLayout.astro` (add backward-compatible `alternates` prop for hreflang; add breadcrumb segment labels)
- Create: `src/layouts/WhitepaperLayout.astro`
- Create: `src/pages/whitepaper/root-of-digital-trust.astro`
- Create: `src/pages/documentos/raiz-de-la-confianza-digital.astro`
- Test: build + grep the two generated whitepaper pages

**Interfaces:**
- Consumes: the `whitepaper` collection entries from Task 1 (`data.title`, `data.description`, `data.publishDate`, `data.lang`, `data.pdf`, `data.altHref`, `data.ogImage`, `data.canonicalUrl`); `SubscribeForm` from Task 2.
- Produces: two routed pages at `/whitepaper/root-of-digital-trust` and `/documentos/raiz-de-la-confianza-digital`, each with a `TechArticle` JSON-LD block, hreflang EN↔ES pairing, a PDF download button, and a full subscribe form tagged per language.

- [ ] **Step 1: Add a backward-compatible `alternates` prop to BaseLayout**

`BaseLayout` currently points all three hreflang links at `canonical` (self-referencing). Add an optional `alternates` prop so a page can supply the real EN/ES URLs; when omitted, behavior is unchanged for every existing page.

In `src/layouts/BaseLayout.astro`, add to the `Props` interface (near the other optional props):

```ts
  /** Absolute or site-relative URLs of the language alternates for hreflang. */
  alternates?: { en?: string; es?: string };
```

Add `alternates` to the destructured props:

```ts
const {
  title,
  description,
  canonical = new URL(Astro.url.pathname, Astro.site ?? 'https://attestto.com').href,
  ogImage = '/og-image.png',
  lang = 'en',
  darkHero = false,
  jsonLd,
  breadcrumbs,
  alternates,
} = Astro.props;
```

Just before the `<head>`/return markup (with the other derived consts), add resolution of the alternate hrefs (fall back to `canonical` to preserve current behavior):

```ts
const siteOrigin = Astro.site ?? new URL('https://attestto.com');
const toAbs = (href?: string) => (href ? new URL(href, siteOrigin).href : canonical);
const hrefEn = toAbs(alternates?.en);
const hrefEs = toAbs(alternates?.es);
```

Replace the three existing hreflang `<link>` lines:

```astro
  <link rel="alternate" hreflang="en" href={canonical} />
  <link rel="alternate" hreflang="es" href={canonical} />
  <link rel="alternate" hreflang="x-default" href={canonical} />
```

with:

```astro
  <link rel="alternate" hreflang="en" href={hrefEn} />
  <link rel="alternate" hreflang="es" href={hrefEs} />
  <link rel="alternate" hreflang="x-default" href={hrefEn} />
```

- [ ] **Step 2: Add whitepaper breadcrumb segment labels**

In the same file, extend the `SEG_LABELS` map so the breadcrumb trail names the new path segments instead of showing raw slugs:

```ts
const SEG_LABELS: Record<string, string> = {
  products: 'Products',
  productos: 'Productos',
  blog: 'Blog',
  whitepaper: 'Whitepaper',
  documentos: 'Documentos',
};
```

- [ ] **Step 3: Create WhitepaperLayout**

Create `src/layouts/WhitepaperLayout.astro`. It mirrors `BlogLayout`'s use of `BaseLayout`, emits `TechArticle` + `BreadcrumbList` JSON-LD, passes `alternates`, renders a PDF download button, the article body via `<slot />`, and a full `SubscribeForm`.

```astro
---
import BaseLayout from './BaseLayout.astro';
import SubscribeForm from '../components/SubscribeForm.astro';
import type { CollectionEntry } from 'astro:content';

interface Props {
  entry: CollectionEntry<'whitepaper'>;
}

const { entry } = Astro.props;
const { data } = entry;

const canonicalHref = data.canonicalUrl ?? new URL(Astro.url.pathname, Astro.site ?? 'https://attestto.com').href;
const isEs = data.lang === 'es';

// hreflang pair: EN page + its ES alternate (data.altHref points to the other language).
const alternates = isEs
  ? { es: Astro.url.pathname, en: data.altHref }
  : { en: Astro.url.pathname, es: data.altHref };

// Per-language Buttondown tag so the whitepaper's captures are attributable.
const source = isEs ? 'whitepaper-trust-root-es' : 'whitepaper-trust-root';

const techArticleLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: data.title,
  description: data.description,
  inLanguage: isEs ? 'es-CR' : 'en-US',
  datePublished: data.publishDate.toISOString(),
  author: { '@type': 'Organization', name: 'Attestto', url: 'https://attestto.com' },
  publisher: {
    '@type': 'Organization',
    name: 'Attestto',
    logo: { '@type': 'ImageObject', url: 'https://attestto.com/logo.svg' },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalHref },
  isAccessibleForFree: true,
};

const homeName = isEs ? 'Inicio' : 'Home';
const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: homeName, item: 'https://attestto.com/' },
    { '@type': 'ListItem', position: 2, name: data.title },
  ],
};

const pdfLabel = isEs ? 'Descargar PDF' : 'Download PDF';
const fmtDate = new Intl.DateTimeFormat(isEs ? 'es-CR' : 'en-US', {
  year: 'numeric', month: 'long', day: 'numeric',
});
---
<BaseLayout
  title={data.title}
  description={data.description}
  canonical={data.canonicalUrl}
  ogImage={data.ogImage}
  lang={data.lang}
  alternates={alternates}
  jsonLd={[techArticleLd, breadcrumbLd]}
>
  <article class="whitepaper">
    <div class="container">
      <header class="wp-header">
        <p class="wp-eyebrow">{isEs ? 'Whitepaper técnico' : 'Technical whitepaper'}</p>
        <h1>{data.title}</h1>
        <p class="wp-summary">{data.description}</p>
        <div class="wp-meta small muted">
          <time datetime={data.publishDate.toISOString()}>{fmtDate.format(data.publishDate)}</time>
        </div>
        <a class="wp-download" href={data.pdf} download>{pdfLabel}</a>
      </header>

      <div class="wp-body body-serif">
        <slot />
      </div>

      <aside class="wp-subscribe">
        <SubscribeForm lang={data.lang} source={source} variant="full" />
      </aside>
    </div>
  </article>
</BaseLayout>

<style>
  .whitepaper { padding-block: var(--space-xl); }
  .wp-header { max-width: 680px; margin: 0 auto var(--space-12); display: flex; flex-direction: column; gap: var(--space-4); }
  .wp-eyebrow { font-family: var(--font-mono); font-size: var(--text-small-size); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
  .wp-summary { color: var(--text-muted); }
  .wp-download {
    align-self: flex-start;
    padding: 0.6rem 1.1rem;
    border-radius: var(--radius-md, 0.5rem);
    background: var(--color-accent, #1e40af);
    color: #fff;
    font-weight: 600;
    text-decoration: none;
  }
  .wp-download:hover { filter: brightness(1.12); }
  .wp-body { max-width: 680px; margin: 0 auto; }
  .wp-subscribe {
    max-width: 680px;
    margin: var(--space-12) auto 0;
    padding: var(--space-sm);
    background: var(--color-dark, #0f172a);
    border: 1px solid var(--color-dark-border, rgba(255, 255, 255, 0.08));
    border-radius: var(--radius-lg, 0.75rem);
  }
</style>
```

- [ ] **Step 4: Create the EN route page**

Create `src/pages/whitepaper/root-of-digital-trust.astro`:

```astro
---
import { getEntry } from 'astro:content';
import WhitepaperLayout from '../../layouts/WhitepaperLayout.astro';

const entry = await getEntry('whitepaper', 'root-of-digital-trust');
const { Content } = await entry.render();
---
<WhitepaperLayout entry={entry}>
  <Content />
</WhitepaperLayout>
```

- [ ] **Step 5: Create the ES route page**

Create `src/pages/documentos/raiz-de-la-confianza-digital.astro`:

```astro
---
import { getEntry } from 'astro:content';
import WhitepaperLayout from '../../layouts/WhitepaperLayout.astro';

const entry = await getEntry('whitepaper', 'raiz-de-la-confianza-digital');
const { Content } = await entry.render();
---
<WhitepaperLayout entry={entry}>
  <Content />
</WhitepaperLayout>
```

- [ ] **Step 6: Build and verify both pages, SEO, and the tagged forms**

Run: `npm run check`
Expected: build succeeds; quality gate exits 0.

Then assert the generated output:

```bash
# Pages exist at the clean directory URLs:
test -f dist/whitepaper/root-of-digital-trust/index.html && echo EN_PAGE_OK
test -f dist/documentos/raiz-de-la-confianza-digital/index.html && echo ES_PAGE_OK
# TechArticle JSON-LD present on both:
grep -o '"@type":"TechArticle"' dist/whitepaper/root-of-digital-trust/index.html | head -1
grep -o '"@type":"TechArticle"' dist/documentos/raiz-de-la-confianza-digital/index.html | head -1
# PDF download link present:
grep -o 'href="/whitepaper/root-of-digital-trust.pdf" download' dist/whitepaper/root-of-digital-trust/index.html | head -1
# Full form tagged per language:
grep -o 'name="tag" value="whitepaper-trust-root"' dist/whitepaper/root-of-digital-trust/index.html | head -1
grep -o 'name="tag" value="whitepaper-trust-root-es"' dist/documentos/raiz-de-la-confianza-digital/index.html | head -1
# hreflang points EN and ES at the real alternate URLs (not self on both):
grep -o 'hreflang="es" href="[^"]*raiz-de-la-confianza-digital[^"]*"' dist/whitepaper/root-of-digital-trust/index.html | head -1
grep -o 'hreflang="en" href="[^"]*root-of-digital-trust[^"]*"' dist/documentos/raiz-de-la-confianza-digital/index.html | head -1
```
Expected: `EN_PAGE_OK`, `ES_PAGE_OK`, and each grep prints a non-empty match.

- [ ] **Step 7: Verify existing pages still pass (regression on the hreflang change)**

Run:
```bash
grep -o 'hreflang="en" href="[^"]*"' dist/empresa/index.html | head -1
```
Expected: prints a match (an existing page still emits hreflang; since it passes no `alternates`, the href falls back to its own canonical, exactly as before).

- [ ] **Step 8: Commit**

```bash
git add src/layouts/BaseLayout.astro src/layouts/WhitepaperLayout.astro src/pages/whitepaper/root-of-digital-trust.astro src/pages/documentos/raiz-de-la-confianza-digital.astro
git commit -m "feat(whitepaper): EN/ES routes, WhitepaperLayout, TechArticle JSON-LD + hreflang pairing"
```

---

## Post-implementation (user-provided inputs, not code tasks)

These are done by the user before the page goes live; they are not implementation steps:

1. Replace the two placeholder markdown bodies with the final EN/ES whitepaper copy (double-t "Attestto", no em-dashes; the quality gate enforces both).
2. Drop the two PDFs into `public/whitepaper/` as `root-of-digital-trust.pdf` and `raiz-de-la-confianza-digital.pdf`.
3. Confirm the Buttondown embed `action` URL + field names against Buttondown → "Set up your subscribe form" and update the `CONFIRM:` line in `SubscribeForm.astro` if different.
4. In Buttondown: enable double opt-in, authenticate the sending domain (SPF/DKIM/DMARC), set the tint to `#1e40af` and upload the "tt" logo.
5. Do one real end-to-end subscribe on the deployed page and confirm the `tag` lands on the subscriber in Buttondown.

## Self-Review

- **Spec coverage:** page + PDF (Task 3), ungated (no gating anywhere), Buttondown embed form (Task 2), consent + privacy line (Task 2), per-page tags (Task 2 footer, Task 3 pages), global footer + full page form (Tasks 2/3), content collection (Task 1), Spanish-slug routes (Task 3), SEO canonical/hreflang/TechArticle (Task 3), progressive enhancement (Task 2 script), error/edge handling (native fallback in the script; `required` validation) — all mapped. Testing adapted to the repo's build+quality-gate reality (no unit runner), per spec's "keep tests matched to the repo's current approach."
- **Placeholder scan:** the only placeholders are the two markdown bodies and PDFs, which the spec explicitly designates as user-provided build-time inputs and which are clearly marked `USER-PROVIDED`. No `TODO`/`TBD` in code steps; every code step shows complete code.
- **Type consistency:** `data.pdf`, `data.altHref`, `data.lang`, `data.publishDate` used in Task 3 match the schema defined in Task 1. `SubscribeForm` prop names (`lang`, `source`, `variant`) match between the component (Task 2) and both consumers (Footer Task 2, WhitepaperLayout Task 3). The `source` values (`footer`, `whitepaper-trust-root`, `whitepaper-trust-root-es`) are consistent with the grep assertions.
