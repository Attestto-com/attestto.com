# Trust Whitepaper + Lead Capture — Design

**Date:** 2026-07-23
**Repo:** `attestto.com` (Astro 5, GitHub Pages, Cloudflare-proxied)
**Status:** Approved for planning

## Goal

Publish the trust whitepaper ("La raíz de la confianza digital" / "The Root of Digital
Trust") as an ungated, on-domain page (readable HTML + downloadable PDF, EN + ES), and
capture opt-in email leads through a consent-based subscribe form placed in the global
footer site-wide and prominently on the whitepaper page. Each placement is tagged so we
can see which surface converts.

## Non-goals (YAGNI)

- No gating of any kind. The whitepaper is fully readable without an email.
- No self-hosted backend. GitHub Pages is static; the form posts to Buttondown directly.
- No CRM sync, drip sequences, or analytics beyond Buttondown's own dashboard.
- No migration of the existing blog to this pattern (the whitepaper reuses the blog's
  content-collection approach, but the blog itself is untouched).

## Decisions (settled)

| Decision | Choice | Why |
|---|---|---|
| Host domain | `attestto.com` | Commercial/marketing surface; already hosts the blog and content collections. |
| Email backend | **Buttondown** (workspace `attestto`, from `info@attestto.com`) | Zero backend; privacy-first provider; plain embed form, no API key in client. |
| Content source | User provides final EN + ES copy | Eduardo is the final public reviewer; copy dropped into markdown. |
| Form scope | **Global footer** + prominent whitepaper-page CTA | Site-wide capture; shared component avoids copy-paste. |
| Per-page attribution | Buttondown `tag` per placement | See which surface converts from day one. |

## Global constraints (project-wide, apply to every task)

- **Brand spelling:** "Attestto" (double-t) everywhere.
- **No em-dashes** in any public-facing copy (use commas, colons, or restructure).
- **Clean URLs** (no `.html`, no query-string PII).
- **i18n routing:** English pages at English slugs, Spanish pages at Spanish slugs
  (existing convention: `products/` ↔ `productos/`). No `/es/` prefix.
- **Design tokens only** — reuse `--color-*`, `--space-*`, `--text-*` from the existing
  attestto.com token set. Site accent is `--color-accent: #1e40af`. No hardcoded values.
- **Privacy discipline:** consent checkbox required; visible "we never sell your data"
  line; subscriber data never monetized. Double opt-in enabled in Buttondown.
- **Progressive enhancement:** the form must work with a plain HTML POST (no JS). JS only
  adds an inline success state.

## Architecture

Four units, each with one responsibility:

### 1. `src/components/SubscribeForm.astro` (new, shared)

The single source of truth for the opt-in form. Used by both the footer and the
whitepaper page.

**Props:**
- `lang: 'en' | 'es'` — selects copy.
- `source: string` — becomes the Buttondown `tag` (e.g. `footer`,
  `whitepaper-trust-root`, `whitepaper-trust-root-es`). The `-es` suffix distinguishes
  the Spanish page (`/documentos/raiz-de-la-confianza-digital`) from the English one.
- `variant: 'compact' | 'full'` — `compact` for the footer (single-line: input +
  button), `full` for the whitepaper page (heading + subtext + input + button).

**Markup:** a native `<form method="post">` whose `action` is the Buttondown embed
endpoint:

```
https://buttondown.com/api/emails/embed/subscribe/attestto
```

Fields:
- `<input type="email" name="email" required>` — the subscriber address.
- `<input type="hidden" name="tag" value={source}>` — per-placement attribution.
- `<input type="hidden" name="embed" value="1">`.
- Consent: `<input type="checkbox" name="consent" required>` with label
  "Notify me when new countries are added to the directory" (EN) /
  Spanish equivalent, plus a visible "we never sell your data" line linking to the
  privacy page.

> **External detail to confirm at build time:** copy the exact `action` URL and hidden
> field names from Buttondown → "Set up your subscribe form" (the raw embed snippet).
> Buttondown has changed the embed host before (`buttondown.email` vs `buttondown.com`).
> The snippet is authoritative; the URL above is the expected form.

**Progressive enhancement (optional, in the same component):** a small inline
`<script>` intercepts submit, POSTs via `fetch`, and swaps in a success message so the
user stays on the page. If JS is disabled, the native POST redirects to Buttondown's
hosted confirmation page. Both paths trigger Buttondown's double-opt-in email.

**Copy (EN / ES), no em-dashes:**
- Footer heading (compact): "Follow the trust directory" / "Sigue el directorio de confianza"
- Full heading: "Get notified as the directory grows" / "Recibe avisos cuando el directorio crece"
- Subtext (full): "New countries, PKI trust anchors, and did:pki resolution, as they ship. No spam, and we never sell your data." / Spanish equivalent.
- Button: "Subscribe" / "Suscribirme"

### 2. Whitepaper content collection (new)

Follow the existing blog pattern (`src/content/blog` + `[...slug].astro`).

- New collection `whitepaper` defined in `src/content/config.ts` with schema:
  `title`, `description`, `lang`, `pdf` (path to the PDF in `public/`), `pubDate`,
  optional `ogImage`.
- Entries (markdown, from user's final copy):
  - `src/content/whitepaper/root-of-digital-trust.md` (EN)
  - `src/content/whitepaper/raiz-de-la-confianza-digital.md` (ES)

### 3. Whitepaper pages / layout (new)

- Layout `src/layouts/WhitepaperLayout.astro` (or reuse `BlogLayout.astro` if it fits):
  renders the markdown body, a prominent "Download PDF" button (from the entry's `pdf`
  field), and a `<SubscribeForm variant="full" source={...} lang={...} />` block near the
  end.
- Routes (English slug for EN, Spanish slug for ES, matching the `products/`↔`productos/`
  convention):
  - EN: `/whitepaper/root-of-digital-trust`
  - ES: `/documentos/raiz-de-la-confianza-digital`
  - Implemented either as two dedicated `.astro` pages that pull their collection entry,
    or a `[slug].astro` per language folder. Two dedicated pages are fine for two
    entries (YAGNI); revisit if more whitepapers appear.
- **PDFs** self-hosted in `public/whitepaper/` (`root-of-digital-trust.pdf`,
  `raiz-de-la-confianza-digital.pdf`). Provided by user.

### 4. Footer integration

- `src/components/Footer.astro` already receives `lang`. Add a
  `<SubscribeForm lang={lang} source="footer" variant="compact" />` block inside the
  footer (above or beside the existing links), styled with the same tokens so it reads as
  part of the footer, not a bolt-on. Restructure `.footer-inner` to a column layout if
  needed so the form has room (targeted change, not a footer redesign).

## SEO

- Canonical URL per page; `hreflang` pair linking EN <-> ES.
- Open Graph + Twitter card (reuse or add an OG image matching the dark PDF cover).
- JSON-LD `TechArticle` (or `Report`) per page: `headline`, `description`, `inLanguage`,
  `author`/`publisher` = Attestto Organization, `url`.

## Data flow

```
Visitor → whitepaper page (reads HTML, optionally downloads PDF)
        → enters email + checks consent in SubscribeForm (footer or page)
        → POST to buttondown.com/api/emails/embed/subscribe/attestto  (tag = source)
        → Buttondown sends double-opt-in confirmation email
        → confirmed subscriber appears in Buttondown, segmentable by tag
```

No data touches attestto.com infrastructure; the static page only hands the email to
Buttondown.

## Error / edge handling

- **JS disabled:** native POST redirects to Buttondown's hosted confirmation. Works.
- **Invalid email:** native `type="email"` + `required` validation; Buttondown re-validates.
- **Consent unchecked:** `required` on the checkbox blocks submit client-side.
- **Duplicate subscribe:** Buttondown handles idempotently (already-subscribed message).
- **Buttondown down:** form POST fails gracefully; the JS path shows a "try again later"
  message and the page/whitepaper remain fully usable (capture is never a gate).

## Testing

Static Astro site; keep tests lightweight and matched to the repo's current approach:
- Build passes (`astro build`) with the new collection, pages, and component.
- Rendered whitepaper pages contain: the PDF download link, the SubscribeForm, correct
  canonical + hreflang, and JSON-LD.
- SubscribeForm renders the correct `action`, the `tag` hidden field equal to `source`,
  the consent checkbox with `required`, and the "we never sell your data" line, in both
  `compact` and `full` variants and both languages.
- Footer renders the compact form with `source="footer"`.
- Manual: one real end-to-end subscribe in staging confirming the tag lands in Buttondown.

## Build-time inputs needed from user

1. Final EN + ES whitepaper copy (markdown or text).
2. The two PDFs (EN + ES).
3. Confirmation of the exact Buttondown embed `action` URL + field names from the
   "Set up your subscribe form" snippet.
4. (Optional) OG image; otherwise reuse the existing `public/og-image.png`.
