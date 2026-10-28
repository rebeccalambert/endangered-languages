import { gsap } from 'gsap';
import { BANDS } from './config.js';
import { full, coord } from './format.js';

const dialog = document.getElementById('panel');
const body = dialog.querySelector('.panel__body');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const desktop = window.matchMedia('(min-width: 768px)');

// Bottom sheet on phones, side card on wider screens.
const offscreen = () => (desktop.matches ? { xPercent: 105 } : { yPercent: 105 });

function row(label, value) {
  return `<div class="panel__row"><dt>${label}</dt><dd>${value}</dd></div>`;
}

export function openPanel(lang) {
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
    </dl>`;

  const wasOpen = dialog.open;
  if (!wasOpen) dialog.showModal();
  gsap.killTweensOf(dialog);
  if (reduceMotion.matches || wasOpen) {
    gsap.set(dialog, { xPercent: 0, yPercent: 0 });
  } else {
    gsap.fromTo(dialog, offscreen(), { xPercent: 0, yPercent: 0, duration: 0.45, ease: 'power3.out' });
  }
}

export function closePanel() {
  if (!dialog.open) return;
  gsap.killTweensOf(dialog);
  if (reduceMotion.matches) return dialog.close();
  gsap.to(dialog, { ...offscreen(), duration: 0.3, ease: 'power2.in', onComplete: () => dialog.close() });
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
