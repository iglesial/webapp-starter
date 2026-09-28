// Vite's ?raw import rather than node:fs — the app tsconfig has no Node
// types, and widening it for one test is not worth it.
import markdownSource from './SafeMarkdown.tsx?raw';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SafeMarkdown } from './SafeMarkdown';

describe('Markdown rendering', () => {
  it('renders headings, emphasis and code', () => {
    const { container } = render(
      <SafeMarkdown>{'# Title\n\nSome **bold** text.\n\n```js\nconst x = 1;\n```'}</SafeMarkdown>,
    );

    expect(container.querySelector('h1')).toHaveTextContent('Title');
    expect(container.querySelector('strong')).toHaveTextContent('bold');
    expect(container.querySelector('pre code')).toHaveTextContent('const x = 1;');
  });

  // Justifies the remark-gfm dependency: delete this and the plugin should go
  // with it.
  it('renders GFM tables', () => {
    const { container } = render(
      <SafeMarkdown>{'| a | b |\n| --- | --- |\n| 1 | 2 |'}</SafeMarkdown>,
    );

    expect(container.querySelector('table')).toBeInTheDocument();
    expect(container.querySelectorAll('td')).toHaveLength(2);
  });
});

// These are the security contract, not stylistic preferences. They must keep
// passing whoever writes the content: a compromised admin account, or users
// once you let them write Markdown.
describe('Markdown does not execute embedded HTML', () => {
  it('renders a script tag as text, never as an element', () => {
    const { container } = render(
      <SafeMarkdown>{'Before\n\n<script>window.pwned = true;</script>\n\nAfter'}</SafeMarkdown>,
    );

    expect(container.querySelector('script')).toBeNull();
    expect((window as unknown as { pwned?: boolean }).pwned).toBeUndefined();
  });

  it('drops raw HTML image handlers', () => {
    const { container } = render(<SafeMarkdown>{'<img src=x onerror="window.pwned = true">'}</SafeMarkdown>);

    const img = container.querySelector('img');
    expect(img?.getAttribute('onerror') ?? null).toBeNull();
    expect((window as unknown as { pwned?: boolean }).pwned).toBeUndefined();
  });

  // react-markdown's default urlTransform strips dangerous schemes; this test
  // is what stops someone "fixing" a stripped link by overriding it.
  it('strips a javascript: link target', () => {
    render(<SafeMarkdown>{'[click me](javascript:window.pwned=true)'}</SafeMarkdown>);

    const link = screen.getByText('click me').closest('a');
    expect(link?.getAttribute('href')).toBeFalsy();
  });

  it('opens external links safely and leaves internal ones alone', () => {
    render(<SafeMarkdown>{'[out](https://example.com) and [in](/profile)'}</SafeMarkdown>);

    const external = screen.getByText('out').closest('a');
    expect(external).toHaveAttribute('target', '_blank');
    expect(external?.getAttribute('rel')).toContain('noopener');

    const internal = screen.getByText('in').closest('a');
    expect(internal).not.toHaveAttribute('target');
  });

  // Blunt, but it is the invariant that actually matters: the moment this
  // component gains dangerouslySetInnerHTML or rehype-raw, every test above
  // becomes meaningless.
  it('contains no dangerouslySetInnerHTML and no rehype-raw', () => {
    // Comments are stripped first: the component names all three of these in
    // the warning block that exists to stop anyone adding them.
    const code = markdownSource
      .split('\n')
      .filter((line: string) => !line.trim().startsWith('//'))
      .join('\n');

    expect(code).not.toContain('dangerouslySetInnerHTML');
    expect(code).not.toContain('rehype-raw');
    expect(code).not.toContain('urlTransform');
  });
});
