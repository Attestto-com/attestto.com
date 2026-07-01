#!/usr/bin/env node
/**
 * attestto.com quality checker
 *
 * Runs after `astro build` against `dist/`. Enforces:
 *  - Semantic HTML (html lang, main landmark, skip link)
 *  - SEO metadata (title, description, OG, Twitter, canonical, hreflang)
 *  - Structured data (Organization, WebSite; FAQPage on home; BlogPosting/Breadcrumb on posts)
 *  - AI/GEO discovery (llms.txt, robots.txt with AI bots, sitemap)
 *  - Content discipline (no em-dashes, no self-sovereign/SSI, correct Attestto spelling)
 *  - No old EEZZEER LEI leaking through
 *  - Images have alt attributes
 *
 * Exit code: 0 clean, 1 if any errors (warnings do not fail the build).
 *
 * Usage:
 *   pnpm run check           (builds first, then runs)
 *   node scripts/check-quality.mjs   (runs against existing dist/)
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = 'dist';
const errors = [];
const warnings = [];

const banner = (msg) => `\n\x1b[1m${msg}\x1b[0m\n`;
const red = (msg) => `\x1b[31m${msg}\x1b[0m`;
const yellow = (msg) => `\x1b[33m${msg}\x1b[0m`;
const green = (msg) => `\x1b[32m${msg}\x1b[0m`;
const dim = (msg) => `\x1b[2m${msg}\x1b[0m`;

const error = (file, msg) => errors.push({ file: relative(DIST, file), msg });
const warn = (file, msg) => warnings.push({ file: relative(DIST, file), msg });

async function walk(dir, extension) {
  const out = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        out.push(...(await walk(path, extension)));
      } else if (entry.name.endsWith(extension)) {
        out.push(path);
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  return out;
}

const BANNED_PHRASES = [
  { pattern: /self-sovereign/i, msg: 'contains "self-sovereign" (violates feedback_no_self_sovereign_term)' },
  { pattern: /\bSSI\b/, msg: 'contains standalone "SSI" (violates feedback_no_self_sovereign_term)' },
  { pattern: /Attesto\b(?!-)/, msg: 'misspelling "Attesto" (canonical is "Attestto" — double-t twice)' },
  { pattern: /Attestoo\b/, msg: 'misspelling "Attestoo"' },
  { pattern: /Atttestto\b/, msg: 'misspelling "Atttestto"' },
  { pattern: /attest\.to/, msg: 'wrong domain "attest.to" (canonical is attestto.com/.org)' },
];

const OLD_LEI = '9845008661B99CC9FD07';

function stripHtml(content) {
  return content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ');
}

async function checkHtml(file) {
  const content = await readFile(file, 'utf-8');
  const rel = relative(DIST, file);
  // With Astro directory format, every page is <slug>/index.html.
  // Real home is only the top-level `index.html` — everything else is a sub-page.
  const isHome = rel === 'index.html';
  const isBlogPost = rel.startsWith('blog/') && rel !== 'blog/index.html' && rel.endsWith('/index.html');
  const is404 = rel === '404.html';

  // Semantic HTML
  if (!/<html[^>]*\slang=/i.test(content)) error(file, 'missing <html lang="..."> attribute');
  if (!/<main\b/i.test(content) && !is404) error(file, 'missing <main> landmark');
  if (!/skip[-\s]?(link|to[-\s]?(main|content))/i.test(content)) warn(file, 'no skip link detected');
  if (!/<title>[\s\S]+<\/title>/i.test(content)) error(file, 'missing <title>');

  // Meta description + length
  const descMatch = content.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
  if (!descMatch) {
    error(file, 'missing meta description');
  } else {
    const len = descMatch[1].length;
    if (len < 100) warn(file, `meta description short (${len} chars, target 100-160)`);
    if (len > 200) warn(file, `meta description long (${len} chars, target 100-160)`);
  }

  // OG tags
  const ogRequired = ['og:title', 'og:description', 'og:type', 'og:url', 'og:image'];
  for (const tag of ogRequired) {
    if (!new RegExp(`<meta\\s+property="${tag}"`, 'i').test(content)) {
      error(file, `missing ${tag} tag`);
    }
  }

  // Twitter card
  if (!/<meta\s+name="twitter:card"/i.test(content)) warn(file, 'missing twitter:card');

  // Canonical
  if (!/<link\s+rel="canonical"/i.test(content)) error(file, 'missing canonical link');

  // hreflang
  if (!/<link\s+rel="alternate"\s+hreflang=/i.test(content)) warn(file, 'no hreflang links found');

  // JSON-LD Organization + WebSite
  if (!/"@type":\s*"Organization"/i.test(content)) warn(file, 'no Organization JSON-LD schema');
  if (!/"@type":\s*"WebSite"/i.test(content)) warn(file, 'no WebSite JSON-LD schema');
  if (isBlogPost && !/"@type":\s*"BlogPosting"/i.test(content)) error(file, 'blog post missing BlogPosting JSON-LD');
  if (isBlogPost && !/"@type":\s*"BreadcrumbList"/i.test(content)) warn(file, 'blog post missing BreadcrumbList JSON-LD');

  // Content discipline (against visible text only — skip script/style)
  const visible = stripHtml(content);
  for (const { pattern, msg } of BANNED_PHRASES) {
    if (pattern.test(visible)) error(file, msg);
  }

  // Em-dashes in visible content
  const emDashes = (visible.match(/—/g) || []).length;
  if (emDashes > 0) warn(file, `${emDashes} em-dash(es) found (violates feedback_no_em_dashes_in_public_posts)`);

  // Old LEI
  if (content.includes(OLD_LEI)) error(file, `contains old EEZZEER LEI ${OLD_LEI}`);

  // Images with alt
  const imgTags = content.match(/<img\b[^>]*>/gi) || [];
  for (const img of imgTags) {
    if (!/\balt=/i.test(img)) error(file, `image without alt attribute: ${img.slice(0, 80)}`);
  }

  // Home-specific: FAQPage + SoftwareApplication schemas
  if (isHome) {
    if (!/"@type":\s*"FAQPage"/i.test(content)) warn(file, 'home missing FAQPage schema (targets Google FAQ rich snippets)');
    if (!/"@type":\s*"SoftwareApplication"/i.test(content)) warn(file, 'home missing SoftwareApplication schema');
  }

  // Blog-index-specific: Blog + ItemList schemas (machine-readable blog structure)
  const isBlogIndex = rel === 'blog/index.html';
  if (isBlogIndex) {
    if (!/"@type":\s*"Blog"/i.test(content)) warn(file, 'blog index missing Blog schema (helps AI crawlers identify as blog)');
    if (!/"@type":\s*"ItemList"/i.test(content)) warn(file, 'blog index missing ItemList schema (helps AI crawlers navigate posts)');
  }
}

async function checkPublicAssets() {
  const requiredAtRoot = ['robots.txt', 'CNAME'];
  const recommendedAtRoot = ['llms.txt'];

  for (const f of requiredAtRoot) {
    try {
      await stat(join(DIST, f));
    } catch {
      error(DIST, `missing ${f} (required)`);
    }
  }
  for (const f of recommendedAtRoot) {
    try {
      await stat(join(DIST, f));
    } catch {
      warn(DIST, `missing ${f} (recommended for AI/LLM discovery)`);
    }
  }

  // robots.txt AI bot allowlist
  try {
    const robots = await readFile(join(DIST, 'robots.txt'), 'utf-8');
    const bots = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended'];
    for (const bot of bots) {
      if (!robots.includes(bot)) warn(join(DIST, 'robots.txt'), `AI bot "${bot}" not explicitly allowed`);
    }
    if (!robots.includes('Sitemap:')) warn(join(DIST, 'robots.txt'), 'no Sitemap: reference');
  } catch {}

  // Sitemap
  const sitemapCandidates = ['sitemap-index.xml', 'sitemap.xml'];
  let sitemapFound = false;
  for (const s of sitemapCandidates) {
    try {
      await stat(join(DIST, s));
      sitemapFound = true;
      break;
    } catch {}
  }
  if (!sitemapFound) error(DIST, 'no sitemap-index.xml or sitemap.xml (expected from @astrojs/sitemap)');
}

async function main() {
  console.log(banner('attestto.com quality check'));

  try {
    await stat(DIST);
  } catch {
    console.error(red(`\n❌ ${DIST}/ not found. Run \`pnpm build\` first.\n`));
    process.exit(1);
  }

  const htmlFiles = await walk(DIST, '.html');
  console.log(dim(`  scanning ${htmlFiles.length} HTML files...`));
  for (const file of htmlFiles) {
    await checkHtml(file);
  }
  await checkPublicAssets();

  console.log(`\n  ${htmlFiles.length} HTML files scanned`);
  console.log(`  ${errors.length ? red(errors.length + ' errors') : green('0 errors')}, ${warnings.length ? yellow(warnings.length + ' warnings') : green('0 warnings')}`);

  if (errors.length) {
    console.log(banner('Errors (blocking)'));
    for (const { file, msg } of errors) {
      console.log(`  ${red('✗')} ${file}: ${msg}`);
    }
  }

  if (warnings.length) {
    console.log(banner('Warnings (non-blocking)'));
    for (const { file, msg } of warnings) {
      console.log(`  ${yellow('!')} ${file}: ${msg}`);
    }
  }

  console.log('');
  if (errors.length) {
    console.log(red('❌ Quality check failed. Fix errors and re-run.\n'));
    process.exit(1);
  } else {
    console.log(green('✓ Quality check passed.\n'));
  }
}

main().catch((err) => {
  console.error(red('Quality checker crashed:'), err);
  process.exit(2);
});
