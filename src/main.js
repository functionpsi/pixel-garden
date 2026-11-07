const canvas = document.querySelector('#gardenCanvas');
const ctx = canvas.getContext('2d');
const densityInput = document.querySelector('#density');
const bloomInput = document.querySelector('#bloom');
const driftInput = document.querySelector('#drift');
const palettes = {
  sunrise: { sky: ['#f8e9c9', '#f3d9c0', '#e9c1b2'], ground: '#b7bb83', stem: '#647a52', leaf: '#748b5b', flowers: ['#ef8f73', '#e8b861', '#e5a5a7', '#fff0d5', '#d67d69'], center: '#9e7447', speck: '#fff8df' },
  forest: { sky: ['#d7e4c6', '#b6cfb0', '#9dbb9c'], ground: '#708c69', stem: '#426b50', leaf: '#587d59', flowers: ['#f1d78d', '#d8a88d', '#d1dca7', '#f5ead1', '#c4d2b1'], center: '#896d43', speck: '#f3f5d6' },
  cosmic: { sky: ['#292b4e', '#45466e', '#797094'], ground: '#393d5d', stem: '#586e68', leaf: '#738a78', flowers: ['#d9a5dc', '#f2b5b0', '#a8c8ed', '#f2d392', '#b4abd9'], center: '#d1b875', speck: '#f8e9cc' },
  neon: { sky: ['#172f3a', '#265557', '#427c71'], ground: '#234d48', stem: '#3c9b73', leaf: '#63bc83', flowers: ['#fc7186', '#f6d05f', '#b6f178', '#58e0d1', '#c696ff'], center: '#ffd36e', speck: '#f5ffd8' },
};
const names = ['The Quiet Meadow', 'A Place to Pause', 'The Sunlit Elsewhere', 'Little Wild Things', 'Somewhere Soft', 'The Almost-Spring'];
const state = { seed: Number(new URLSearchParams(location.search).get('seed')) || Math.floor(Math.random() * 999999) + 1, palette: new URLSearchParams(location.search).get('mood') in palettes ? new URLSearchParams(location.search).get('mood') : 'sunrise', density: Number(densityInput.value), bloom: Number(bloomInput.value), drift: Number(driftInput.value), paused: false, flowers: [], stars: [], ripples: [], width: 0, height: 0, dpr: 1, lastTime: 0, time: 0 };
let random = Math.random;
let toastTimer;

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => { value += 0x6D2B79F5; let t = value; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function pick(items) { return items[Math.floor(random() * items.length)]; }
function makeGarden() {
  random = seededRandom(state.seed);
  state.flowers = [];
  state.stars = Array.from({ length: Math.round(state.density * 1.4) }, () => ({ x: random(), y: random() * 0.79, size: 0.5 + random() * 1.6, phase: random() * Math.PI * 2 }));
  const count = state.density;
  for (let i = 0; i < count; i++) {
    const x = 0.035 + random() * 0.93;
    const baseY = 0.82 + random() * 0.22;
    const height = 0.15 + random() * 0.42;
    const colorIndex = Math.floor(random() * palettes[state.palette].flowers.length);
    state.flowers.push({ x, baseY, height, size: (0.012 + random() * 0.012) * (0.62 + (baseY - 0.82) * 2.8), colorIndex, petals: 5 + Math.floor(random() * 4), phase: random() * 6.28, sway: 0.4 + random() * 0.7, leaves: 1 + Math.floor(random() * 3), depth: baseY });
  }
  state.flowers.sort((a, b) => a.depth - b.depth);
  document.querySelector('#seedLabel').textContent = `SEED ${String(state.seed).padStart(6, '0')}`;
  document.querySelector('#gardenName').textContent = names[state.seed % names.length];
  const url = new URL(location.href); url.searchParams.set('seed', state.seed); url.searchParams.set('mood', state.palette); history.replaceState({}, '', url);
}
function resize() {
  const bounds = canvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  state.dpr = Math.min(window.devicePixelRatio || 1, 2);
  state.width = bounds.width; state.height = bounds.height;
  canvas.width = Math.round(bounds.width * state.dpr); canvas.height = Math.round(bounds.height * state.dpr);
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  draw(0);
}
function roundedRect(x, y, width, height, radius) {
  ctx.beginPath(); ctx.roundRect(x, y, width, height, radius); ctx.fill();
}
function drawFlower(flower, time, palette, scale = 1) {
  const w = state.width, h = state.height;
  const x = flower.x * w, baseY = flower.baseY * h, stemHeight = flower.height * h;
  const sway = Math.sin(time * 0.0007 * Math.max(state.drift, 0.1) + flower.phase) * 9 * state.drift * flower.sway;
  const topX = x + sway, topY = baseY - stemHeight;
  const stemWidth = Math.max(1, h * 0.0025);
  ctx.strokeStyle = palette.stem; ctx.lineWidth = stemWidth; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, baseY); ctx.quadraticCurveTo(x + sway * 0.25, baseY - stemHeight * 0.52, topX, topY); ctx.stroke();
  for (let leaf = 0; leaf < flower.leaves; leaf++) {
    const progress = 0.36 + leaf * (0.42 / Math.max(flower.leaves - 1, 1));
    const leafX = x + sway * progress, leafY = baseY - stemHeight * progress;
    const side = (leaf % 2 ? -1 : 1) * (9 + flower.size * w * 0.5);
    ctx.fillStyle = palette.leaf; ctx.beginPath(); ctx.ellipse(leafX + side * 0.42, leafY, Math.abs(side) * 0.72, Math.max(3, Math.abs(side) * 0.24), side > 0 ? -0.5 : 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(leafX, leafY); ctx.lineTo(leafX + side * 0.75, leafY - 1); ctx.stroke();
  }
  const size = flower.size * Math.min(w, h) * state.bloom * scale;
  const nod = Math.sin(time * 0.0009 * Math.max(state.drift, 0.15) + flower.phase) * 0.12 * state.drift;
  ctx.save(); ctx.translate(topX, topY); ctx.rotate(nod);
  for (let i = 0; i < flower.petals; i++) {
    ctx.rotate((Math.PI * 2) / flower.petals);
    ctx.fillStyle = palette.flowers[flower.colorIndex]; ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.ellipse(0, -size * 0.58, size * 0.33, size * 0.66, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1; ctx.fillStyle = palette.center; ctx.beginPath(); ctx.arc(0, 0, size * 0.24, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = palette.speck; ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.arc(-size * 0.06, -size * 0.08, size * 0.065, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  ctx.restore();
}
function draw(timestamp = 0) {
  if (!state.width || !state.height) return;
  const palette = palettes[state.palette];
  if (!state.paused) state.time = timestamp;
  const t = state.time;
  const w = state.width, h = state.height;
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, palette.sky[0]); sky.addColorStop(0.58, palette.sky[1]); sky.addColorStop(1, palette.sky[2]);
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.44, 2, w * 0.5, h * 0.44, w * 0.52);
  glow.addColorStop(0, state.palette === 'cosmic' ? 'rgba(242,211,172,.17)' : 'rgba(255,246,208,.42)'); glow.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
  if (state.palette === 'cosmic') {
    for (const star of state.stars) { const alpha = 0.25 + (Math.sin(t * 0.001 + star.phase) + 1) * 0.25; ctx.fillStyle = `rgba(255,246,225,${alpha})`; ctx.beginPath(); ctx.arc(star.x * w, star.y * h, star.size, 0, 6.28); ctx.fill(); }
  } else {
    for (const star of state.stars.slice(0, 20)) { const alpha = 0.1 + (Math.sin(t * 0.001 + star.phase) + 1) * 0.1; ctx.fillStyle = `rgba(255,255,255,${alpha})`; ctx.beginPath(); ctx.arc(star.x * w, star.y * h, star.size * 1.5, 0, 6.28); ctx.fill(); }
  }
  // Layered distant hills give the flat canvas a soft, storybook horizon.
  ctx.fillStyle = palette.ground; ctx.globalAlpha = 0.36; ctx.beginPath(); ctx.moveTo(0, h * 0.72); ctx.quadraticCurveTo(w * 0.24, h * 0.61, w * 0.48, h * 0.74); ctx.quadraticCurveTo(w * 0.76, h * 0.83, w, h * 0.68); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
  ctx.globalAlpha = 0.62; ctx.beginPath(); ctx.moveTo(0, h * 0.81); ctx.quadraticCurveTo(w * 0.28, h * 0.7, w * 0.57, h * 0.83); ctx.quadraticCurveTo(w * 0.8, h * 0.9, w, h * 0.76); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill(); ctx.globalAlpha = 1;
  state.flowers.forEach((flower) => drawFlower(flower, t, palette));
  const ground = ctx.createLinearGradient(0, h * 0.82, 0, h); ground.addColorStop(0, 'rgba(30,46,32,0)'); ground.addColorStop(1, 'rgba(24,38,28,.32)'); ctx.fillStyle = ground; ctx.fillRect(0, h * 0.8, w, h * 0.2);
  state.ripples = state.ripples.filter((ripple) => t - ripple.start < 1000);
  for (const ripple of state.ripples) { const progress = (t - ripple.start) / 1000; ctx.strokeStyle = `rgba(255,255,255,${(1 - progress) * 0.45})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ripple.x, ripple.y, progress * Math.max(w, h) * 0.22, 0, Math.PI * 2); ctx.stroke(); }
  if (!state.paused) requestAnimationFrame(draw);
}
function growAnother() { state.seed = Math.floor(Math.random() * 999999) + 1; makeGarden(); draw(state.time); }
function showToast(message) { const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('visible'), 2200); }
function pulse(x = state.width * 0.5, y = state.height * 0.52) { state.ripples.push({ x, y, start: state.time || performance.now() }); if (state.paused) { state.paused = false; document.querySelector('#motionBtn').setAttribute('aria-pressed', 'false'); document.querySelector('#motionBtn').innerHTML = 'Ⅱ <span>Pause motion</span>'; requestAnimationFrame(draw); } }
function updateURL() { const url = new URL(location.href); url.searchParams.set('seed', state.seed); url.searchParams.set('mood', state.palette); history.replaceState({}, '', url); }

for (const [input, key, output, suffix] of [[densityInput, 'density', '#densityValue', ''], [bloomInput, 'bloom', '#bloomValue', '×'], [driftInput, 'drift', '#driftValue', '×']]) {
  input.addEventListener('input', () => { state[key] = Number(input.value); document.querySelector(output).textContent = `${input.value}${suffix}`; if (key === 'density') makeGarden(); draw(state.time); });
}
document.querySelectorAll('.palette-button').forEach((button) => button.addEventListener('click', () => {
  state.palette = button.dataset.palette;
  document.querySelectorAll('.palette-button').forEach((item) => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
  makeGarden(); updateURL(); draw(state.time);
}));
document.querySelector('#rerollBtn').addEventListener('click', growAnother);
document.querySelector('#pulseBtn').addEventListener('click', () => pulse());
document.querySelector('#motionBtn').addEventListener('click', (event) => {
  state.paused = !state.paused; event.currentTarget.setAttribute('aria-pressed', String(state.paused)); event.currentTarget.innerHTML = state.paused ? '▶ <span>Resume motion</span>' : 'Ⅱ <span>Pause motion</span>';
  if (state.paused) draw(state.time); else requestAnimationFrame(draw);
});
canvas.addEventListener('pointerdown', (event) => { const bounds = canvas.getBoundingClientRect(); pulse(event.clientX - bounds.left, event.clientY - bounds.top); });
document.querySelector('#saveBtn').addEventListener('click', () => {
  const link = document.createElement('a'); link.download = `pixel-garden-${state.seed}.png`; link.href = canvas.toDataURL('image/png'); link.click(); showToast('Your garden is saved as a PNG.');
});
document.querySelector('#shareBtn').addEventListener('click', async () => {
  updateURL();
  try { await navigator.clipboard.writeText(location.href); showToast('Garden link copied — send a little sunshine.'); }
  catch { showToast(`Share this link: ${location.href}`); }
});
window.addEventListener('keydown', (event) => { if (event.code === 'Space' && !['INPUT', 'BUTTON'].includes(document.activeElement.tagName)) { event.preventDefault(); growAnother(); } });
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', (event) => { if (event.matches && !state.paused) document.querySelector('#motionBtn').click(); });
new ResizeObserver(resize).observe(canvas);
makeGarden();
resize();
requestAnimationFrame(draw);
