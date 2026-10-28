import { BANDS } from './config.js';

// Haida's family is recorded as "Haida (isolate)", so match on the word, not the exact string.
export const isIsolate = (lang) => /isolate/i.test(lang.language_family);

export const bandFor = (speakers) => BANDS.find((b) => speakers <= b.max);

// Pure so the verify script can run the exact same logic in Node.
// Stable ids let the same element be tracked across every view.
export function prepare(raw) {
  return raw.map((lang, i) => ({
    ...lang,
    id: `lang-${i}`,
    isolate: isIsolate(lang),
    band: bandFor(lang.speakers).id,
  }));
}
