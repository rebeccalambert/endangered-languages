import { speakerRange, languagesLabel } from '../format.js';

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

// One row per language so these never flow together. `showFamily` adds the recorded family beside each name.
function soloSection(title, members, els, { showFamily = true, showRange = false } = {}) {
  const meta = languagesLabel(members.length) + (showRange ? ` · ${speakerRange(members)}` : '');
  const el = section(title, meta);
  for (const lang of members) {
    const row = document.createElement('div');
    row.className = 'solo';
    row.append(els.get(lang.id));
    if (showFamily) {
      const family = document.createElement('span');
      family.className = 'solo__family';
      family.textContent = lang.language_family;
      row.append(family);
    }
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
  frag.append(soloSection('Only one from its family in this collection', single.sort(bySpeakers), els));
  // Compared like a family: same heading details, names only on each row.
  const isolates = langs.filter((l) => l.isolate).sort(bySpeakers);
  frag.append(soloSection('Classed as isolates', isolates, els, { showFamily: false, showRange: true }));

  stage.replaceChildren(frag);
}
