import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';

// One shared, typed client for every data service.
export const dataClient = generateClient<Schema>();
export type { Schema };
