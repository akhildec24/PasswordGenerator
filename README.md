# Password Generator

A minimal, single-page password generator built with React + Vite. Inspired by the LastPass password generator, designed around Dieter Rams' principles of good design — useful, honest, unobtrusive, and as little design as possible.

## Features

- **Secure random generation** — uses `crypto.getRandomValues()`, never `Math.random()`
- **Adjustable length** — slider from 4 to 64 characters
- **Character type toggles** — uppercase, lowercase, numbers, symbols
- **Custom words** — mix your own words into generated passwords for memorable yet strong results
- **Avoid ambiguous characters** — optionally exclude `Il1O0o`
- **Strength meter** — live Weak / Fair / Good / Strong indicator
- **Copy to clipboard** — one click, with visual confirmation
- **Dark & light themes** — respects system preference, persists your choice
- **Accessible by default** — ARIA labels, visible focus states, `prefers-reduced-motion` support, semantic markup

## Privacy

All passwords are generated locally in your browser. Nothing is sent over the network or stored anywhere.

## Tech Stack

- React 19
- Vite
- Plain CSS (no framework) — CSS custom properties drive both themes

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Design

- Neutral white/grey canvas, charcoal and matte black for dark mode
- Signal red used sparingly for key interactions (generate button, slider, focus)
- Muted olive/blue for strength indicators
- 2px radii, single-pixel borders, no decorative noise
