import { describe, expect, it, vi } from 'vitest';
import type { AppSyncResolverEvent } from 'aws-lambda';
import { collectAll, fieldNameOf, identityOf, throwOnErrors } from './appsync';

const event = (identity: unknown, fieldName = 'doThing') =>
  ({ identity, info: { fieldName } }) as unknown as AppSyncResolverEvent<unknown>;

describe('identityOf', () => {
  it('returns the Cognito identity from the token', () => {
    expect(identityOf(event({ sub: 's1', username: 'u1' }))).toMatchObject({ sub: 's1' });
  });

  it.each([null, undefined, {}, { sub: 's1' }, { username: 'u1' }])(
    'refuses a call without a full identity (%j)',
    (identity) => {
      expect(() => identityOf(event(identity))).toThrow('Unauthenticated');
    },
  );
});

describe('fieldNameOf', () => {
  it('reads info.fieldName, falling back to a top-level fieldName', () => {
    expect(fieldNameOf(event({}, 'deleteMyAccount'))).toBe('deleteMyAccount');
    expect(fieldNameOf({ fieldName: 'x' } as never)).toBe('x');
  });
});

describe('throwOnErrors', () => {
  it('passes through when there are no errors', () => {
    expect(() => throwOnErrors(undefined, 'ctx')).not.toThrow();
    expect(() => throwOnErrors([], 'ctx')).not.toThrow();
  });

  it('throws with the context and every message', () => {
    expect(() => throwOnErrors([{ message: 'a' }, { message: 'b' }], 'delete row')).toThrow(
      'delete row: a, b',
    );
  });
});

describe('collectAll', () => {
  it('follows nextToken until the last page', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ data: [1, 2], nextToken: 't1' })
      .mockResolvedValueOnce({ data: [3], nextToken: null });

    await expect(collectAll(fetchPage, 'list')).resolves.toEqual([1, 2, 3]);
    expect(fetchPage).toHaveBeenNthCalledWith(2, 't1');
  });

  it('fails on a page with errors instead of returning a partial list', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ data: [1], nextToken: 't1' })
      .mockResolvedValueOnce({ data: [], errors: [{ message: 'denied' }] });

    await expect(collectAll(fetchPage, 'list rows')).rejects.toThrow('list rows: denied');
  });
});
