import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './WordCloud.css';

export interface WordCloudTerm {
  text: string;
  weight: 1 | 2 | 3;
}

export interface WordCloudProps {
  terms: WordCloudTerm[];
  triggerIcon?: string;
  triggerLabel?: string;
  triggerPosition?: 'center' | 'top-left';
  /** Reveals automatically (after autoRevealDelayMs) each time this flips from false to true. */
  autoRevealOn?: boolean;
  autoRevealDelayMs?: number;
}

const ROTATIONS = [-6, 4, -2, 8, -8, 2, 6, -4, 0, 5];

function shuffledOrder(count: number): number[] {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export function WordCloud({
  terms,
  triggerIcon,
  triggerLabel,
  triggerPosition = 'center',
  autoRevealOn,
  autoRevealDelayMs = 3000,
}: WordCloudProps) {
  const { t } = useTranslation();
  const revealLabel = triggerLabel ?? t('presentations.reveal');
  const [revealCount, setRevealCount] = useState(0);
  const revealed = revealCount > 0;
  const wasAutoRevealOn = useRef(false);

  useEffect(() => {
    const justBecameActive = autoRevealOn && !wasAutoRevealOn.current;
    wasAutoRevealOn.current = Boolean(autoRevealOn);
    if (!justBecameActive) return;

    const timer = setTimeout(() => setRevealCount((c) => c + 1), autoRevealDelayMs);
    return () => clearTimeout(timer);
  }, [autoRevealOn, autoRevealDelayMs]);

  // revealCount is intentionally a dependency (not used in the body) so every
  // reveal/replay click re-shuffles the animation order.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const revealOrder = useMemo(() => shuffledOrder(terms.length), [revealCount, terms.length]);

  return (
    <div className={`word-cloud word-cloud-trigger-${triggerPosition}`}>
      <button
        type="button"
        className={`word-cloud-trigger${triggerIcon ? ' word-cloud-trigger-icon' : ''}${
          !revealed ? ' word-cloud-trigger-pulse' : ''
        }`}
        onClick={() => setRevealCount((c) => c + 1)}
        aria-label={revealed ? t('presentations.replay') : revealLabel}
      >
        {triggerIcon ? (
          <img src={triggerIcon} alt="" className="word-cloud-trigger-logo" />
        ) : revealed ? (
          t('presentations.replay')
        ) : (
          revealLabel
        )}
      </button>
      <div key={revealCount} className={`word-cloud-terms${revealed ? ' is-revealed' : ''}`}>
        {terms.map((term, i) => (
          <span
            key={term.text}
            className={`word-cloud-term word-cloud-weight-${term.weight}`}
            style={{
              transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)`,
              animationDelay: revealed ? `${revealOrder[i] * 160}ms` : undefined,
            }}
          >
            {term.text}
          </span>
        ))}
      </div>
    </div>
  );
}
