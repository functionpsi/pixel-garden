* {
  box-sizing: border-box;
}

:root {
  --bg: #07141f;
  --panel: rgba(10, 20, 34, 0.72);
  --panel-strong: rgba(14, 28, 38, 0.92);
  --text: #e9f4ff;
  --muted: #b8cfdc;
  --line: rgba(173, 215, 255, 0.18);
  --shadow: rgba(0, 0, 0, 0.28);
  --accent: #7effd6;
  --accent-2: #f9d976;
}

html, body {
  margin: 0;
  min-height: 100%;
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(100, 165, 248, 0.24), transparent 28%),
    linear-gradient(180deg, #06131e 0%, #0b1d2a 100%);
  color: var(--text);
  font-family: "Space Grotesk", sans-serif;
}

body {
  display: grid;
  place-items: center;
  padding: 32px;
}

button,
input {
  font: inherit;
}

.shell {
  width: min(1200px, 100%);
  background: rgba(7, 16, 24, 0.62);
  border: 1px solid var(--line);
  border-radius: 26px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(20px);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 26px 12px;
  border-bottom: 1px solid var(--line);
}

.eyebrow {
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.7rem;
  color: rgba(192, 230, 255, 0.74);
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 3vw, 2.8rem);
  letter-spacing: -0.06em;
}

.panel {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  min-height: 760px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 22px 20px 18px;
  border-right: 1px solid var(--line);
  background: rgba(10, 18, 28, 0.56);
}

.controls section {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 18px 16px;
}

.controls h2 {
  margin: 0 0 18px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--muted);
}

.field {
  display: grid;
  gap: 10px;
  margin-bottom: 16px;
  color: var(--muted);
}

.field:last-child {
  margin-bottom: 0;
}

.slider-wrap {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

input[type="range"] {
  width: 100%;
  accent-color: var(--accent);
}

output {
  min-width: 42px;
  text-align: right;
  font-weight: 600;
  color: var(--text);
}

.palette-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.palette-button,
button {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--text);
  padding: 10px 12px;
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.palette-button:hover,
button:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.2);
}

.palette-button.active {
  background: linear-gradient(135deg, rgba(126, 255, 214, 0.18), rgba(147, 160, 255, 0.12));
  border-color: rgba(126, 255, 214, 0.35);
}

.actions {
  display: grid;
  gap: 12px;
}

.primary {
  background: linear-gradient(135deg, #7effd6, #8bbdff);
  color: #07141f;
  font-weight: 700;
  border: none;
  box-shadow: 0 10px 26px rgba(126, 255, 214, 0.25);
}

.secondary {
  background: linear-gradient(135deg, rgba(255, 190, 110, 0.15), rgba(249, 217, 118, 0.08));
}

.ghost {
  background: rgba(255, 255, 255, 0.02);
}

.stage-wrap {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 720px;
  padding: 14px;
}

#gardenCanvas {
  width: 100%;
  height: 100%;
  min-height: 680px;
  border-radius: 22px;
  display: block;
  background: linear-gradient(180deg, rgba(20, 26, 42, 0.96), rgba(8, 18, 30, 0.96));
  border: 1px solid rgba(173, 215, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
}

@media (max-width: 860px) {
  body {
    padding: 20px;
  }

  .panel {
    grid-template-columns: 1fr;
  }

  .controls {
    border-right: none;
    border-bottom: 1px solid var(--line);
  }

  .stage-wrap {
    min-height: 480px;
  }
}
