import i18n from '../i18n/config';
import type { ParseKeys } from 'i18next';

type Key = ParseKeys<'translation'>;
type Vars = Record<string, unknown>;

// Look UI copy up through the catalog so tests follow the rendered language
// instead of hardcoding one. A renamed key becomes a TS error here rather
// than a mysterious query failure.
//
// Use these to IDENTIFY elements (then assert an href, a disabled state, a
// click effect, a count). Do NOT write
//   expect(screen.getByText(tt('x'))).toBeInTheDocument()
// as a test's only assertion: both sides read the same catalog, so it passes
// even when the key resolves to an empty string. Where the exact wording is
// the contract (account-enumeration messages, generic error copy), assert the
// literal string instead.
export function tt(key: Key, vars?: Vars): string {
  return String(i18n.t(key, vars as never));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Anchored, case-insensitive matcher for accessible names — avoids matching
// a longer label that merely contains this one.
export function rx(key: Key, vars?: Vars): RegExp {
  return new RegExp(`^${escapeRegExp(tt(key, vars))}$`, 'i');
}

// Unanchored variant, for text nodes split across elements or surrounded by
// interpolated content.
export function rxIn(key: Key, vars?: Vars): RegExp {
  return new RegExp(escapeRegExp(tt(key, vars)), 'i');
}

// Matcher for text containing Intl output (prices, dates). French formatting
// inserts a narrow no-break space (U+202F) or NBSP depending on the ICU
// version bundled with Node, so an exact string comparison passes locally
// and fails in CI. Match any run of whitespace instead of the literal
// codepoint.
export function looseText(value: string): RegExp {
  return new RegExp(escapeRegExp(value).replace(/\s+/g, '\\s+'));
}
