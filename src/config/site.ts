/**
 * Central site configuration: external links + navigation menus.
 *
 * Change a URL or a menu item HERE and it updates across the whole site.
 *
 * Phase note: this phase focuses on WEB FLOWS via the browser extension.
 * The app (app.attestto.com) is intentionally NOT linked yet, so every
 * "get started / sign in / create" action points to the extension. When the
 * app phase begins, add `app` back to LINKS and switch the relevant CTAs.
 */

export type Lang = 'en' | 'es';

export const EXTENSION_ID = 'cnjbggeifnopdfjgejlioiiddnfdllha';

/**
 * Your LOCAL unpacked build's id (from brave://extensions or chrome://extensions),
 * so "is the extension installed?" detection works while developing. An unpacked
 * build gets a different, random id than the published store id above, which is
 * why detection shows "Install" even when you have the dev build loaded.
 * Leave empty in production.
 */
export const EXTENSION_ID_DEV = '';

/** All ids to probe for presence. Any match means the extension is installed. */
export const EXTENSION_IDS = [EXTENSION_ID, EXTENSION_ID_DEV].filter(Boolean);

export const LINKS = {
  /** Where "get Attestto / add to browser" points. */
  extension: `https://chromewebstore.google.com/detail/${EXTENSION_ID}`,
  /** Where "Sign in with Attestto" lands (the app login page, /app/login).
   *  Only reached by visitors who already have the extension. */
  signIn: 'https://app.attestto.com/app/login', // TODO(Eduardo): confirm the login host
  github: 'https://github.com/Attestto-com',
  open: 'https://attestto.org',
  standards: 'https://spec.attestto.com',
  contact: 'mailto:hello@attestto.com',
  // app: 'https://app.attestto.com', // parked — not linked this phase
} as const;

/** Primary header/mobile navigation. One source for both. */
export function primaryNav(lang: Lang) {
  return [
    { href: lang === 'es' ? '/productos' : '/products', label: lang === 'es' ? 'Productos' : 'Products' },
    { href: '/personas', label: lang === 'es' ? 'IDs Digitales' : 'Digital IDs' },
    { href: '/firma-digital', label: 'Firma Digital' },
    { href: '/blog', label: 'Blog' },
  ];
}

/** Footer links. `external` opens in a new tab with rel=noopener. */
export function footerLinks(_lang: Lang) {
  return [
    { href: '/roadmap', label: 'Roadmap', external: false },
    { href: LINKS.github, label: 'GitHub', external: true },
    { href: LINKS.open, label: 'Attestto Open', external: true },
    { href: LINKS.standards, label: 'Standards', external: true },
    { href: LINKS.contact, label: 'Contact', external: false },
  ];
}
