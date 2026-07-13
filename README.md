# Agency 1776 — Politicians & Candidates

Production-ready scaffold for premium animated campaign sites.

## Stack

- **Next.js 16** (App Router, JavaScript)
- **Tailwind CSS v4** (`@tailwindcss/postcss`, zero-config)
- **Motion** (`motion/react`) — imperative and variants
- **GSAP** — scoped via `useGsap` hook + `gsap.context` cleanup

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint

## Folder structure

```
src/
├── app/           # Next.js App Router routes (layout.jsx, page.jsx, globals.css)
├── components/    # Reusable UI (buttons, cards, primitives)
├── sections/      # Page-level building blocks (hero, features, cta)
├── animations/    # Motion variants + shared presets
├── hooks/         # Custom hooks (useGsap, ...)
├── utils/         # Dependency-free utilities (cn, ...)
└── assets/        # Static assets bundled by Next.js
```

Import alias: `@/*` → `./src/*` (configured in `jsconfig.json`).

## Conventions

- `overflow-x: clip` on html/body — `overflow-x: hidden` breaks `position: sticky`.
- Motion imports come from `motion/react` (not `framer-motion`).
- GSAP effects live inside `useGsap` scoped refs so cleanup is automatic.
- Kebab-case filenames, PascalCase components (see `.claude/Rule Guide/code-style.md`).
