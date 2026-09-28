import { describe, expect, it } from 'vitest';
import { fr } from './fr';
import { en } from './en';

// The catalogs are split by surface into ./en/*.ts and ./fr/*.ts; each
// index composes its modules. These checks run against the composed
// objects, so they cover every module.

type Node = Record<string, unknown>;

function flatten(node: Node, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') out[path] = value;
    else Object.assign(out, flatten(value as Node, path));
  }
  return out;
}

const flatFr = flatten(fr as unknown as Node);
const flatEn = flatten(en as unknown as Node);

describe('message catalogs', () => {
  // Types already enforce this at build time; the runtime check catches
  // anyone who reaches for a cast.
  it('define exactly the same keys', () => {
    expect(Object.keys(flatEn).sort()).toEqual(Object.keys(flatFr).sort());
  });

  it('have no empty strings', () => {
    for (const [key, value] of [...Object.entries(flatFr), ...Object.entries(flatEn)]) {
      expect(value.trim(), `empty message for "${key}"`).not.toBe('');
    }
  });

  // Words that really are spelled the same in both languages. Listing them
  // explicitly keeps the check below able to catch a genuinely forgotten
  // translation.
  const IDENTICAL_BY_DESIGN = new Set<string>([
    'common.appName', // product name — never translated
    'common.copyright', // "© {{appName}}" — nothing to translate
  ]);

  it('are actually translated (no French entry left identical to English)', () => {
    const untranslated = Object.keys(flatFr).filter(
      // Short labels and proper nouns can legitimately match.
      (key) =>
        flatFr[key] === flatEn[key] && flatFr[key].length > 12 && !IDENTICAL_BY_DESIGN.has(key),
    );
    expect(untranslated).toEqual([]);
  });
});
