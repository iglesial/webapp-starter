import { describe, expect, it } from 'vitest';
import { displayNameErrorMessage, validateDisplayName } from './validation';

describe('validateDisplayName', () => {
  it('rejects empty input as empty', () => {
    expect(validateDisplayName('')).toEqual({ valid: false, reason: 'empty' });
  });

  it('rejects whitespace-only input as empty after trim', () => {
    expect(validateDisplayName('   ')).toEqual({ valid: false, reason: 'empty' });
    expect(validateDisplayName('\t\n')).toEqual({ valid: false, reason: 'empty' });
  });

  it('rejects a 1-character name as too-short', () => {
    expect(validateDisplayName('a')).toEqual({ valid: false, reason: 'too-short' });
  });

  it('rejects a 2-character name as too-short', () => {
    expect(validateDisplayName('ab')).toEqual({ valid: false, reason: 'too-short' });
  });

  it('accepts a 3-character name', () => {
    expect(validateDisplayName('abc')).toEqual({ valid: true, value: 'abc' });
  });

  it('accepts a 15-character name', () => {
    expect(validateDisplayName('fifteen-chars-1')).toEqual({
      valid: true,
      value: 'fifteen-chars-1',
    });
  });

  it('accepts a 30-character name', () => {
    const name = 'a'.repeat(30);
    expect(validateDisplayName(name)).toEqual({ valid: true, value: name });
  });

  it('rejects a 31-character name as too-long', () => {
    expect(validateDisplayName('a'.repeat(31))).toEqual({ valid: false, reason: 'too-long' });
  });

  it('trims leading/trailing whitespace before validating', () => {
    expect(validateDisplayName('  alice  ')).toEqual({ valid: true, value: 'alice' });
  });

  it('counts characters after trim for boundary checks', () => {
    expect(validateDisplayName('  ab  ')).toEqual({ valid: false, reason: 'too-short' });
  });

  it('accepts non-ASCII characters inside the length window', () => {
    expect(validateDisplayName('しろ')).toEqual({ valid: false, reason: 'too-short' });
    expect(validateDisplayName('アリス123')).toEqual({ valid: true, value: 'アリス123' });
  });
});

describe('displayNameErrorMessage', () => {
  it('returns distinct messages per reason', () => {
    const empty = displayNameErrorMessage('empty');
    const short = displayNameErrorMessage('too-short');
    const long = displayNameErrorMessage('too-long');
    expect(new Set([empty, short, long]).size).toBe(3);
    expect(short).toMatch(/at least 3/);
    expect(long).toMatch(/at most 30/);
  });
});
