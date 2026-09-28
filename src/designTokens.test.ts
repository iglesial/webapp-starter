import { describe, expect, it } from 'vitest';

// A custom property that was never defined does not fail loudly. The
// declaration using it becomes invalid at computed-value time and the property
// falls back to its inherited or initial value — so `background: var(--success)`
// simply paints nothing, and the element is invisible.
//
// That is not hypothetical. This test was written after a bug report that the
// progress bar "looks like a dot when empty", and it found two more of the same
// kind in the same pass:
//
//   --success / --warning   ProgressBar.css — a completed track's bar was
//                           invisible, because finishing a track switches the
//                           variant to success
//   --shadow-lg             Modal.css — the dialog had no shadow at all
//
// Every one of those had been shipping silently. Nothing else would catch them:
// jsdom applies no stylesheets, so component tests cannot, and a human only
// notices if they happen to look at the exact state that uses the token.
const cssSources = import.meta.glob('./**/*.css', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const DEFINITION = /(--[\w-]+)\s*:/g;
// A reference with no fallback: `var(--x)` breaks, `var(--x, red)` does not.
const REFERENCE_WITHOUT_FALLBACK = /var\(\s*(--[\w-]+)\s*\)/g;

describe('design tokens', () => {
  const defined = new Set<string>();
  for (const source of Object.values(cssSources)) {
    for (const [, name] of source.matchAll(DEFINITION)) defined.add(name);
  }

  it('finds the stylesheets it is meant to be checking', () => {
    // Without this, a glob that silently matched nothing would make every
    // assertion below pass by vacuity — the failure mode this whole file
    // exists to prevent.
    expect(Object.keys(cssSources).length).toBeGreaterThan(10);
    expect(defined.has('--accent')).toBe(true);
  });

  it('defines every custom property that is used without a fallback', () => {
    const missing: string[] = [];

    for (const [file, source] of Object.entries(cssSources)) {
      for (const [, name] of source.matchAll(REFERENCE_WITHOUT_FALLBACK)) {
        if (!defined.has(name)) missing.push(`${name} in ${file}`);
      }
    }

    expect(missing).toEqual([]);
  });

  // Checked in both directions deliberately. The "used without a fallback"
  // test above collects definitions from the whole file, so a token defined
  // ONLY inside the dark-mode block would satisfy it while light mode — the
  // default for most visitors — rendered nothing. Asserting each side
  // separately is what closes that gap.
  const root = cssSources['./index.css'];
  const darkStart = root?.indexOf('prefers-color-scheme: dark') ?? -1;
  const STATUS_TOKENS = ['--success', '--warning', '--danger', '--track'];

  it('defines every status and surface token for the default light theme', () => {
    expect(darkStart).toBeGreaterThan(0);
    const light = root.slice(0, darkStart);

    for (const token of STATUS_TOKENS) {
      expect(light, `${token} has no light-mode value`).toContain(`${token}:`);
    }
  });

  it('gives the dark theme a value for every status and surface token', () => {
    // These carry meaning through colour, so a token that is correct in light
    // mode and inherited in dark mode is a legibility bug rather than a
    // cosmetic one.
    const dark = root.slice(darkStart);

    for (const token of STATUS_TOKENS) {
      expect(dark, `${token} has no dark-mode value`).toContain(`${token}:`);
    }
  });
});

// Filled controls put text on a coloured fill, and each theme can get that
// pair wrong independently: white on the dark theme's lifted purple was 2.6:1.
// Resolved per theme from index.css, so a palette change that breaks either
// theme fails here rather than in an accessibility audit.
describe('filled-control contrast', () => {
  const root = cssSources['./index.css'];
  const darkStart = root.indexOf('prefers-color-scheme: dark');
  const themes = { light: root.slice(0, darkStart), dark: root.slice(darkStart) };

  function hex(block: string, token: string): string {
    const value = block.match(new RegExp(`${token}:\\s*(#[0-9a-fA-F]{3,6})\\b`))?.[1];
    if (!value) throw new Error(`${token} is not a literal hex colour in this theme`);
    return value.length === 4 ? `#${[...value.slice(1)].map((c) => c + c).join('')}` : value;
  }

  function luminance(color: string): number {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const v = parseInt(color.slice(i, i + 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function contrast(a: string, b: string): number {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  }

  const PAIRS = [
    ['--primary', '--on-primary'],
    ['--primary-hover', '--on-primary'],
    ['--danger', '--on-danger'],
    ['--danger-hover', '--on-danger'],
  ] as const;

  for (const [name, block] of Object.entries(themes)) {
    for (const [fill, text] of PAIRS) {
      it(`${text} on ${fill} clears WCAG AA in the ${name} theme`, () => {
        expect(contrast(hex(block, fill), hex(block, text))).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});
