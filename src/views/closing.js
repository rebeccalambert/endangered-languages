import { closing } from '../discoveries.js';

export const question = 'What do the numbers say?';

// The ending: one line back to each view, the conclusion, then every name together with no grouping.
export function layout(stage, langs, els) {
  const { recap, lead, emphasis } = closing(langs);

  const words = document.createElement('section');
  words.className = 'closing';
  words.innerHTML = '<dl class="closing__recap"></dl><p class="closing__lead"></p>';
  for (const { view, text } of recap) {
    const row = document.createElement('div');
    row.className = 'closing__point';
    row.innerHTML = '<dt></dt><dd></dd>';
    row.querySelector('dt').textContent = view;
    row.querySelector('dd').textContent = text;
    words.querySelector('.closing__recap').append(row);
  }
  const [before, after] = lead.split(emphasis);
  const accent = document.createElement('span');
  accent.className = 'closing__emphasis';
  accent.textContent = emphasis;
  words.querySelector('.closing__lead').append(before, accent, after);

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
