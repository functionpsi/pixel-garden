# Pixel Garden

A small generative-art playground for growing a one-of-a-kind animated garden. Change the wildness, bloom size, breeze, and color mood; click the canvas to send a ripple through your world.

## What’s inside
- Seeded, deterministic worlds with shareable URLs.
- Share links preserve the garden seed, palette, wildness, bloom size, and breeze, so someone else can open the same recipe.
- Four atmospheric color moods, layered scenery, glow particles, and pointer-triggered ripples.
- Rare bloom species, save-as-PNG export, pause/resume motion, keyboard support, and reduced-motion awareness.
- Maker credits: GitHub Copilot and FunctionPsi ([X: @functonpsi](https://x.com/functonpsi)).

## Run locally

```bash
npm install
npm run dev -- --host
```

Open the local URL printed by Vite. To create a production build, run `npm run build`.

## Share a garden

Garden links use query parameters such as `?seed=123456&mood=cosmic&density=42&bloom=1.2&breeze=0.8`. Supported moods are `sunrise`, `forest`, `cosmic`, and `neon`.

Pixel Garden is a lightweight Vite app using the Canvas 2D API; no runtime framework or image assets are required.
