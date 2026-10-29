// Prints every number the page or README relies on, computed from the JSON.
// Run: npm run verify
import { readFileSync } from 'node:fs';
import { prepare } from '../src/prepare.js';
import { BANDS, STATUSES } from '../src/config.js';
import { compact } from '../src/format.js';
import { closerToAnotherLabel, familyStatuses, closing } from '../src/discoveries.js';

const raw = JSON.parse(readFileSync(new URL('../dataset/endangered-languages.json', import.meta.url)));
const langs = prepare(raw);

const count = (arr, key) =>
  arr.reduce((m, x) => m.set(x[key], (m.get(x[key]) ?? 0) + 1), new Map());
const fmt = (n) => n.toLocaleString('en-US');
const line = (label, value) => console.log(`${label.padEnd(34)} ${value}`);

const FIELDS = ['name', 'language_family', 'country', 'region', 'speakers', 'status', 'latitude', 'longitude'];
const missing = langs.filter((l) => FIELDS.some((f) => l[f] === undefined || l[f] === null || l[f] === ''));

console.log('\n— Shape');
line('Records', langs.length);
line('Records missing a field', missing.length);
line('Families', count(langs, 'language_family').size);
line('Countries', count(langs, 'country').size);
line('United States records', langs.filter((l) => l.country === 'United States').length);

console.log('\n— Status');
for (const s of STATUSES) {
  const sp = langs.filter((l) => l.status === s).map((l) => l.speakers);
  line(s, `${sp.length}  (speakers ${fmt(Math.min(...sp))}–${fmt(Math.max(...sp))})`);
}
const crit = langs.filter((l) => l.status === 'Critically Endangered');
line('Critically Endangered, combined', fmt(crit.reduce((t, l) => t + l.speakers, 0)));

console.log('\n— Rooms & places bands');
for (const b of BANDS) line(`≤ ${b.max === Infinity ? '∞' : fmt(b.max)}  ${b.title}`, langs.filter((l) => l.band === b.id).length);

console.log('\n— Status: closer to another label (log-scale medians)');
const outliers = closerToAnotherLabel(langs);
for (const [s, n] of Object.entries(outliers.typical)) line(`  typical ${s}`, n.toLocaleString('en-US'));
const byId = new Map(langs.map((l) => [l.id, l]));
line('Flagged', outliers.ids.length);
for (const id of outliers.ids) console.log(`  ${outliers.notes[id]}`);
line('Callout (as shown)', outliers.text);

console.log('\n— Isolates');
const iso = langs.filter((l) => l.isolate);
const isoCritSev = iso.filter((l) => ['Critically Endangered', 'Severely Endangered'].includes(l.status));
line('Isolates', iso.length);
line('…Critically or Severely Endangered', isoCritSev.length);
line('…with exactly 1 speaker', iso.filter((l) => l.speakers === 1).map((l) => l.name).join(', '));

const kin = familyStatuses(langs);
line('Family rust (least common status)', kin.ids.length);
line('  names', kin.ids.map((id) => byId.get(id).name).join(', '));
line('Family callout (as shown)', kin.text);

console.log('\n— Closing');
const end = closing(langs);
for (const r of end.recap) line(`Recap · ${r.view}`, r.text);
line('Lead (as shown)', end.lead);
line('Emphasis', end.emphasis);

console.log('\n— Totals');
const total = langs.reduce((t, l) => t + l.speakers, 0);
const sorted = [...langs].sort((a, b) => a.speakers - b.speakers);
const median = (sorted[51].speakers + sorted[52].speakers) / 2;
line('All speakers, combined', fmt(total));
line('Median speakers', fmt(median));
line('100 or fewer speakers', langs.filter((l) => l.speakers <= 100).length);

console.log('\n— Compact counts (5K, 7 mil) lose no precision');
const unpack = (s) => (s.endsWith(' mil') ? parseFloat(s) * 1e6 : s.endsWith('K') ? parseFloat(s) * 1e3 : Number(s));
const lossy = langs.filter((l) => Math.round(unpack(compact(l.speakers))) !== l.speakers);
line('Records that would round', lossy.length ? lossy.map((l) => `${l.name} ${compact(l.speakers)}`).join(', ') : 0);

if (missing.length || lossy.length) process.exitCode = 1;
console.log('');
