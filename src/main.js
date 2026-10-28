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
import { openPanel, closePanel } from './panel.js';
import { createStepper } from './stepper.js';
import { transition, prefersReducedMotion } from './transition.js';
import { closerToAnotherLabel, isolates } from './discoveries.js';
import * as speakers from './views/speakers.js';
import * as status from './views/status.js';
import * as family from './views/family.js';
import * as closing from './views/closing.js';

const VIEWS = { speakers, status, family, closing };
const LAST = VIEW_ORDER.at(-1).id;

const stage = document.getElementById('stage');
const callout = document.getElementById('callout');
// viewing: the language open in the panel. tracked: the one followed through every view.
const state = { view: null, viewing: null, tracked: null };

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
  status: closerToAnotherLabel(languages),
  family: isolates(languages),
};

function view(id) {
  if (state.viewing) els.get(state.viewing).classList.remove('is-viewing');
  state.viewing = id;
  els.get(id).classList.add('is-viewing');
  openPanel(byId.get(id), {
    tracked: state.tracked === id,
    onTrack: () => {
      setTracked(state.tracked === id ? null : id);
      closePanel();
    },
    onClosed: () => {
      els.get(id).classList.remove('is-viewing');
      if (state.viewing === id) state.viewing = null;
    },
  });
}

function setTracked(id) {
  if (state.tracked) els.get(state.tracked).classList.remove('is-tracked');
  state.tracked = id;
  if (id) els.get(id).classList.add('is-tracked');
  stepper.track(id ? byId.get(id).name : null);
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

// Views have different heights. The stage is held at its old height while names move,
// then eased to the new height, so the page never jumps out from under the reader.
function holdHeight() {
  gsap.killTweensOf(stage);
  stage.style.minHeight = `${stage.offsetHeight}px`;
}

function naturalHeight() {
  const last = stage.lastElementChild;
  return last ? last.getBoundingClientRect().bottom - stage.getBoundingClientRect().top : 0;
}

// The furthest the page can scroll once the stage settles at its natural height.
function settledMaxScroll() {
  const doc = document.documentElement.scrollHeight - stage.offsetHeight + naturalHeight();
  return Math.max(0, doc - window.innerHeight);
}

function releaseHeight() {
  const natural = naturalHeight();
  const clear = () => (stage.style.minHeight = '');
  if (natural >= stage.offsetHeight || prefersReducedMotion()) return clear();
  gsap.to(stage, { minHeight: natural, duration: 0.45, ease: 'power2.out', onComplete: clear });
}

function showView(id) {
  if (id === state.view) return;
  const first = state.view === null;
  state.view = id;
  hideDiscovery();
  // Reaching the ending finishes the guided walk.
  if (id === LAST) stepper.unlock();
  stepper.sync(VIEWS[id].question);

  const change = () => VIEWS[id].layout(stage, languages, els);

  if (first) {
    change();
    return;
  }

  // Without a tracked language the page stays where the reader left it and only the names move.
  // With one, the page scrolls with it, more slowly, so the eye can follow it to its new place.
  // The ending always brings its closing lines into view.
  const ending = id === LAST;
  const followEl = state.tracked && !ending ? els.get(state.tracked) : null;
  const landAt = ending ? () => stage.getBoundingClientRect().top + window.scrollY - 16 : null;
  const duration = followEl || ending ? 1.3 : 0.85;
  holdHeight();
  transition(
    names,
    change,
    () => {
      releaseHeight();
      if (state.view === id) showDiscovery(id);
    },
    { duration, followEl, landAt, maxScroll: settledMaxScroll },
  );
  if (!prefersReducedMotion()) {
    gsap.from(stage.querySelectorAll('.band__head, .group__head, .country__name, .solo__family, .closing'), {
      opacity: 0,
      duration: 0.4,
      delay: duration * 0.55,
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
  if (btn) view(btn.dataset.id);
});
callout.querySelector('.callout__close').addEventListener('click', hideDiscovery);

showView(VIEW_ORDER[0].id);
