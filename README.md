# loc-mock

## Local Release

Build the macOS app and package it as a drag-to-Applications DMG:

```bash
bun run release:local
```

The DMG is written to `release/`.

This flow does not require a paid Apple Developer account. The app is ad-hoc signed, so macOS may still show an unidentified developer warning. If blocked on first launch, right-click the installed app in `/Applications` and choose Open.

## GitHub Release

Pushing a `v*` tag runs `.github/workflows/release.yml`, builds the app on macOS, packages a DMG, uploads it as a workflow artifact, and attaches it to the GitHub release.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
