import type { ComponentType } from 'react';

// Every deck, listed on /presentations and served at /presentations/:slug.
// `load` is a dynamic import, so each deck — slides, images, CSS — is its own
// chunk, downloaded only by someone who opens it.
export interface PresentationEntry {
  slug: string;
  /** Shown on the index. Authored in the deck's own language, like its slides. */
  title: string;
  subtitle: string;
  load: () => Promise<{ default: ComponentType }>;
}

export const PRESENTATIONS: PresentationEntry[] = [
  {
    slug: 'example',
    title: 'Example deck',
    subtitle: 'How a deck is put together: a title, a word cloud and a closing slide.',
    load: () => import('./decks/example/ExampleDeck'),
  },
];

export function findPresentation(slug: string): PresentationEntry | undefined {
  return PRESENTATIONS.find((entry) => entry.slug === slug);
}
