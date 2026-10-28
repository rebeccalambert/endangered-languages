import { STATUSES } from './config.js';

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const word = (n) => WORDS[n] ?? String(n);
const cap = (s) => s[0].toUpperCase() + s.slice(1);

// Discovery 1: the speaker count shared by languages whose statuses sit furthest apart.
// Pure, so the verify script can print the same result.
export function sameCountDifferentLabel(langs) {
  const byCount = new Map();
  for (const l of langs) byCount.set(l.speakers, [...(byCount.get(l.speakers) ?? []), l]);

  let best = null;
  for (const [count, group] of byCount) {
    const ranks = group.map((l) => STATUSES.indexOf(l.status));
    const gap = Math.max(...ranks) - Math.min(...ranks);
    if (gap > 0 && (!best || gap > best.gap)) best = { count, group, gap };
  }

  const tally = new Map();
  for (const l of best.group) tally.set(l.status, (tally.get(l.status) ?? 0) + 1);
  const [majority, majorityCount] = [...tally].sort((a, b) => b[1] - a[1])[0];
  const outliers = best.group.filter((l) => l.status !== majority);

  // Approved wording: "Four languages list 500 speakers. Three share a label; one doesn't."
  const rest = outliers.length === 1 ? "one doesn't" : `${word(outliers.length)} don't`;
  const text =
    `${cap(word(best.group.length))} languages list ${best.count.toLocaleString('en-US')} speakers. ` +
    `${cap(word(majorityCount))} share a label; ${rest}.`;

  return { count: best.count, ids: best.group.map((l) => l.id), outlierIds: outliers.map((l) => l.id), text };
}
