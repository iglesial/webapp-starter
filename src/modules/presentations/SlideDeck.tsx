import { cloneElement, isValidElement, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useSlideNavigation } from './useSlideNavigation';
import { PresentationShell } from './PresentationShell';
import './SlideDeck.css';

export interface SlideDeckProps {
  slides: ReactElement[];
  deckTitle: string;
}

function withActiveProp(slide: ReactElement, isActive: boolean) {
  // Only inject into custom components (function/class), never into raw DOM
  // elements like <p>, which would otherwise log an "unknown prop" warning.
  if (isValidElement(slide) && typeof slide.type === 'function') {
    return cloneElement(slide as ReactElement<{ isActive?: boolean }>, { isActive });
  }
  return slide;
}

export function SlideDeck({ slides, deckTitle }: SlideDeckProps) {
  const { t } = useTranslation();
  const total = slides.length;
  const { index, isFirst, isLast, next, prev, goTo } = useSlideNavigation({ total });

  return (
    <PresentationShell>
      <div
        className="slide-deck"
        role="region"
        aria-roledescription="presentation"
        aria-label={deckTitle}
      >
        <div className="slide-deck-viewport">
          {slides.map((slide, i) => (
            <div
              key={`slide-${i}`}
              className={`slide-deck-slide${i === index ? ' is-active' : ''}`}
              aria-hidden={i !== index}
            >
              {withActiveProp(slide, i === index)}
            </div>
          ))}
        </div>
        <nav className="slide-deck-nav" aria-label={t('presentations.navLabel')}>
          <button
            type="button"
            className="slide-deck-arrow"
            onClick={prev}
            disabled={isFirst}
            aria-label={t('presentations.previous')}
          >
            ‹
          </button>
          <div className="slide-deck-dots">
            {slides.map((_, i) => (
              <button
                key={`dot-${i}`}
                type="button"
                className={`slide-deck-dot${i === index ? ' is-active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={t('presentations.goTo', { number: i + 1 })}
                aria-current={i === index ? 'true' : undefined}
              />
            ))}
          </div>
          <button
            type="button"
            className="slide-deck-arrow"
            onClick={next}
            disabled={isLast}
            aria-label={t('presentations.next')}
          >
            ›
          </button>
          <span className="slide-deck-counter">
            {index + 1} / {total}
          </span>
        </nav>
      </div>
    </PresentationShell>
  );
}
