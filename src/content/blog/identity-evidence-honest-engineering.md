---
title: "Identity evidence: honest engineering"
description: "A three-axis model for classifying identity evidence assurance, and why it fits inside NIST SP 800-63-4 without pretending to be certified."
publishDate: 2026-07-01
author: "Attestto"
tags: [ieal, nist-800-63, identity, standards, verifiable-credentials, presentation-attack-detection]
canonicalUrl: "https://attestto.com/blog/identity-evidence-honest-engineering"
draft: true
---

## The word "liveness" is doing too much work

Walk through any identity-vendor booth in 2026 and you will hear the same phrase. Liveness verification. Anti-spoofing. Deepfake protection. Some of these claims are backed by an iBeta certification against ISO/IEC 30107-3. Most are marketing.

The gap between marketing language and engineering reality has consequences. Notary regulators, financial supervisors, and government procurement offices increasingly require a specific assurance floor before accepting a digitally-verified identity for a legally-consequential act. When the floor is "iBeta-certified PAD Level 2" and the vendor delivers "our liveness technology," the auditor cannot sign off. And when the same vendor uses the phrase for products that were never tested, the credibility of the whole category erodes.

We wrote a spec so that this stops.

## IEAL: three axes, seven levels, one honest claim

[IEAL](https://spec.attestto.com/ieal) is the Identity Evidence Assurance Level specification. Attestto authored v0.1 as a Working Draft. The specification is published under Creative Commons Attribution 4.0. Source is maintained on GitHub for adopters to review, comment on, or fork.

The specification classifies identity evidence along three independent axes:

| Axis | Low end (weakest) | High end (strongest) |
|---|---|---|
| **Capture** | C0 — browser webcam, no attestation | C2 — hardware-attested mobile (Play Integrity STRONG or App Attest with Secure Enclave) |
| **Algorithm** | A0 — no PAD; A1 — active challenge only | A3 or A4 — ISO/IEC 30107-3 certified PAD Level 1 or 2 |
| **Storage** | S0 — no witness retained; S1 — OS-managed secret store | S2 hardware-protected key store, S3 external hardware token, or S4 threshold multi-party recovery |

Full per-axis definitions (all intermediate values, evidence requirements, producer and verifier obligations) live in the [specification](https://spec.attestto.com/ieal).

A composite IEAL level from L0 through L6 is assigned by picking one value on each axis. L4 corresponds approximately to NIST IAL2 with the biometric verification pathway. L6 approximates a subset of IAL3 controls.

The composite level lets a verifier procure against a machine-verifiable target. The per-axis values let the verifier reason about which parts of the assurance chain are load-bearing for their specific use case.

## Why this fits inside NIST SP 800-63-4

NIST published Special Publication 800-63-4 on 2025-07-31. Its base document introduces the [Subscriber-Controlled Wallet model in §2.4 (Figure 5)](https://pages.nist.gov/800-63-4/sp800-63.html): a credential service provider issues attribute bundles, the subscriber holds and presents them from a wallet under their control, and a relying party verifies.

That is the W3C Verifiable Credentials three-party model, formally adopted into NIST vocabulary. It is also the model IEAL is designed to fit inside.

Three specific NIST anchors ground the alignment.

First, [NIST SP 800-63A §3.13](https://pages.nist.gov/800-63-4/sp800-63a.html) (`ProofBios`) is normative on ISO/IEC 30107-3:2023 Presentation Attack Detection and requires an Imposter Attack Presentation Accept Rate below 0.07. IEAL Algorithm axis values A3 (PAD Level 1) and A4 (PAD Level 2) require certification through the same iBeta or NVLAP-accredited testing pathway that satisfies the NIST requirement.

Second, [NIST SP 800-63B §3](https://pages.nist.gov/800-63-4/sp800-63b.html) requires non-exportable private keys in TPM, TEE, or Secure Element at AAL3, and explicitly forbids syncable authenticators at AAL3. IEAL Storage axis S2 satisfies the non-exportable requirement. Storage axis S3 additionally satisfies the non-syncable requirement.

Third, [NIST SP 800-63C §4.6.1.3](https://pages.nist.gov/800-63-4/sp800-63c.html) treats per-event consent as normative for attribute release, and prohibits conditioning identity service on unrelated processing consent. IEAL extends per-event consent to cover access to retained biometric witnesses, a case that follows directly from the NIST clause.

IEAL does not compete with NIST 800-63-4. It fills the whitespace NIST leaves to implementer policy: capture-environment attestation grading, storage-location grading, and per-event access control over retained biometric evidence. Nothing in this positioning requires NIST to endorse anything.

An informative crosswalk document accompanies the specification at [spec.attestto.com/ieal/crosswalks/nist-800-63](https://spec.attestto.com/ieal/crosswalks/nist-800-63). It carries the mandatory disclaimer that Attestto's crosswalks are not endorsed by NIST. Formal certification against NIST 800-63-4 remains the exclusive purview of NIST-authorized assessors.

## What we do not claim

- **PAD certification.** We do not maintain our own algorithm certification. For IEAL A3 or A4, integrate any provider carrying current ISO/IEC 30107-3 certification from an iBeta or other NVLAP-accredited testing laboratory. The iBeta public register is the authority. No preferred vendor, no compensation for inclusion, no shadow list maintained by Attestto.
- **NIST assurance-level status.** An IEAL claim is Attestto's claim, not NIST's. Only NIST-authorized assessors confer IAL, AAL, or FAL status.
- **A specific carrier format.** IEAL claims travel inside W3C Verifiable Credentials, SD-JWT, ISO/IEC 18013-5 mDoc artifacts, IETF COSE-signed objects, or embedded metadata inside existing document containers like PDF signature dictionaries and C2PA manifests. Adopters choose.
- **A dependency on Attestto products.** The specification is CC-BY 4.0, the reference JSON schemas are Apache 2.0, and any implementer meeting the axis criteria can produce or verify conforming IEAL claims.

## Building the reference implementation

Attestto is building the reference implementation in the open. Here is what is shipped, what is in progress, and what is planned.

**Shipped.** The [attestto-desktop application](https://github.com/Attestto-com/attestto-desktop) stores identity artifacts in a SQLCipher-encrypted vault backed by the operating system keychain, with a hardware-protected key on macOS via the Secure Enclave and on Windows via the TPM. The storage architecture is compatible with IEAL Storage axis values S1 and S2. Guardian recovery uses Shamir 2-of-3 secret sharing and is mandatory at onboarding rather than optional at a high tier.

**In progress.** Emitting IEAL claim JSON from the desktop signing pipeline, and embedding IEAL claims into signed PDFs via the PAdES-LTA long-term-archival profile with Solana as the decentralized timestamp anchor. Design specifications live in the attestto-desktop architecture documents. Implementation lands per the IEAL v0.1 sprint plan.

**Planned.** The companion [attestto-mobile application](https://github.com/Attestto-com/attestto-mobile) will supply Capture axis C1 and C2 attestations via Google's Play Integrity API on Android and Apple's App Attest on iOS. This integration is priority P2 on the IEAL implementation roadmap and is customer-triggered.

Once PAdES-LTA embedding lands, verification uses validation data embedded in the signed PDF itself. Neither application requires Attestto infrastructure to function offline in that mode.

## Peer projects, not competitors

Several other projects in the decentralized-identity space have thought carefully about identity assurance. Sovio and its underlying [CREDEBL](https://github.com/credebl) framework at AYANWORKS ship Pramaan with iBeta-certified PAD. [Blerify](https://blerify.com/) in Panama ships an OpenID4VP wallet with strong federation posture. [QuarkID by Extrimian](https://quarkid.org/) deploys W3C-aligned decentralized identity in Latin America. [Cheqd](https://cheqd.io/) contributes to the ToIP Trust Registry Protocol and the HAVID specification.

We name them as peers because that is what they are. Different tradeoffs, valid choices. IEAL is intended to be a shared vocabulary that any of these projects can adopt, extend, or ignore based on their own architectural priorities.

## How to engage

The IEAL specification lives at [spec.attestto.com/ieal](https://spec.attestto.com/ieal). Source will be maintained at [github.com/Attestto-com/spec-ieal](https://github.com/Attestto-com/spec-ieal) once the repository is public. Comments, issues, and pull requests are welcome.

IEAL v0.1 is a Working Draft. We intend to bring it into peer discussion at the W3C Credentials Community Group and the Decentralized Identity Foundation. NIST SP 800-63-4 was finalized on 2025-07-31; when NIST opens a future revision comment window, we plan to submit IEAL for consideration.

For adopters with specific procurement questions about mapping IEAL to NIST 800-63-4 in a real deployment, the [informative crosswalk](https://spec.attestto.com/ieal/crosswalks/nist-800-63) is the starting point. Nothing there is a certification claim, and nothing there substitutes for a NIST-authorized assessor.

Identity evidence should be verifiable, portable, and honestly labeled. That is what this specification is for.
