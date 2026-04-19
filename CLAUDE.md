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
- `npm run typecheck` — `tsc -b --noEmit`
- `npx ampx sandbox` — Amplify Gen 2 sandbox (run in a second terminal when developing)

## Conventions

- Forms are hand-rolled on `src/components/core/` (Input, FormField, Button, etc.) — do NOT pull in `@aws-amplify/ui-react` form components.
- Tests colocated alongside sources as `*.test.ts(x)`.
- Route guards live in `src/components/auth/` and rely on `useAuth()` for status + admin group membership.
