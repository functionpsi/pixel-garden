# Pixel Garden

A small generative-art playground for growing a one-of-a-kind animated garden. Change the wildness, bloom size, breeze, and color mood; click the canvas to send a ripple through your world.

## What’s new
- Seeded, deterministic worlds with shareable URLs.
- Four atmospheric color moods: sunrise, forest, cosmic, and neon.
- Rich layered scenery with glows, particles, hills, and pointer-triggered ripples.
- Rare bloom species like daisies, stars, lotus-like flowers, and orb blossoms.
- Save as PNG, copy a garden link, and pause/resume motion.
- Keyboard support and reduced-motion awareness.

## Run locally

```bash
npm install
npm run dev -- --host
```

Open the local URL printed by Vite. To create a production build, run `npm run build`.

## Share a seed

Use `?seed=123456&mood=cosmic` on the app URL to open a particular garden. Supported moods are `sunrise`, `forest`, `cosmic`, and `neon`.

Pixel Garden is a lightweight Vite app using the Canvas 2D API; no runtime framework or image assets are required.
