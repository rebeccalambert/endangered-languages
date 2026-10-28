import { STATUSES } from './config.js';

// Every discovery is computed from the records here; nothing is hardcoded.
// Pure, so the verify script prints exactly what the page shows.

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const word = (n) => WORDS[n] ?? String(n);
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const list = (names) =>
  names.length < 3 ? names.join(' and ') : `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}`;

function median(values) {
  const s = [...values].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Status: living languages whose speaker count sits closer to another label's typical count
// than to their own. "Typical" is the median, compared on a log scale because counts run from 1 to 7,000,000.
export function closerToAnotherLabel(langs) {
  const living = langs.filter((l) => l.speakers > 0);
  const labels = STATUSES.filter((s) => living.some((l) => l.status === s));
  const typical = new Map(
    labels.map((s) => [s, median(living.filter((l) => l.status === s).map((l) => Math.log10(l.speakers)))]),
  );

  const flagged = living.filter((l) => {
    const v = Math.log10(l.speakers);
    const own = Math.abs(v - typical.get(l.status));
    return labels.some((s) => s !== l.status && Math.abs(v - typical.get(s)) < own);
  });

  return {
    ids: flagged.map((l) => l.id),
    typical: Object.fromEntries([...typical].map(([s, v]) => [s, Math.round(10 ** v)])),
    text:
      `Names in rust: ${flagged.length} of ${living.length} living languages have a speaker count ` +
      `closer to another label's typical number. Speaker count alone doesn't set the label.`,
  };
}

// Family: languages classed as isolates, and the ones with a single speaker.
export function isolates(langs) {
  const iso = langs.filter((l) => l.isolate);
  const severe = iso.filter((l) => ['Critically Endangered', 'Severely Endangered'].includes(l.status));
  const lone = iso.filter((l) => l.speakers === 1);
  return {
    ids: lone.map((l) => l.id),
    text:
      `${cap(word(iso.length))} languages here are classed as isolates. ` +
      `${cap(word(severe.length))} are Critically or Severely Endangered. ` +
      `In rust: ${list(lone.map((l) => l.name))}, ${lone.length === 1 ? 'one speaker' : 'one speaker each'}.`,
  };
}

// Closing: languages with no living speakers, and whether anything in their family is still spoken here.
export function closing(langs) {
  const silent = langs.filter((l) => l.speakers === 0);
  const hasLivingKin = (s) =>
    !s.isolate && langs.some((l) => l.language_family === s.language_family && l.speakers > 0);
  const withKin = silent.filter(hasLivingKin);
  const alone = silent.filter((s) => !hasLivingKin(s));
  return {
    lead:
      `${cap(word(silent.length))} languages here have fallen silent. ` +
      `${cap(word(withKin.length))} still have relatives that people speak today. ` +
      `${cap(word(alone.length))} have none in this collection: ${list(alone.map((l) => l.name))}.`,
    last: 'Every number here counts people who can still talk to each other.',
  };
}
