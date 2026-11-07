const canvas = document.querySelector('#gardenCanvas');
const ctx = canvas.getContext('2d');
const densityInput = document.querySelector('#density');
const bloomInput = document.querySelector('#bloom');
const driftInput = document.querySelector('#drift');

const palettes = {
  sunrise: {
    skyTop: '#f4d7c8',
    skyMid: '#f1d6a5',
    skyBottom: '#c4d6d8',
    glow: 'rgba(255, 242, 197, 0.72)',
    ground: '#7e9f73',
    hillA: '#9db77d',
    hillB: '#6d845f',
    stem: '#486d56',
    leaf: '#587d59',
    flowers: ['#ef8f73', '#e6b76a', '#ebc7c8', '#fff1d9', '#d97d6d', '#d2c36c'],
    highlight: '#fef6e3',
    accent: '#ffb77d',
    mist: 'rgba(255,255,255,0.14)',
    star: '#fff5d7'
  },
  forest: {
    skyTop: '#d4e7d0',
    skyMid: '#b8d9bd',
    skyBottom: '#7ca3a7',
    glow: 'rgba(238,255,236,0.56)',
    ground: '#5a7f5a',
    hillA: '#7a9b6f',
    hillB: '#486548',
    stem: '#365a48',
    leaf: '#5d7e4a',
    flowers: ['#f2d58d', '#d2987f', '#dfe7b8', '#f8efdb', '#b9d39a', '#d0a755'],
    highlight: '#f7f6d6',
    accent: '#d1da90',
    mist: 'rgba(245,255,231,0.12)',
    star: '#f6f7e6'
  },
  cosmic: {
    skyTop: '#1a233b',
    skyMid: '#3b3a58',
    skyBottom: '#766c93',
    glow: 'rgba(240, 214, 255, 0.38)',
    ground: '#3b4964',
    hillA: '#485a6d',
    hillB: '#2b2d43',
    stem: '#607d72',
    leaf: '#7d9984',
    flowers: ['#d9a5dc', '#f0b09d', '#aec9ea', '#efd595', '#b8b0df', '#d0c8a8'],
    highlight: '#fff6e5',
    accent: '#f2c99d',
    mist: 'rgba(191,212,255,0.1)',
    star: '#f7ebd9'
  },
  neon: {
    skyTop: '#112f3a',
    skyMid: '#234f58',
    skyBottom: '#5d7f7e',
    glow: 'rgba(117, 255, 224, 0.38)',
    ground: '#1f4f4c',
    hillA: '#2a7163',
    hillB: '#1a3c3a',
    stem: '#2d8f5f',
    leaf: '#5eb883',
    flowers: ['#fc7186', '#f6d05f', '#b6f178', '#58e0d1', '#c696ff', '#f3a67d'],
    highlight: '#f1ffdb',
    accent: '#85f3db',
    mist: 'rgba(137,255,168,0.11)',
    star: '#ebfff8'
  }
};

const names = [
  'The Quiet Meadow',
  'Little Wild Things',
  'The Soft Horizon',
  'Sunlit Reverie',
  'A World of Hush',
  'The Many Petals'
];

const state = {
  seed: Number(new URLSearchParams(location.search).get('seed')) || Math.floor(Math.random() * 999999) + 1,
  palette: ['sunrise', 'forest', 'cosmic', 'neon'].includes(new URLSearchParams(location.search).get('mood')) ? new URLSearchParams(location.search).get('mood') : 'sunrise',
  density: Number(densityInput.value),
  bloom: Number(bloomInput.value),
  drift: Number(driftInput.value),
  paused: false,
  time: 0,
  width: 0,
  height: 0,
  dpr: 1,
  flowers: [],
  glowParticles: [],
  ripples: [],
  stars: []
};

let toastTimer;

function mulberry32(seed) {
  let t = (seed >>> 0) + 0x6d2b79f5;
  return function rand() {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setRangeProgress(range) {
  const min = Number(range.min) || 0;
  const max = Number(range.max) || 1;
  const value = Number(range.value);
  const progress = ((value - min) / (max - min)) * 100;
  range.style.setProperty('--progress', `${progress}%`);
}

function updateGardenMeta() {
  const seedLabel = document.querySelector('#seedLabel');
  const gardenName = document.querySelector('#gardenName');
  seedLabel.textContent = `SEED ${String(state.seed).padStart(6, '0')}`;
  gardenName.textContent = names[state.seed % names.length];
  const url = new URL(location.href);
  url.searchParams.set('seed', String(state.seed));
  url.searchParams.set('mood', state.palette);
  history.replaceState({}, '', url);
}

function createGarden() {
  const rand = mulberry32(state.seed);
  state.flowers = [];
  state.glowParticles = [];
  state.stars = [];

  for (let i = 0; i < 40; i++) {
    state.stars.push({
      x: rand(),
      y: rand() * 0.7,
      r: 0.7 + rand() * 2.2,
      alpha: 0.2 + rand() * 0.8,
      phase: rand() * Math.PI * 2
    });
  }

  const total = Math.max(14, Math.min(80, state.density));
  for (let i = 0; i < total; i++) {
    const x = 0.05 + rand() * 0.9;
    const bloomSize = 0.5 + rand() * 2.1;
    const height = 0.12 + rand() * 0.42;
    const speciesRoll = rand();
    let species = 'daisy';
    if (speciesRoll > 0.94) species = 'star';
    else if (speciesRoll > 0.82) species = 'lotus';
    else if (speciesRoll > 0.66) species = 'orb';

    state.flowers.push({
      x,
      baseY: 0.82 + rand() * 0.16,
      stemHeight: height,
      size: bloomSize,
      sway: 0.6 + rand() * 1.3,
      petals: 5 + Math.floor(rand() * 3),
      phase: rand() * Math.PI * 2,
      color: palettes[state.palette].flowers[Math.floor(rand() * palettes[state.palette].flowers.length)],
      species,
      leafCount: 2 + Math.floor(rand() * 3),
      rotation: (rand() - 0.5) * 0.9,
      aura: 0.5 + rand() * 1.5
    });
  }

  state.flowers.sort((a, b) => a.baseY - b.baseY);

  for (let i = 0; i < 26; i++) {
    state.glowParticles.push({
      x: rand(),
      y: 0.15 + rand() * 0.72,
      r: 1.2 + rand() * 3,
      alpha: 0.12 + rand() * 0.3,
      drift: 0.2 + rand() * 0.8,
      phase: rand() * Math.PI * 2
    });
  }

  updateGardenMeta();
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  state.dpr = Math.min(window.devicePixelRatio || 1, 2);
  state.width = rect.width;
  state.height = rect.height;
  canvas.width = Math.round(rect.width * state.dpr);
  canvas.height = Math.round(rect.height * state.dpr);
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  draw(state.time);
}

function drawBackground(palette, t) {
  const { skyTop, skyMid, skyBottom, glow, accent } = palette;
  const sky = ctx.createLinearGradient(0, 0, 0, state.height);
  sky.addColorStop(0, skyTop);
  sky.addColorStop(0.45, skyMid);
  sky.addColorStop(1, skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, state.width, state.height);

  const orbX = state.width * 0.72;
  const orbY = state.height * 0.2;
  const orb = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, state.width * 0.3);
  orb.addColorStop(0, glow);
  orb.addColorStop(0.5, accent + '55');
  orb.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = orb;
  ctx.fillRect(0, 0, state.width, state.height);

  for (const star of state.stars) {
    const flicker = 0.35 + Math.sin(t * 0.001 + star.phase) * 0.25 + star.alpha * 0.4;
    ctx.fillStyle = `${palette.star}${Math.floor(255 * clamp(flicker, 0.2, 1)).toString(16).padStart(2, '0')}`;
    ctx.beginPath();
    ctx.arc(star.x * state.width, star.y * state.height, star.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHills(palette) {
  const { hillA, hillB, ground } = palette;
  ctx.fillStyle = hillA;
  ctx.beginPath();
  ctx.moveTo(0, state.height * 0.78);
  ctx.quadraticCurveTo(state.width * 0.28, state.height * 0.63, state.width * 0.52, state.height * 0.76);
  ctx.quadraticCurveTo(state.width * 0.82, state.height * 0.9, state.width, state.height * 0.72);
  ctx.lineTo(state.width, state.height);
  ctx.lineTo(0, state.height);
  ctx.fill();

  ctx.fillStyle = hillB;
  ctx.beginPath();
  ctx.moveTo(0, state.height * 0.84);
  ctx.quadraticCurveTo(state.width * 0.23, state.height * 0.72, state.width * 0.49, state.height * 0.85);
  ctx.quadraticCurveTo(state.width * 0.74, state.height * 0.97, state.width, state.height * 0.82);
  ctx.lineTo(state.width, state.height);
  ctx.lineTo(0, state.height);
  ctx.fill();

  ctx.fillStyle = ground;
  ctx.fillRect(0, state.height * 0.88, state.width, state.height * 0.12);
}

function drawParticles(palette, t) {
  for (const particle of state.glowParticles) {
    const x = particle.x * state.width + Math.sin(t * 0.0007 + particle.phase) * 18;
    const y = particle.y * state.height + Math.cos(t * 0.0008 + particle.phase) * 10;
    ctx.beginPath();
    ctx.fillStyle = `${palette.highlight}${Math.floor(255 * particle.alpha).toString(16).padStart(2, '0')}`;
    ctx.arc(x, y, particle.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLeaf(x, y, length, rotation, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(length * 0.6, -length * 0.25, length, 0);
  ctx.quadraticCurveTo(length * 0.6, length * 0.25, 0, 0);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawStem(flower, palette, t) {
  const sx = flower.x * state.width;
  const sy = flower.baseY * state.height;
  const stemHeight = flower.stemHeight * state.height;
  const sway = Math.sin(t * 0.0012 * (state.drift + 0.3) + flower.phase) * 22 * Math.max(0.4, state.drift);
  const topX = sx + sway;
  const topY = sy - stemHeight;

  ctx.strokeStyle = palette.stem;
  ctx.lineWidth = Math.max(2, Math.min(6, state.height * 0.004));
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.quadraticCurveTo(sx + sway * 0.35, sy - stemHeight * 0.45, topX, topY);
  ctx.stroke();

  for (let i = 0; i < flower.leafCount; i++) {
    const leafProgress = 0.2 + (i / flower.leafCount) * 0.7;
    const lx = sx + sway * leafProgress * 0.8;
    const ly = sy - stemHeight * leafProgress;
    const length = 16 + flower.size * 8;
    drawLeaf(lx, ly, length, (i % 2 === 0 ? 1 : -1) * (0.8 + flower.rotation), palette.leaf);
  }
}

function drawBloom(flower, palette, t) {
  const x = flower.x * state.width + Math.sin(t * 0.0014 + flower.phase) * 10 * state.drift;
  const y = flower.baseY * state.height - flower.stemHeight * state.height;
  const size = flower.size * Math.min(state.width, state.height) * 0.08 * state.bloom * 1.15;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(flower.rotation + Math.sin(t * 0.001 + flower.phase) * 0.22);

  const bloomGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 3.2);
  bloomGlow.addColorStop(0, `${flower.color}dd`);
  bloomGlow.addColorStop(0.7, `${flower.color}22`);
  bloomGlow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = bloomGlow;
  ctx.beginPath();
  ctx.arc(0, 0, size * 2.4, 0, Math.PI * 2);
  ctx.fill();

  if (flower.species === 'star') {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      const r = i % 2 === 0 ? size : size * 0.42;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = flower.color;
    ctx.fill();
  } else if (flower.species === 'lotus') {
    for (let i = 0; i < flower.petals; i++) {
      const angle = (Math.PI * 2 / flower.petals) * i;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(size * 0.55, -size * 0.25, size * 0.44, size * 0.72, 0, 0, Math.PI * 2);
      ctx.fillStyle = flower.color;
      ctx.fill();
      ctx.restore();
    }
  } else if (flower.species === 'orb') {
    for (let i = 0; i < flower.petals; i++) {
      const angle = (Math.PI * 2 / flower.petals) * i;
      const xP = Math.cos(angle) * size * 0.8;
      const yP = Math.sin(angle) * size * 0.8;
      ctx.beginPath();
      ctx.arc(xP, yP, size * 0.58, 0, Math.PI * 2);
      ctx.fillStyle = flower.color;
      ctx.fill();
    }
  } else {
    for (let i = 0; i < flower.petals; i++) {
      const angle = (Math.PI * 2 / flower.petals) * i;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, -size * 0.8, size * 0.3, size * 0.75, 0, 0, Math.PI * 2);
      ctx.fillStyle = flower.color;
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.beginPath();
  ctx.fillStyle = palette.highlight;
  ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = palette.accent;
  ctx.arc(size * 0.08, -size * 0.1, size * 0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawRipples() {
  for (const ripple of state.ripples) {
    const progress = (state.time - ripple.start) / 950;
    if (progress > 1) continue;
    const alpha = 1 - progress;
    ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.55})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ripple.x, ripple.y, progress * Math.max(state.width, state.height) * 0.26, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function draw() {
  if (!state.width || !state.height) return;

  const palette = palettes[state.palette];
  const t = state.time;
  drawBackground(palette, t);
  drawParticles(palette, t);
  drawHills(palette);

  for (const flower of state.flowers) {
    drawStem(flower, palette, t);
    drawBloom(flower, palette, t);
  }

  drawRipples();

  if (!state.paused) {
    requestAnimationFrame(frameLoop);
  }
}

function frameLoop(now) {
  state.time = now;
  draw();
}

function growAnother() {
  state.seed = Math.floor(Math.random() * 999999) + 1;
  createGarden();
  draw();
}

function pulse(x = state.width * 0.5, y = state.height * 0.52) {
  state.ripples.push({ x, y, start: state.time || performance.now() });
  if (state.paused) {
    state.paused = false;
    const motionBtn = document.querySelector('#motionBtn');
    motionBtn.setAttribute('aria-pressed', 'false');
    motionBtn.innerHTML = 'Ⅱ <span>Pause motion</span>';
    requestAnimationFrame(frameLoop);
  }
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
}

function syncControls() {
  densityInput.value = String(state.density);
  bloomInput.value = String(state.bloom);
  driftInput.value = String(state.drift);
  document.querySelector('#densityValue').textContent = String(state.density);
  document.querySelector('#bloomValue').textContent = `${state.bloom.toFixed(1)}×`;
  document.querySelector('#driftValue').textContent = `${state.drift.toFixed(1)}×`;

  setRangeProgress(densityInput);
  setRangeProgress(bloomInput);
  setRangeProgress(driftInput);
}

for (const range of [densityInput, bloomInput, driftInput]) {
  setRangeProgress(range);
  range.addEventListener('input', () => {
    setRangeProgress(range);
    state.density = Number(densityInput.value);
    state.bloom = Number(bloomInput.value);
    state.drift = Number(driftInput.value);

    document.querySelector('#densityValue').textContent = String(state.density);
    document.querySelector('#bloomValue').textContent = `${state.bloom.toFixed(1)}×`;
    document.querySelector('#driftValue').textContent = `${state.drift.toFixed(1)}×`;

    createGarden();
    draw();
  });
}

document.querySelectorAll('.palette-button').forEach((button) => {
  button.addEventListener('click', () => {
    state.palette = button.dataset.palette;
    document.querySelectorAll('.palette-button').forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    createGarden();
    draw();
  });
});

document.querySelector('#rerollBtn').addEventListener('click', growAnother);
document.querySelector('#pulseBtn').addEventListener('click', () => pulse());
document.querySelector('#motionBtn').addEventListener('click', () => {
  state.paused = !state.paused;
  const motionBtn = document.querySelector('#motionBtn');
  motionBtn.setAttribute('aria-pressed', String(state.paused));
  motionBtn.innerHTML = state.paused ? '▶ <span>Resume motion</span>' : 'Ⅱ <span>Pause motion</span>';

  if (state.paused) {
    draw();
  } else {
    requestAnimationFrame(frameLoop);
  }
});

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect();
  pulse(event.clientX - rect.left, event.clientY - rect.top);
});

document.querySelector('#saveBtn').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `pixel-garden-${state.seed}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast('Your garden is saved as a PNG.');
});

document.querySelector('#shareBtn').addEventListener('click', async () => {
  const url = new URL(location.href);
  url.searchParams.set('seed', String(state.seed));
  url.searchParams.set('mood', state.palette);
  const shareText = url.toString();
  try {
    await navigator.clipboard.writeText(shareText);
    showToast('Garden link copied — share your world.');
  } catch {
    showToast(`Copy this link: ${shareText}`);
  }
});

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && !['INPUT', 'BUTTON'].includes(document.activeElement.tagName)) {
    event.preventDefault();
    growAnother();
  }
});

window.addEventListener('resize', resize);
window.addEventListener('load', () => {
  syncControls();
  createGarden();
  resize();
  requestAnimationFrame(frameLoop);
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (reducedMotion.matches) {
  state.paused = true;
  document.querySelector('#motionBtn').innerHTML = '▶ <span>Resume motion</span>';
}

reducedMotion.addEventListener?.('change', (event) => {
  if (event.matches && !state.paused) {
    state.paused = true;
    document.querySelector('#motionBtn').innerHTML = '▶ <span>Resume motion</span>';
    draw();
  }
});
