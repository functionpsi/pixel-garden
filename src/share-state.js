// A shared garden URL captures the entire recipe, not just its seed and mood.
// This module runs before main.js so shared control values initialize the canvas.
const params = new URLSearchParams(window.location.search);
const controls = [
  ['density', 'density'],
  ['bloom', 'bloom'],
  ['drift', 'breeze']
];

for (const [id, key] of controls) {
  const input = document.getElementById(id);
  const value = Number(params.get(key));
  if (params.has(key) && Number.isFinite(value)) {
    const min = Number(input.min);
    const max = Number(input.max);
    input.value = String(Math.min(max, Math.max(min, value)));
  }
}

const requestedMood = params.get('mood');
if (['sunrise', 'forest', 'cosmic', 'neon'].includes(requestedMood)) {
  document.querySelectorAll('.palette-button').forEach((button) => {
    const active = button.dataset.palette === requestedMood;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function saveRecipeToURL() {
  const url = new URL(window.location.href);
  url.searchParams.set('density', document.getElementById('density').value);
  url.searchParams.set('bloom', document.getElementById('bloom').value);
  url.searchParams.set('breeze', document.getElementById('drift').value);
  history.replaceState({}, '', url);
}

for (const [id] of controls) {
  document.getElementById(id).addEventListener('input', saveRecipeToURL);
}

document.querySelectorAll('.palette-button').forEach((button) => {
  button.addEventListener('click', () => {
    const url = new URL(window.location.href);
    url.searchParams.set('mood', button.dataset.palette);
    history.replaceState({}, '', url);
  });
});
