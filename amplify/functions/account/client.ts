import { createDataClient } from '../shared/dataClient';

// Its own module so tests can replace the client without touching AWS.
export const client = await createDataClient();
