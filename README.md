# Pixel Garden

A small generative-art playground for growing a one-of-a-kind animated garden. Change the wildness, bloom size, breeze, and color mood; click the canvas to send a ripple through your world.

## What’s new
- **Seeded gardens:** each seed deterministically grows the same composition. Garden links include the seed and color mood, so you can share a world and revisit it later.
- **Living canvas:** layered hills, hand-drawn stems, leaves, flower heads, gentle wind, twinkling sky, and pointer-triggered ripples.
- **Creative controls:** tune density, bloom size, breeze, four palettes, and pause/resume motion.
- **Keep and share:** export the artwork as a PNG or copy a link to your garden.
- **Keyboard and reduced-motion support:** press Space to grow another garden, and motion can be paused.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To create a production build, run `npm run build`.

## Share a seed

Use `?seed=123456&mood=cosmic` on the app URL to open a particular garden. Supported moods are `sunrise`, `forest`, `cosmic`, and `neon`.

Pixel Garden is a lightweight Vite app using the Canvas 2D API; no runtime framework or image assets are required.
