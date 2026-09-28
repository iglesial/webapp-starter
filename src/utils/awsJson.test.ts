import { describe, expect, it } from 'vitest';
import { fromAwsJson, toAwsJson } from './awsJson';

// The bug these exist to stop happening again: AWSJSON carries a STRING.
// Writing an object is rejected by AppSync outright; reading one back and
// testing `typeof raw === 'object'` treats every stored value as absent.
// Both halves failed silently in their own way.

describe('writing', () => {
  it('always produces a string, never an object', () => {
    expect(toAwsJson({ fr: 'Un schéma' })).toBe('{"fr":"Un schéma"}');
    expect(typeof toAwsJson({})).toBe('string');
  });

  it('serialises an empty map rather than dropping it', () => {
    expect(toAwsJson({})).toBe('{}');
  });
});

describe('reading', () => {
  // What AppSync actually hands back.
  it('parses the string form', () => {
    expect(fromAwsJson('{"a":3,"b":1}')).toEqual({ a: 3, b: 1 });
  });

  // Rows written before the fix, or a client that ever serialises for us.
  it('accepts a plain object too', () => {
    expect(fromAwsJson({ a: 3 })).toEqual({ a: 3 });
  });

  // These run while a page renders: a malformed
  // blob must cost a statistic or a description, never the page.
  it.each([
    ['malformed JSON', '{not json'],
    ['a JSON array', '[1,2]'],
    ['a bare JSON string', '"hello"'],
    ['a JSON number', '42'],
    ['JSON null', 'null'],
    ['null', null],
    ['undefined', undefined],
    ['an array', [1, 2]],
  ])('reads %s as empty rather than throwing', (_label, raw) => {
    expect(fromAwsJson(raw)).toEqual({});
  });
});

describe('the round trip', () => {
  it('survives write then read', () => {
    const value = { fr: 'Trois services', en: 'Three services' };

    expect(fromAwsJson(toAwsJson(value))).toEqual(value);
  });

  it('survives an empty map', () => {
    expect(fromAwsJson(toAwsJson({}))).toEqual({});
  });
});
