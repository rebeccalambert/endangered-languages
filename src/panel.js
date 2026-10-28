import { gsap } from 'gsap';
import { BANDS } from './config.js';
import { full, coord } from './format.js';

const dialog = document.getElementById('panel');
const body = dialog.querySelector('.panel__body');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const desktop = window.matchMedia('(min-width: 768px)');
let onClose = null;

// Bottom sheet on phones, side card on wider screens.
const offscreen = () => (desktop.matches ? { xPercent: 105 } : { yPercent: 105 });

function row(label, value) {
  return `<div class="panel__row"><dt>${label}</dt><dd>${value}</dd></div>`;
}

// `tracked`: whether this language is the one being followed through the views.
// `onTrack`: toggles tracking. `onClosed`: runs once the panel has closed, however it was closed.
export function openPanel(lang, { tracked, onTrack, onClosed }) {
  const band = BANDS.find((b) => b.id === lang.band);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

  body.innerHTML = `
    <h2 class="panel__name${lang.speakers === 0 ? ' is-extinct' : ''}" id="panel-title">${esc(lang.name)}</h2>
    <p class="panel__room">${band.title}</p>
    <dl class="panel__fields">
      ${row('Speakers', full(lang.speakers))}
      ${row('Status', esc(lang.status))}
      ${row('Family', esc(lang.language_family))}
      ${row('Country', esc(lang.country))}
      ${row('Region', esc(lang.region))}
      ${row('Coordinates', coord(lang.latitude, lang.longitude))}
    </dl>
    <button type="button" class="panel__track${tracked ? ' is-tracked' : ''}" aria-pressed="${tracked}">
      ${tracked ? 'Stop tracking' : 'Track this language'}
    </button>`;
  body.querySelector('.panel__track').addEventListener('click', onTrack);
  onClose = onClosed;

  const wasOpen = dialog.open;
  if (!wasOpen) dialog.showModal();
  gsap.killTweensOf(dialog);
  if (reduceMotion.matches || wasOpen) {
    gsap.set(dialog, { xPercent: 0, yPercent: 0 });
  } else {
    gsap.fromTo(dialog, offscreen(), { xPercent: 0, yPercent: 0, duration: 0.45, ease: 'power3.out' });
  }
}

// Every way of closing (button, Esc, backdrop, Track) ends here, so clean-up runs exactly once.
// It doesn't wait for the dialog's own "close" event, which can arrive late.
function finishClose() {
  dialog.close();
  const done = onClose;
  onClose = null;
  done?.();
}

export function closePanel() {
  if (!dialog.open) return;
  gsap.killTweensOf(dialog);
  if (reduceMotion.matches) return finishClose();
  gsap.to(dialog, { ...offscreen(), duration: 0.3, ease: 'power2.in', onComplete: finishClose });
}
dialog.querySelector('.panel__close').addEventListener('click', closePanel);
// Esc: animate out instead of the instant native close.
dialog.addEventListener('cancel', (e) => {
  e.preventDefault();
  closePanel();
});
// A tap on the backdrop lands on the dialog element itself.
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) closePanel();
});
