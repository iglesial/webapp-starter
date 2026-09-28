# webapp-starter — Development Guidelines

## Stack

- TypeScript 5.9, React 19.2 (strict mode), ES2022 via Vite 8.
- `react-router-dom` 7 for routing (wired in `src/main.tsx`).
- `aws-amplify` 6 — `aws-amplify/auth` for sign-up / sign-in / confirm / reset / fetchUserAttributes / updateUserAttributes; `aws-amplify/utils` Hub for auth events.
- `@aws-amplify/backend` Gen 2 — `defineAuth` with `userAttributes.nickname` required + mutable, `admin` group; `defineData` with a trivial `HealthCheck` model as a wiring example.
- `@aws-amplify/ui-react` is installed but intentionally NOT used — forms are hand-rolled on the core primitives in `src/components/core/`.
- Vitest + @testing-library/react + jsdom for tests.

## Project Structure

```text
amplify/
├── auth/resource.ts        # defineAuth (Cognito User Pool)
├── data/resource.ts        # defineData — HealthCheck example model
└── backend.ts              # defineBackend composition

src/
├── components/
│   ├── core/               # reusable primitives (colocated CSS + tests)
│   └── auth/               # ProtectedRoute, AdminOnlyRoute guards
├── contexts/               # AuthContext + AuthProvider
├── hooks/                  # useAuth
├── pages/                  # HomePage, ProfilePage, auth/*
├── services/               # authService (Amplify wrapper)
├── types/                  # shared TS types (auth)
├── utils/                  # pure helpers (validation)
├── test/                   # Vitest setup
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
- `/profile`                  — ProtectedRoute: display name + sign out
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
