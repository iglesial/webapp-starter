// English catalog — the structural source of truth: the matching module in
// ../fr/ is typed against this shape, so a missing or misspelled key there is
// a compile error.
//
// Split by surface: edit the module for the page you are changing, and add a
// new surface to BOTH index.ts files.
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

export const en = {
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
} as const;
