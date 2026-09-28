import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
// Initializes i18next for every test file, so components using
// useTranslation() render without a provider wrapper.
import i18n from '../i18n/config';
import { DEFAULT_LOCALE } from '../i18n/locale';

// Pin the language: config resolves from navigator.languages, which jsdom
// reports as en-US, so without this the suite would silently keep testing
// English no matter what the app's default is.
await i18n.changeLanguage(DEFAULT_LOCALE);

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

afterEach(() => {
  cleanup();
});
