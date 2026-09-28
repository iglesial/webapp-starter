import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PresentationShell } from './PresentationShell';

describe('PresentationShell', () => {
  it('renders children', () => {
    const { getByText } = render(<PresentationShell>Deck content</PresentationShell>);
    expect(getByText('Deck content')).toBeInTheDocument();
  });

  it('locks body scroll on mount and restores it on unmount', () => {
    const prevOverflow = document.body.style.overflow;
    const { unmount } = render(<PresentationShell>Content</PresentationShell>);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe(prevOverflow);
  });
});
