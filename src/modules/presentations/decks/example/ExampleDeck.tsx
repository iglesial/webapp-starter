import { useEffect, useMemo } from 'react';
import { SlideDeck } from '../../SlideDeck';
import { staggerStyle } from '../../staggerStyle';
import { WordCloud, type WordCloudTerm } from '../../WordCloud';
import './ExampleDeck.css';

// An example deck. Copy this folder to start a new one, then register it in
// ../../registry.ts. Slide text is authored content in the presenter's
// language (like a talk), so it is written here rather than in the catalogs.

function TitleSlide() {
  return (
    <section className="example-slide example-slide-title">
      <p className="example-slide-eyebrow stagger-item" style={staggerStyle(0)}>
        Webapp Starter · Example
      </p>
      <h1 className="stagger-item" style={staggerStyle(1)}>
        Building a deck
      </h1>
      <p className="example-slide-lead stagger-item" style={staggerStyle(2)}>
        Arrow keys, space, Home and End navigate. Each slide is a React component.
      </p>
    </section>
  );
}

const TERMS: WordCloudTerm[] = [
  { text: 'Components', weight: 3 },
  { text: 'Keyboard navigation', weight: 2 },
  { text: 'Staggered entrances', weight: 2 },
  { text: 'Dark mode', weight: 1 },
  { text: 'Lazy-loaded', weight: 2 },
  { text: 'Design tokens', weight: 3 },
  { text: 'Accessible', weight: 1 },
];

// Slides receive `isActive` from SlideDeck: use it to start effects only when
// the slide is on screen (here, auto-revealing the word cloud).
function WordCloudSlide({ isActive }: { isActive?: boolean }) {
  return (
    <section className="example-slide">
      <h1>What a slide can do</h1>
      <WordCloud terms={TERMS} autoRevealOn={isActive} autoRevealDelayMs={800} />
    </section>
  );
}

function ClosingSlide() {
  const steps = [
    'Copy decks/example to decks/<your-slug>',
    'Register it in registry.ts',
    'Open /presentations/<your-slug>',
  ];
  return (
    <section className="example-slide">
      <h1>Your turn</h1>
      <ol className="example-slide-steps">
        {steps.map((step, i) => (
          <li key={step} className="presentation-card stagger-item" style={staggerStyle(i)}>
            {/* A real element, not li::before: .presentation-card already
                uses ::before for its accent bar. */}
            <span className="example-slide-step-number" aria-hidden="true">
              {i + 1}.
            </span>
            {step}
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function ExampleDeck() {
  useEffect(() => {
    const previous = document.title;
    document.title = 'Building a deck — Presentation';
    return () => {
      document.title = previous;
    };
  }, []);

  const slides = useMemo(
    () => [<TitleSlide key="title" />, <WordCloudSlide key="cloud" />, <ClosingSlide key="close" />],
    [],
  );

  return <SlideDeck slides={slides} deckTitle="Building a deck" />;
}
