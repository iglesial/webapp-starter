import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import type { PaymentsSchema } from './schema';

// Typed against the module's own schema slice, so the Lambdas compile whether
// or not the module is switched on in the app schema. Its own module so tests
// can replace it without touching AWS.
const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
  process.env as unknown as Parameters<typeof getAmplifyDataClientConfig>[0],
);
Amplify.configure(resourceConfig, libraryOptions);

export const client = generateClient<PaymentsSchema>();
