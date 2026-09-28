import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LazyMarkdown } from './LazyMarkdown';

describe('LazyMarkdown', () => {
  it('shows a spinner, then the rendered Markdown once the parser has loaded', async () => {
    render(<LazyMarkdown>{'Some **bold** text.'}</LazyMarkdown>);

    expect(screen.getByRole('status')).toBeInTheDocument();
    // Generous timeout: the first dynamic import of the parser can take over a
    // second on a loaded CI runner.
    expect(await screen.findByText('bold', {}, { timeout: 10_000 })).toBeInTheDocument();
    expect(screen.getByText('bold').tagName).toBe('STRONG');
    // The test's own limit must exceed the findByText wait above, or a slow
    // first import still fails at vitest's 5 s default.
  }, 15_000);
});
