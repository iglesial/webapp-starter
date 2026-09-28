import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SafeMarkdown } from './SafeMarkdown';

beforeEach(() => {
  vi.clearAllMocks();
});

// The transform IS the allowlist, so this is the load-bearing test of the
// whole widget model: a directive name we did not map must stay text.
describe('directive allowlist', () => {
  it('renders an unknown directive as plain text, never as a component', () => {
    const { container } = render(<SafeMarkdown>{'::danger{level=9}'}</SafeMarkdown>);

    expect(container.querySelector('md-danger')).toBeNull();
    expect(container.querySelector('danger')).toBeNull();
    // Visible, not swallowed: a typo the author can see and fix.
    expect(container.textContent).toContain('danger');
    expect(container.querySelector('.md-directive-unknown')).toBeInTheDocument();
  });

  it('renders an unknown container directive as text too', () => {
    const { container } = render(<SafeMarkdown>{':::mystery\nInside.\n:::'}</SafeMarkdown>);

    expect(container.querySelector('mystery')).toBeNull();
    expect(container.textContent).toContain('Inside.');
  });

  // Directives must not become a second route to raw markup.
  it('still refuses HTML inside a directive body', () => {
    const { container } = render(
      <SafeMarkdown>{':::callout{type=info}\n<script>window.pwned = true;</script>\n:::'}</SafeMarkdown>,
    );

    expect(container.querySelector('script')).toBeNull();
    expect((window as unknown as { pwned?: boolean }).pwned).toBeUndefined();
  });
});

describe('::video', () => {
  // The privacy contract: nothing reaches Google or Vimeo until the reader
  // asks for the video.
  it('loads no iframe until the reader clicks', async () => {
    const { container } = render(<SafeMarkdown>{'::video{provider=youtube id=abc123}'}</SafeMarkdown>);

    expect(container.querySelector('iframe')).toBeNull();

    await userEvent.click(screen.getByRole('button'));

    const frame = container.querySelector('iframe');
    expect(frame).toBeInTheDocument();
    // nocookie, and built by us from the id — never author-supplied.
    expect(frame?.getAttribute('src')).toContain('youtube-nocookie.com/embed/abc123');
  });

  it('builds a Vimeo embed from the id', async () => {
    const { container } = render(<SafeMarkdown>{'::video{provider=vimeo id=987654}'}</SafeMarkdown>);
    await userEvent.click(screen.getByRole('button'));

    expect(container.querySelector('iframe')?.getAttribute('src')).toContain(
      'player.vimeo.com/video/987654',
    );
  });

  // An author cannot reach an arbitrary embed host by naming one.
  it('refuses an unknown provider', () => {
    const { container } = render(
      <SafeMarkdown>{'::video{provider=evil.example.com id=abc123}'}</SafeMarkdown>,
    );

    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  // The id is interpolated into a URL path, so it must not be able to leave
  // it. Quoted so the value definitely reaches the component — an unquoted
  // one can fail to parse, which would make this pass for the wrong reason.
  it('refuses an id that could escape the URL path', () => {
    const { container } = render(
      <SafeMarkdown>{'::video{provider=youtube id="../../evil"}'}</SafeMarkdown>,
    );

    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('refuses an id carrying a query string', () => {
    render(<SafeMarkdown>{'::video{provider=youtube id="abc?autoplay=1&x=y"}'}</SafeMarkdown>);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe(':::callout', () => {
  it('renders its markdown body inside the box', () => {
    const { container } = render(
      <SafeMarkdown>{':::callout{type=warning}\nNever commit your **key**.\n:::'}</SafeMarkdown>,
    );

    expect(container.querySelector('.md-callout-warning')).toBeInTheDocument();
    expect(container.querySelector('strong')).toHaveTextContent('key');
  });

  // The author's words matter more than their choice of box.
  it('falls back to info for an unrecognised type', () => {
    const { container } = render(<SafeMarkdown>{':::callout{type=nonsense}\nHi.\n:::'}</SafeMarkdown>);

    expect(container.querySelector('.md-callout-info')).toBeInTheDocument();
  });
});
