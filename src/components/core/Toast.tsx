import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import './Toast.css';

export interface ToastProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'info';
  onDismiss: () => void;
  // Long by toast standards on purpose: a toast often carries a result the
  // reader wants to read twice ("12 created, 58 updated"), and once it is
  // gone that report is lost.
  durationMs?: number;
}

const DEFAULT_DURATION_MS = 10_000;

// Portalled to document.body rather than rendered in place. position: fixed is
// resolved against the nearest ancestor with a transform, filter or
// perspective — the navbar already uses backdrop-filter — so a toast rendered
// inside page content is one refactor away from being pinned inside a card
// instead of the viewport.
export function Toast({
  children,
  variant = 'success',
  onDismiss,
  durationMs = DEFAULT_DURATION_MS,
}: ToastProps) {
  const { t } = useTranslation();
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs, onDismiss]);

  return createPortal(
    <div className={`toast toast-${variant}`} role="status" aria-live="polite">
      <div className="toast-body">{children}</div>
      <button
        type="button"
        className="toast-close"
        onClick={onDismiss}
        // The toast is a report, not a control, so its close button is the only
        // thing here a screen reader needs named.
        aria-label={t('common.dismiss')}
      >
        ×
      </button>
    </div>,
    document.body,
  );
}
