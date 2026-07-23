---
title: "National signature trust, as a dependency"
description: "Every country publishes its digital-signature trust roots differently, and badly. Attestto mirrors them into hash-pinned, version-controlled, npm-installable form, and bridges them to W3C DIDs."
publishDate: 2026-07-23
author: "Attestto"
tags: [pki, trust-anchors, national-eid, eidas, did-pki, verifiable-credentials, developer-experience]
canonicalUrl: "https://attestto.com/blog/national-signature-trust-as-a-dependency"
draft: false
---

## The problem nobody wants to own

If you have ever tried to verify a document signed with a national digital signature, you know the moment. You need the country's root certificate. You go looking for it. And you fall into a different hole for every country.

One government publishes its roots as a `.zip` on a slow portal. Another buries them in an unformatted web page, or a PDF, or an LDAP server that half-answers. URLs are case-sensitive in surprising places. A root rotates and nothing announces it. Content-types lie. Every integration turns into a custom scraper against a ministry website that was not built for you.

This is the tax on cross-border signature verification. It is paid over and over, by every team, in every country, and none of that work is reusable. We got tired of paying it, so we built the thing we wanted to import.

## Aggregation and normalization

[`@attestto/trust`](https://www.npmjs.com/package/@attestto/trust) is an independent, public mirror of national digital-signature trust anchors. It currently spans Costa Rica, Brazil, Argentina, Spain, Estonia, Italy, and Peru, with more staged behind review.

Whatever mess each authority publishes, the mirror normalizes into the same shape: the binary certificate bytes as-is, plus a `manifest.json` recording every certificate's SHA-256 fingerprint, subject, issuer, key algorithm, and validity window, plus an all-in-one `chain.pem`. You read one structure instead of fifty. You can browse the whole thing at [trust.attestto.org](https://trust.attestto.org).

We are deliberately not a Certificate Authority. We do not issue, reissue, or vouch for any certificate. The legal source of truth stays with each country's issuing authority. What we provide is a clean, uniform, verifiable copy.

## Integration is an import

Keeping national trust anchors current usually means building pipeline infrastructure: watch a government feed, detect a rotated root, rebuild your trust store. For most teams that is undifferentiated plumbing.

```bash
npm install @attestto/trust
```

You get the bundled anchors inside your build, with per-country entry points. Every change to the set is a git commit with a message describing what rotated and why, so the full history is an audit trail you can diff and pin to an exact version. Promotion into the trusted set is human-gated on purpose: a certificate becomes authoritative only when a maintainer has cross-checked it, never automatically because a page changed.

One honest boundary worth stating plainly: we do not mirror revocation lists. A stale CRL is worse than none, and revocation is time-sensitive, so you fetch it from the issuing authority at verification time. The mirror gives you the trust anchors and their provenance, not a substitute for live revocation.

## A bridge to W3C DIDs

Government PKIs were designed decades before decentralized-identity standards existed, which makes them hard to consume from modern identity systems. So each certificate authority in the directory is also addressable as a [`did:pki`](https://spec.attestto.com/did-pki) identifier, derived deterministically from its X.509 subject and resolvable to a W3C DID Document through [resolver.attestto.com](https://resolver.attestto.com).

That turns a sovereign certificate hierarchy into something a standards-compliant W3C Decentralized Identifier system can read natively, without every application re-implementing X.509 subject parsing. It is a translation layer between how governments issue trust and how modern identity software expects to consume it.

## Tamper evidence, not blind trust

Because every certificate carries a deterministic SHA-256 fingerprint and a link back to the original source, the mirror is auditable rather than authoritative. You can recompute the hash of the `.pem` you downloaded and confirm it matches what the government published. If our copy ever disagrees with the issuing authority, the authority wins and we fix it. Trust the mirror for convenience, verify against the source when it matters.

## Who this is for

| If you build | What it removes |
| --- | --- |
| Fintech and e-KYC | Verifying national e-signature and eID-card credentials across countries, without custom code per authority |
| Legaltech and e-signature | Validating documents signed with official national IDs (Spain's DNIe, Costa Rica's Firma Digital, Estonia's ESTEID, Italy's CIE) |
| Identity and DID developers | Connecting official state-issued trust to W3C DID-based systems through `did:pki` |

National signature verification should be a dependency you import, not infrastructure you maintain. That is the whole idea.

Browse the directory at [trust.attestto.org](https://trust.attestto.org), or read the source at [github.com/Attestto-com/attestto-trust](https://github.com/Attestto-com/attestto-trust).
