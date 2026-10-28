import { BANDS } from '../config.js';
import { ICONS } from '../icons.js';
import { full } from '../format.js';

export const question = 'How many people speak each one?';

// The human-scale part of each title is the point of this view, so it carries the accent:
// "About the size of <a dinner table>", or the whole title for the first two bands.
const LEAD = 'About the size of ';
const titleHtml = (title) =>
  title.startsWith(LEAD)
    ? `${LEAD}<span class="band__place">${title.slice(LEAD.length)}</span>`
    : `<span class="band__place">${title}</span>`;

function rangeText(band, i) {
  const min = i === 0 ? 0 : BANDS[i - 1].max + 1;
  if (band.max === min) return band.max === 1 ? '1 speaker' : `${full(band.max)} speakers`;
  if (band.max === Infinity) return `More than ${full(min - 1)} speakers`;
  return `${full(min)}–${full(band.max)} speakers`;
}

// Groups the shared name elements into the nine bands, fewest speakers first.
export function layout(stage, langs, els) {
  const frag = document.createDocumentFragment();

  BANDS.forEach((band, i) => {
    const members = langs
      .filter((l) => l.band === band.id)
      .sort((a, b) => a.speakers - b.speakers);

    const section = document.createElement('section');
    section.className = 'band';
    section.setAttribute('aria-labelledby', `band-${band.id}`);
    section.innerHTML = `
      <header class="band__head">
        ${ICONS[band.id]}
        <div>
          <h2 class="band__title" id="band-${band.id}">${titleHtml(band.title)}</h2>
          <p class="band__meta">${rangeText(band, i)} · ${members.length} ${members.length === 1 ? 'language' : 'languages'}</p>
        </div>
      </header>
      <div class="flow"></div>`;

    const flow = section.querySelector('.flow');
    for (const lang of members) flow.append(els.get(lang.id));
    frag.append(section);
  });

  stage.replaceChildren(frag);
}
