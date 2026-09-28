// Presentations module (src/modules/presentations): the deck CHROME only.
// Slide text is authored content in the presenter's language, not UI copy —
// see the module README. Delete this file and its index.ts entries if you
// remove the module.
export const presentations = {
  indexTitle: 'Presentations',
  navLabel: 'Slide navigation',
  previous: 'Previous slide',
  next: 'Next slide',
  goTo: 'Go to slide {{number}}',
  reveal: 'Click to reveal',
  replay: 'Replay the animation',
  notFound: 'This presentation does not exist.',
  backToIndex: 'All presentations',
} as const;
