// Display helpers. Every value shown is derived from the record; nothing is rounded away.

// Compact counts for the flowing name layout: 500, 5K, 9.5K, 7 mil.
export function compact(n) {
  if (n >= 1_000_000) return `${trim(n / 1_000_000)} mil`;
  if (n >= 1_000) return `${trim(n / 1_000)}K`;
  return String(n);
}

const trim = (x) => String(Math.round(x * 10) / 10);

export const full = (n) => n.toLocaleString('en-US');

export const speakersLabel = (n) => (n === 1 ? '1 speaker' : `${full(n)} speakers`);

// Coordinates as recorded (JSON already drops trailing zeros), with hemisphere.
export const coord = (lat, lon) =>
  `${Math.abs(lat)}° ${lat < 0 ? 'S' : 'N'}, ${Math.abs(lon)}° ${lon < 0 ? 'W' : 'E'}`;

// "0–3,500,000 speakers", or "0 speakers" when every member has the same count.
export function speakerRange(members) {
  const counts = members.map((l) => l.speakers);
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  return min === max ? `${full(min)} speakers` : `${full(min)}–${full(max)} speakers`;
}

export const languagesLabel = (n) => (n === 1 ? '1 language' : `${n} languages`);
