import { speakerRange, languagesLabel } from '../format.js';

// Placeholder question copy; to be confirmed.
export const question = 'Which languages are related?';

const bySpeakers = (a, b) => a.speakers - b.speakers;

function section(title, meta) {
  const el = document.createElement('section');
  el.className = 'group';
  el.innerHTML = `
    <header class="group__head">
      <h2 class="group__title"></h2>
      <p class="group__meta">${meta}</p>
    </header>`;
  el.querySelector('.group__title').textContent = title;
  return el;
}

// One row per language, with its recorded family beside it: these never flow together.
function soloSection(title, members, els) {
  const el = section(title, languagesLabel(members.length));
  el.classList.add('group--solo');
  for (const lang of members) {
    const row = document.createElement('div');
    row.className = 'solo';
    const family = document.createElement('span');
    family.className = 'solo__family';
    family.textContent = lang.language_family;
    row.append(els.get(lang.id), family);
    el.append(row);
  }
  return el;
}

// Families with two or more members, largest first; then languages that are alone in their family
// here; then the isolates, which the data classes as having no family at all.
export function layout(stage, langs, els) {
  const families = new Map();
  for (const lang of langs) {
    if (lang.isolate) continue;
    families.set(lang.language_family, [...(families.get(lang.language_family) ?? []), lang]);
  }
  const shared = [...families]
    .filter(([, members]) => members.length > 1)
    .sort(([a, am], [b, bm]) => bm.length - am.length || a.localeCompare(b));
  const single = [...families].filter(([, members]) => members.length === 1).map(([, [lang]]) => lang);

  const frag = document.createDocumentFragment();
  for (const [family, members] of shared) {
    const el = section(family, `${languagesLabel(members.length)} · ${speakerRange(members)}`);
    const flow = document.createElement('div');
    flow.className = 'flow';
    members.sort(bySpeakers).forEach((lang) => flow.append(els.get(lang.id)));
    el.append(flow);
    frag.append(el);
  }
  // Placeholder section titles; to be confirmed.
  frag.append(soloSection('Only one from its family in this collection', single.sort(bySpeakers), els));
  frag.append(soloSection('Classed as isolates', langs.filter((l) => l.isolate).sort(bySpeakers), els));

  stage.replaceChildren(frag);
}
