import { STATUSES } from '../config.js';
import { speakerRange, languagesLabel } from '../format.js';
import { statusIcon } from '../icons.js';

export const question = 'How endangered is each one?';

// Most at risk first, matching the Speakers view (fewest speakers at the top),
// so names travel a short way between the two.
const ORDER = [...STATUSES].reverse();

export function layout(stage, langs, els) {
  const frag = document.createDocumentFragment();

  for (const status of ORDER) {
    const members = langs.filter((l) => l.status === status);
    const section = document.createElement('section');
    section.className = 'group';
    const headingId = `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
    section.setAttribute('aria-labelledby', headingId);
    section.innerHTML = `
      <header class="group__head group__head--icon">
        ${statusIcon(status)}
        <div>
          <h2 class="group__title" id="${headingId}">${status}</h2>
          <p class="group__meta">${languagesLabel(members.length)} · ${speakerRange(members)}</p>
        </div>
      </header>`;

    const countries = [...new Set(members.map((l) => l.country))].sort((a, b) => a.localeCompare(b));
    for (const country of countries) {
      const row = document.createElement('div');
      row.className = 'country';
      row.innerHTML = `<h3 class="country__name">${country}</h3><div class="flow"></div>`;
      const flow = row.querySelector('.flow');
      members
        .filter((l) => l.country === country)
        .sort((a, b) => a.speakers - b.speakers)
        .forEach((l) => flow.append(els.get(l.id)));
      section.append(row);
    }
    frag.append(section);
  }

  stage.replaceChildren(frag);
}
