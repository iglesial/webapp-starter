/// <reference types="vite/client" />

// Build-time environment variables (Amplify branch env vars prefixed VITE_ are
// inlined into the bundle — never put a secret in one).
interface ImportMetaEnv {
  /** Plausible site domain, e.g. "example.com". Unset = analytics off. */
  readonly VITE_PLAUSIBLE_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
