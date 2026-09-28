# webapp-starter — Development Guidelines

## Stack

- TypeScript 6, React 19.2 (strict mode), ES2022 via Vite 8.
- `react-router-dom` 7 for routing (wired in `src/main.tsx`).
- `aws-amplify` 6 — `aws-amplify/auth` for sign-up / sign-in / confirm / reset / fetchUserAttributes / updateUserAttributes; `aws-amplify/utils` Hub for auth events.
- `@aws-amplify/backend` Gen 2 — `defineAuth` with `userAttributes.nickname` required + mutable, `admin` group; `defineData` with a trivial `HealthCheck` model as a wiring example.
- `@aws-amplify/ui-react` is installed but intentionally NOT used — forms are hand-rolled on the core primitives in `src/components/core/`.
- `i18next` + `react-i18next` — English by default, French included; typed catalogs (see Internationalization).
- Vitest + @testing-library/react + jsdom for tests; Playwright for e2e.

## Project Structure

```text
amplify/
├── auth/resource.ts        # defineAuth (Cognito User Pool)
├── data/resource.ts        # defineData — HealthCheck example model
└── backend.ts              # defineBackend composition

src/
├── components/
│   ├── core/               # reusable primitives (colocated CSS + tests)
│   ├── auth/               # ProtectedRoute, AdminOnlyRoute guards
│   └── layout/             # LocaleToggle
├── config/                 # app-level constants (AFTER_SIGN_IN_PATH)
├── contexts/               # AuthContext/AuthProvider, LocaleContext/LocaleProvider
├── hooks/                  # useAuth, useLocale
├── i18n/                   # i18next config, locale rules, Intl formatters, typed catalogs
├── pages/                  # HomePage, ProfilePage, auth/*
├── services/               # authService (Amplify wrapper)
├── types/                  # shared TS types (auth)
├── utils/                  # pure helpers (validation)
├── test/                   # Vitest setup + i18n test helpers (tt/rx/rxIn)
├── App.tsx
├── main.tsx
└── index.css               # design tokens in :root
```

Tests are colocated (`<Name>.test.ts(x)`); there is no top-level `tests/` directory.

## Routes

- `/`                         — public landing (HomePage)
- `/signup`, `/confirm`       — sign-up + email confirmation
- `/signin`                   — sign-in
- `/forgot-password`, `/forgot-password/confirm` — password reset flow
- `/profile`                  — ProtectedRoute: display name, language, sign out
- `/admin`                    — AdminOnlyRoute: example admin area

## Commands

- `npm run dev` — Vite dev server
- `npm run test:run` — Vitest single run
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc -b --noEmit`, plus the `amplify/` project
- `npm run test:e2e` — Playwright, against a dev server it starts on port 5199 (`E2E_PORT` to change)
- `npm run synth` — synthesize the Amplify backend locally, with no AWS call
- `npx ampx sandbox` — Amplify Gen 2 sandbox (run in a second terminal when developing)

**Run `npm run synth` after any change under `amplify/`.** A whole class of mistake typechecks, passes every test, and then fails the branch deploy minutes later: circular dependencies between nested stacks, a malformed `schedule` cron, an invalid policy. `synth` catches those in about a minute against nothing. CI runs it too.

### Pinned dependencies — do not bump casually

- `@aws-amplify/backend-cli` is pinned to **1.5.0**: newer versions pull `@aws-amplify/backend-deployer` ≥ 2, whose synth never writes `cdk.out/manifest.json`, so `ampx pipeline-deploy` fails on Amplify Hosting after synth "succeeds" (aws-amplify/amplify-backend#3271). Re-test a real branch deploy before unpinning.
- `@emnapi/core` / `@emnapi/runtime` are direct devDependencies only so npm records them in the lock file; without that, `npm ci` on Amplify's Linux builders fails with "Missing … from lock file".
- `amplify.yml` uses `npm install`, not `npm ci`, for the same lock-drift reason. The strict gates run in `.github/workflows/pr-check.yml`.

## Conventions

- Forms are hand-rolled on `src/components/core/` (Input, FormField, Button, etc.) — do NOT pull in `@aws-amplify/ui-react` form components.
- Tests colocated alongside sources as `*.test.ts(x)`.
- Route guards live in `src/components/auth/` and rely on `useAuth()` for status + admin group membership.

## Internationalization

The app is **English by default, switchable to French**. To make French the default, change `DEFAULT_LOCALE` in `src/i18n/locale.ts` — nothing else depends on it. The active language resolves as: the account's saved `locale` attribute (a standard Cognito attribute, no schema change) → this device's choice → the browser's languages → the default. Switching is optimistic and persisted to both localStorage and the account.

- **Never hardcode user-facing copy in JSX.** Use `const { t } = useTranslation()` and a catalog key. Sentences wrapping markup use `<Trans components={{ b: <strong /> }} />` with named components — never array indices, and never split a sentence into before/link/after keys (that freezes English word order).
- **Catalogs**: `src/i18n/messages/en/` is the structural source of truth, split by surface (`auth.ts`, `profile.ts`, …) and composed in `en/index.ts`; `fr/` mirrors it file for file and is typed against it, so a missing or misspelled key is a **compile error**. Add every new key to both, and a new surface to both `index.ts` files. `catalog.test.ts` also fails on an empty string or a long French entry left identical to English.
- **Never render a raw server or thrown error.** Services return coded errors (`AuthErrorCode`, and your own `*_ERROR_CODES`) that map to catalog keys — see `src/i18n/authErrors.ts`. Map a new code set with `Record<Code, MessageKey>` so adding a code without copy is a compile error. Unexpected errors get `console.error` plus `errors.unknown`.
- **Validation and utils stay language-agnostic** — return a reason code or a catalog key (see `displayNameErrorKey` in `src/utils/validation.ts`), never a sentence.
- **Formatting** goes through `src/i18n/format.ts` (`Intl`): `useLocale()` gives `formatPrice`/`formatDateTime` bound to the active language. Never `toLocaleString()` with no locale, and never hand-format currency.
- **Tests** query copy through `src/test/i18n.ts` (`tt`/`rx`/`rxIn`/`looseText`) so they follow the language. Do not assert `getByText(tt('x'))` as a test's only assertion — both sides read the same catalog, so it is a tautology. Assert literal strings only where the exact wording is the contract (e.g. sign-in errors that must not reveal whether an account exists). `src/test/setup.ts` pins the test language; `playwright.config.ts` pins the browser locale.
- **French register**: vouvoiement ("vous", never "tu").
