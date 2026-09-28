import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import styles from './ProgressBar.css?raw';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders with default props', () => {
    const { container } = render(<ProgressBar value={50} />);
    expect(container.querySelector('.progress-bar-medium')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('sets correct width style', () => {
    render(<ProgressBar value={75} />);
    expect(screen.getByRole('progressbar')).toHaveStyle({ width: '75%' });
  });

  it('clamps value below 0', () => {
    render(<ProgressBar value={-10} />);
    expect(screen.getByRole('progressbar')).toHaveStyle({ width: '0%' });
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('clamps value above 100', () => {
    render(<ProgressBar value={150} />);
    expect(screen.getByRole('progressbar')).toHaveStyle({ width: '100%' });
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('shows label when showLabel is true', () => {
    render(<ProgressBar value={65} showLabel />);
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('does not show label by default', () => {
    const { container } = render(<ProgressBar value={65} />);
    expect(container.querySelector('.progress-bar-label')).not.toBeInTheDocument();
  });

  it('renders all size variants', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    sizes.forEach((size) => {
      const { container } = render(<ProgressBar value={50} size={size} />);
      expect(container.querySelector(`.progress-bar-${size}`)).toBeInTheDocument();
    });
  });

  it('renders all variant combinations', () => {
    const variants = ['primary', 'success', 'warning', 'danger'] as const;
    variants.forEach((variant) => {
      const { container } = render(<ProgressBar value={50} variant={variant} />);
      expect(container.querySelector(`.progress-bar-${variant}`)).toBeInTheDocument();
    });
  });

  it('has correct accessibility attributes', () => {
    render(<ProgressBar value={42} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '42');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  // Without a name, a page with one bar per track announces "progress bar,
  // 37%" repeatedly with no subject, and tests cannot tell them apart.
  it('names the bar when a label is given', () => {
    render(
      <>
        <ProgressBar value={30} label="Progress: Onboarding" />
        <ProgressBar value={60} label="Progress: Billing" />
      </>,
    );

    expect(screen.getByRole('progressbar', { name: 'Progress: Onboarding' })).toHaveAttribute(
      'aria-valuenow',
      '30',
    );
    expect(screen.getByRole('progressbar', { name: 'Progress: Billing' })).toBeInTheDocument();
  });

  // Absent, not empty: aria-label="" would name the element the empty string.
  it('sets no aria-label at all when no label is given', () => {
    render(<ProgressBar value={42} />);

    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-label');
  });

  it('appends className to the wrapper without replacing its own classes', () => {
    const { container } = render(<ProgressBar value={42} size="small" className="extra" />);
    const wrapper = container.querySelector('.progress-bar');

    expect(wrapper).toHaveClass('progress-bar', 'progress-bar-small', 'extra');
  });
});

// An empty bar used to render as a dot: the fill carried padding-right to
// inset the % label, and with the default content-box that padding still
// occupied 8px at width: 0% — a rounded, coloured, 8px box. jsdom applies no
// stylesheet, so the DOM cannot show this; the stylesheet is asserted instead.
describe('ProgressBar — an empty bar must be empty', () => {
  // Comments are stripped first. Both assertions below are about declarations,
  // and the comments in that file explain the bug by naming the very things
  // being asserted against — so matching raw source would fail on the prose.
  const declarations = styles.replace(/\/\*[\s\S]*?\*\//g, '');
  const ruleFor = (selector: string) =>
    declarations.match(new RegExp(`\\${selector}\\s*\\{[^}]*\\}`))?.[0] ?? '';

  it('puts no padding on the fill, which is what made 0% render as a dot', () => {
    const fillRule = ruleFor('.progress-bar-fill');

    expect(fillRule).not.toBe('');
    expect(fillRule).not.toMatch(/padding/);
  });

  it('gives the groove a colour of its own rather than the page background', () => {
    // --bg-main is white, so on a white card the unfilled part of the bar was
    // invisible and the dot appeared to float.
    const trackRule = ruleFor('.progress-bar');

    expect(trackRule).toMatch(/background:\s*var\(--track\)/);
    expect(trackRule).not.toMatch(/--bg-main/);
  });

  it('marks a started bar so a sliver stays visible, and leaves zero unmarked', () => {
    const { container: empty } = render(<ProgressBar value={0} />);
    expect(empty.querySelector('.progress-bar-fill-started')).not.toBeInTheDocument();

    const { container: barely } = render(<ProgressBar value={1} />);
    expect(barely.querySelector('.progress-bar-fill-started')).toBeInTheDocument();
  });
});
