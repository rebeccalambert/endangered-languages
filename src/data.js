// The import attribute lets Node (the verify script) load this file as well as Vite.
import raw from '../dataset/endangered-languages.json' with { type: 'json' };
import { BANDS } from './config.js';

// Haida's family is recorded as "Haida (isolate)", so match on the word, not the exact string.
const isIsolate = (lang) => /isolate/i.test(lang.language_family);

const bandFor = (speakers) => BANDS.find((b) => speakers <= b.max);

// Pure so the verify script can run the exact same logic in Node.
// Stable ids let the same element be tracked across every view.
function prepare(raw) {
  return raw.map((lang, i) => ({
    ...lang,
    id: `lang-${i}`,
    isolate: isIsolate(lang),
    band: bandFor(lang.speakers).id,
  }));
}

export const languages = prepare(raw);
