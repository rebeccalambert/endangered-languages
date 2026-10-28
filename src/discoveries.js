import { BANDS, STATUSES } from './config.js';

// Every discovery is computed from the records here; nothing is hardcoded.
// Pure, so the verify script prints exactly what the page shows.

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

  const typicalCount = (s) => Math.round(10 ** typical.get(s));
  const notes = {};
  for (const l of living) {
    const v = Math.log10(l.speakers);
    const nearest = labels.reduce((a, b) => (Math.abs(v - typical.get(b)) < Math.abs(v - typical.get(a)) ? b : a));
    if (nearest === l.status) continue;
    // Shown in the panel when the language is opened from the Status view.
    // "Closer" is measured on a log scale (proportionally), not by subtraction.
    const near = typicalCount(nearest);
    const own = typicalCount(l.status);
    notes[l.id] =
      `${l.name} has ${l.speakers.toLocaleString('en-US')} ${l.speakers === 1 ? 'speaker' : 'speakers'}. ` +
      `That's closer to the typical ${nearest} count (${near.toLocaleString('en-US')}) ` +
      `than to the typical ${l.status} count (${own.toLocaleString('en-US')}).`;
  }
  const ids = Object.keys(notes);

  return {
    ids,
    notes,
    typical: Object.fromEntries([...typical].map(([s, v]) => [s, Math.round(10 ** v)])),
    text:
      `${ids.length} of ${living.length} living languages have a speaker count ` +
      `closer to another label's typical number. Speaker count alone doesn't set the label. ` +
      `Tap a rust name to see which.`,
  };
}

// Family: whether relatives share a status. The isolates are compared as one group too.
// Rust goes to each group's least common status; when every status appears equally often, that's all of them.
export function familyStatuses(langs) {
  const groups = new Map();
  for (const l of langs) {
    const key = l.isolate ? ISOLATES : l.language_family;
    groups.set(key, [...(groups.get(key) ?? []), l]);
  }

  const ids = [];
  let families = 0;
  let mixed = 0;
  for (const [key, members] of groups) {
    if (members.length < 2) continue;
    const tally = new Map();
    for (const l of members) tally.set(l.status, (tally.get(l.status) ?? 0) + 1);
    if (key !== ISOLATES) {
      families++;
      if (tally.size > 1) mixed++;
    }
    if (tally.size < 2) continue;
    const least = Math.min(...tally.values());
    for (const l of members) if (tally.get(l.status) === least) ids.push(l.id);
  }

  const isolatesMixed = new Set((groups.get(ISOLATES) ?? []).map((l) => l.status)).size > 1;
  return {
    ids,
    families,
    mixed,
    text:
      `Bars show each language's status. ${mixed} of ${families} families here have members with different statuses` +
      `${isolatesMixed ? ", and the isolates aren't all one status either" : ''}. ` +
      `Rust marks each family's least common status.`,
  };
}

const ISOLATES = Symbol('isolates');

// Closing: one line back to each view, then what they add up to.
export function closing(langs) {
  const living = langs.filter((l) => l.speakers > 0);
  const bus = BANDS.find((b) => b.id === 'bus');
  const onABus = living.filter((l) => l.speakers <= bus.max).length;
  const outliers = closerToAnotherLabel(langs).ids.length;
  const kin = familyStatuses(langs);
  return {
    recap: [
      { view: 'Speakers', text: `${onABus} living languages have few enough speakers to fit on a bus.` },
      {
        view: 'Status',
        text: `${outliers} of ${living.length} have a speaker count closer to another label's typical number than to their own.`,
      },
      { view: 'Family', text: `${kin.mixed} of ${kin.families} families have members with different statuses.` },
    ],
    // The data shows the label isn't set by count alone; it doesn't say what else sets it, so neither does this.
    lead: 'How endangered a language is depends on more than how many people speak it. The number is only part of the story.',
    // The phrase in the lead that carries the accent.
    emphasis: 'depends on more',
  };
}
