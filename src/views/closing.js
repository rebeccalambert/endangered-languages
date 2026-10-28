import { closing } from '../discoveries.js';

// Placeholder question copy; to be confirmed.
export const question = 'What do the numbers hold?';

// The ending: the closing lines, then every name together with no grouping at all.
export function layout(stage, langs, els) {
  const { lead, last } = closing(langs);

  const words = document.createElement('section');
  words.className = 'closing';
  words.innerHTML = '<p class="closing__lead"></p><p class="closing__last"></p>';
  words.querySelector('.closing__lead').textContent = lead;
  words.querySelector('.closing__last').textContent = last;

  const all = document.createElement('section');
  all.className = 'group';
  const flow = document.createElement('div');
  flow.className = 'flow';
  [...langs]
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((lang) => flow.append(els.get(lang.id)));
  all.append(flow);

  stage.replaceChildren(words, all);
}
