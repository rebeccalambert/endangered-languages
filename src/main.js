// Only the Latin subsets: they cover every name in the dataset, including ǂ and |.
import '@fontsource/noto-serif/latin-400.css';
import '@fontsource/noto-serif/latin-ext-400.css';
import '@fontsource/noto-serif/latin-400-italic.css';
import '@fontsource/noto-serif/latin-ext-400-italic.css';
import '@fontsource/noto-sans/latin-400.css';
import '@fontsource/noto-sans/latin-ext-400.css';
import './styles.css';
import { gsap } from 'gsap';
import { TITLE, VIEW_ORDER } from './config.js';
import { languages } from './data.js';
import { compact } from './format.js';
import { openPanel } from './panel.js';
import { createStepper } from './stepper.js';
import { transition, prefersReducedMotion } from './transition.js';
import { sameCountDifferentLabel } from './discoveries.js';
import * as speakers from './views/speakers.js';
import * as status from './views/status.js';

const VIEWS = { speakers, status };

const stage = document.getElementById('stage');
const callout = document.getElementById('callout');
const state = { view: null, selected: null };

// One button per language, created once and moved between views.
const els = new Map(
  languages.map((lang) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'name';
    btn.id = lang.id;
    btn.dataset.id = lang.id;
    btn.classList.toggle('is-extinct', lang.speakers === 0);
    btn.innerHTML = '<span class="name__label"></span><span class="name__count"></span>';
    btn.querySelector('.name__label').textContent = lang.name;
    btn.querySelector('.name__count').textContent = compact(lang.speakers);
    return [lang.id, btn];
  }),
);
const names = [...els.values()];
const byId = new Map(languages.map((l) => [l.id, l]));

// Discoveries are computed once from the data; each belongs to one view.
const DISCOVERIES = {
  status: sameCountDifferentLabel(languages),
};

function select(id) {
  if (state.selected) els.get(state.selected).classList.remove('is-selected');
  state.selected = id;
  els.get(id).classList.add('is-selected');
  openPanel(byId.get(id));
}

function hideDiscovery() {
  gsap.killTweensOf(callout);
  callout.hidden = true;
  names.forEach((el) => el.classList.remove('is-discovery'));
}

function showDiscovery(view) {
  const d = DISCOVERIES[view];
  if (!d) return;
  d.ids.forEach((id) => els.get(id).classList.add('is-discovery'));
  callout.querySelector('.callout__text').textContent = d.text;
  callout.hidden = false;
  if (!prefersReducedMotion()) gsap.from(callout, { y: 16, opacity: 0, duration: 0.4, ease: 'power2.out' });
}

// Where to land after a view change: the selected name if there is one, otherwise the top of the stage.
function scrollTarget() {
  const el = state.selected && els.get(state.selected);
  if (el) return el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.4;
  return stage.getBoundingClientRect().top + window.scrollY - 16;
}

function showView(id) {
  if (id === state.view) return;
  const first = state.view === null;
  state.view = id;
  hideDiscovery();
  stepper.sync(VIEWS[id].question);

  const change = () => {
    VIEWS[id].layout(stage, languages, els);
    if (!first) window.scrollTo({ top: Math.max(0, scrollTarget()), behavior: 'instant' });
  };

  if (first) {
    change();
    return;
  }

  transition(names, change, () => {
    if (state.view === id) showDiscovery(id);
  });
  if (!prefersReducedMotion()) {
    gsap.from(stage.querySelectorAll('.band__head, .group__head, .country__name'), {
      opacity: 0,
      duration: 0.4,
      delay: 0.45,
    });
  }
}

const stepper = createStepper({
  order: VIEW_ORDER,
  isBuilt: (id) => id in VIEWS,
  onGo: showView,
});

document.title = TITLE;
document.getElementById('title').textContent = TITLE;
document.getElementById('lede').textContent =
  `${languages.length} languages. The same names, seen through different questions.`;
document.getElementById('footer').textContent =
  `These are the ${languages.length} records in this collection, not a global census.`;

stage.addEventListener('click', (e) => {
  const btn = e.target.closest('.name');
  if (btn) select(btn.dataset.id);
});
callout.querySelector('.callout__close').addEventListener('click', hideDiscovery);

showView(VIEW_ORDER[0].id);
