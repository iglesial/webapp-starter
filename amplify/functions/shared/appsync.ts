import type { AppSyncIdentityCognito, AppSyncResolverEvent } from 'aws-lambda';

// Small helpers every AppSync-backed function ends up needing. Kept here so
// each handler does not grow its own slightly different copy.

// The caller's identity comes from the token and NOTHING else. Never accept a
// user id as a mutation argument: one supplied by the client lets any
// signed-in user act on any other.
export function identityOf(event: AppSyncResolverEvent<unknown>): AppSyncIdentityCognito {
  const identity = event.identity as AppSyncIdentityCognito | null | undefined;
  if (!identity || !('sub' in identity) || !identity.sub || !identity.username) {
    throw new Error('Unauthenticated');
  }
  return identity;
}

// The field being resolved. Present as info.fieldName on real events; the
// fallback covers hand-built test events.
export function fieldNameOf(event: AppSyncResolverEvent<unknown>): string | undefined {
  return event.info?.fieldName ?? (event as unknown as { fieldName?: string }).fieldName;
}

// The data client reports failures in `errors` rather than throwing, so an
// unchecked call silently "succeeds". Call this after every write.
export function throwOnErrors(
  errors: { message: string }[] | undefined | null,
  context: string,
): void {
  if (errors && errors.length > 0) {
    throw new Error(`${context}: ${errors.map((e) => e.message).join(', ')}`);
  }
}

export type Page<T> = {
  data: T[];
  errors?: { message: string }[] | null;
  nextToken?: string | null;
};

// Follows nextToken to the end. A list call returns ONE page (100 rows by
// default), so anything that must see every row — a deletion cascade above
// all — has to page, or it quietly processes only the first hundred.
export async function collectAll<T>(
  fetchPage: (nextToken: string | null | undefined) => Promise<Page<T>>,
  context: string,
): Promise<T[]> {
  const rows: T[] = [];
  let nextToken: string | null | undefined;
  do {
    const page = await fetchPage(nextToken);
    throwOnErrors(page.errors, context);
    rows.push(...page.data);
    nextToken = page.nextToken;
  } while (nextToken);
  return rows;
}
