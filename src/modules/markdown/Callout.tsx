import type { ReactNode } from 'react';
import './Callout.css';

// A block that needs to stand out: a warning, a tip, a gotcha. Markdown's
// blockquote is the usual stand-in and says nothing about severity.
const TYPES = ['info', 'tip', 'warning'] as const;
type CalloutType = (typeof TYPES)[number];

const ICONS: Record<CalloutType, string> = {
  info: 'ℹ️',
  tip: '💡',
  warning: '⚠️',
};

interface CalloutProps {
  type?: string;
  children?: ReactNode;
}

export function Callout({ type, children }: CalloutProps) {
  // An unrecognised type degrades to info rather than failing: the author's
  // words matter more than their choice of box.
  const kind: CalloutType = (TYPES as readonly string[]).includes(type ?? '')
    ? (type as CalloutType)
    : 'info';

  return (
    <aside className={`md-callout md-callout-${kind}`}>
      <span className="md-callout-icon" aria-hidden="true">
        {ICONS[kind]}
      </span>
      <div className="md-callout-body">{children}</div>
    </aside>
  );
}
