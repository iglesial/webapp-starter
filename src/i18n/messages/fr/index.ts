// French catalog. Typed against the English shape via Translations<T>, so a
// missing key is a compile error and an extra key is an excess-property error.
// Register: vouvoiement ("vous", never "tu").
import { common } from './common';
import { adminGate } from './adminGate';
import { nav } from './nav';
import { home } from './home';
import { auth } from './auth';
import { errors } from './errors';
import { validation } from './validation';
import { profile } from './profile';
import { account } from './account';
import { legal } from './legal';
// Optional module — see src/modules/markdown/README.md.
import { markdown } from './markdown';
import type { en } from '../en';

type Translations<T> = { [K in keyof T]: T[K] extends string ? string : Translations<T[K]> };

export const fr: Translations<typeof en> = {
  common,
  adminGate,
  nav,
  home,
  auth,
  errors,
  validation,
  profile,
  account,
  legal,
  markdown,
};
