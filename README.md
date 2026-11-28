# IPILE — Frontend Web Client

Contemporary African luxury — **crafted around you**. The IPILE web client is the
customer, maker, merchant, and admin front end for a bespoke African fashion marketplace.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS 4 + IPILE editorial design tokens
- **Typography**: Cormorant Garamond (editorial) & Inter (interface)
- **Networking**: Axios + Socket.IO Client

## Brand

- Warm Ivory `#F5F0E8` canvas, Obsidian Black `#171717` chrome and type
- Craft Copper `#B8734E` accents, Ink Blue `#1F2A42` depth
- Logo: `public/img/logo.png` (ivory/copper, for dark surfaces) and
  `public/img/logo-ink-trim.png` (ink variant for light surfaces)
- Full design guidance: [`docs/DESIGN.md`](docs/DESIGN.md)

## Languages

English, Hausa, Yoruba and Igbo are supported. The language picker lives in the navbar and
the choice is stored in the `NEXT_LOCALE` cookie. Copy lives in
`src/i18n/dictionaries/`; see [`docs/I18N.md`](docs/I18N.md) to add strings or
another language.

## Quick Start

### 1. Environment Configuration

```bash
cp .env.example .env.local
```

### 2. Install Dependencies & Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Testing & Build

```bash
pnpm lint          # ESLint
pnpm build         # Production Turbopack build
```

## Malware guard (read before pulling or deploying)

In Oct–Nov 2026 attackers force-pushed copies of real commits with malware hidden in them
(`node init &&` in package.json scripts, code after hundreds of spaces, a fake font run by a
VS Code task on folder open). Code runs the moment you build, start, install or open it, so
**check before you pull**:

- `scripts/safe-pull.sh [branch]` instead of `git pull`: fetches, runs `scripts/git-guard.sh`
  on the incoming commits without running any of them, then fast-forwards only.
- `scripts/git-guard.sh --target origin/main` checks incoming commits against `HEAD`;
  `--base origin/main --target WORKTREE` checks what you are about to push.
- Deploys run it automatically (server side before checkout, and locally before build/push).

A `BLOCK` stops everything (exit code 2) and prints the restore command for a tampered remote.
It never rewrites the remote itself: rotate your GitHub credentials first, then restore.
Warnings (new dependencies, changed scripts) don't stop anything; review them.
`GUARD_ALLOW_REWRITE=1` accepts a history rewrite you made on purpose; `GUARD_STRICT=1` blocks
on warnings too. Also set `"task.allowAutomaticTasks": "off"` in your VS Code user settings.
