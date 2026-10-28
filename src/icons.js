// Nine line icons for the "rooms & places" bands. 24×24, 1.5 stroke, currentColor.
const svg = (body) =>
  `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;

export const ICONS = {
  // No living speakers: a crossed-out speech bubble.
  none: svg('<path d="M6 4.5h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4 3.5v-3.5H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z"/><path d="M3 3l18 18"/>'),
  // One person.
  person: svg('<circle cx="12" cy="7" r="3.25"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/>'),
  // A dinner table with places set.
  table: svg('<path d="M3 11h18"/><path d="M5 11v9M19 11v9"/><circle cx="8" cy="8" r="1.6"/><circle cx="16" cy="8" r="1.6"/><path d="M12 6.5v3"/>'),
  // A bus.
  bus: svg('<rect x="3" y="5" width="18" height="12" rx="2.5"/><path d="M3 11h18"/><path d="M9 5v6M15 5v6"/><circle cx="7.5" cy="19" r="1.6"/><circle cx="16.5" cy="19" r="1.6"/>'),
  // A school house with a bell tower.
  school: svg('<path d="M3 21V11l9-5 9 5v10"/><path d="M12 6V2.5h3"/><path d="M9.5 21v-5h5v5"/><circle cx="12" cy="11.5" r="1.5"/><path d="M2 21h20"/>'),
  // A village: three houses.
  village: svg('<path d="M2 21v-6l3.5-3 3.5 3v6"/><path d="M8.5 21v-8l3.5-3 3.5 3v8"/><path d="M15 21v-6l3.5-3 3.5 3v6"/><path d="M1.5 21h21"/>'),
  // A stadium with an arched roof.
  stadium: svg('<path d="M2 20V11c3-4 17-4 20 0v9"/><path d="M2 20h20"/><path d="M2 11h20"/><path d="M6.5 11v9M12 11v9M17.5 11v9"/>'),
  // A city skyline with lit windows, so it doesn't read as a bar chart.
  city: svg('<path d="M4 21V9h5v12"/><path d="M9 21V4h6v17"/><path d="M15 21v-9h5v9"/><path d="M2 21h20"/><path d="M11 7.5h.01M13 7.5h.01M11 11h.01M13 11h.01M11 14.5h.01M13 14.5h.01M6.5 12.5h.01M6.5 16h.01M17.5 15h.01M17.5 18h.01" stroke-width="2"/>'),
  // A metropolis: skyline running to the horizon, with lit windows like the city.
  metropolis: svg('<path d="M1.5 21V13h3v8"/><path d="M4.5 21V8h3.5v13"/><path d="M8 21V11h3v10"/><path d="M11 21V3.5h3.5V21"/><path d="M14.5 21V9.5h3V21"/><path d="M17.5 21v-7h3v7"/><path d="M1 21h22"/><path d="M3 16.5h.01M6.25 11h.01M6.25 14.5h.01M6.25 18h.01M9.5 14h.01M9.5 17.5h.01M12.75 6.5h.01M12.75 10h.01M12.75 13.5h.01M12.75 17h.01M16 12.5h.01M16 16h.01M19 17h.01" stroke-width="2"/>'),
};

// Status icons: four signal bars, filled from Vulnerable (4) down to Critically Endangered (1).
// Extinct has none filled: all four faint, like the hollow ring used for extinct names.
const LEVELS = {
  Vulnerable: 4,
  'Definitely Endangered': 3,
  'Severely Endangered': 2,
  'Critically Endangered': 1,
  Extinct: 0,
};

function bars(filled, label) {
  const body = [6, 10, 14, 18]
    .map((h, i) => {
      // Unfilled bars are drawn faint, so an empty bar reads as empty even at text size.
      const look = i < filled ? 'fill="currentColor"' : 'fill="none" stroke-opacity="0.35"';
      return `<rect x="${3 + i * 5}" y="${20 - h}" width="3" height="${h}" rx="0.75" ${look}/>`;
    })
    .join('');
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"';
  return `<svg class="icon icon--status" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" ${a11y}>${body}</svg>`;
}

// Decorative next to a visible status title; labelled when it stands in for the status on its own.
export const statusIcon = (status, { labelled = false } = {}) => bars(LEVELS[status], labelled ? status : null);
