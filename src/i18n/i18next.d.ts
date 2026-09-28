import type { resources } from './config';

// Makes t() key-safe: keys autocomplete and typos are compile errors.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: (typeof resources)['en'];
  }
}
