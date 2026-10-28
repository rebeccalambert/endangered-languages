// Single place for copy and tunable constants.

// Placeholder title; final title is decided at the end.
export const TITLE = 'What the Number Cannot Hold';

// "Rooms & places" bands for the Speakers view. `max` is inclusive.
// "About the size of…" capacities are editorial comparisons, not data.
export const BANDS = [
  { id: 'none', max: 0, title: 'No living speakers' },
  { id: 'person', max: 1, title: 'One living speaker' },
  { id: 'table', max: 10, title: 'About the size of a dinner table' },
  { id: 'bus', max: 60, title: 'About the size of a bus' },
  { id: 'school', max: 500, title: 'About the size of a school' },
  { id: 'village', max: 5000, title: 'About the size of a village' },
  { id: 'stadium', max: 100000, title: 'About the size of a stadium' },
  { id: 'city', max: 1000000, title: 'About the size of a city' },
  { id: 'metropolis', max: Infinity, title: 'About the size of a metropolis' },
];

export const STATUSES = [
  'Vulnerable',
  'Definitely Endangered',
  'Severely Endangered',
  'Critically Endangered',
  'Extinct',
];

// Story order for the guided walk. `label` is the short name in the progress strip.
export const VIEW_ORDER = [
  { id: 'speakers', label: 'Speakers' },
  { id: 'status', label: 'Status' },
  { id: 'family', label: 'Family' },
];
