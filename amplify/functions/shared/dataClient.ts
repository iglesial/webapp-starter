import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import type { Schema } from '../../data/resource';

// A typed data client for a function granted data access (schema-level
// allow.resource(fn) in data/resource.ts). getAmplifyDataClientConfig builds
// the configuration from the function's own environment; process.env is
// passed directly so CI needs no generated $amplify/env module.
//
// Call it from a function-local module (see account/client.ts) rather than
// from the handler, so tests can replace that one module with a fake.
export async function createDataClient() {
  const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
    process.env as unknown as Parameters<typeof getAmplifyDataClientConfig>[0],
  );
  Amplify.configure(resourceConfig, libraryOptions);
  return generateClient<Schema>();
}

export type { Schema };
