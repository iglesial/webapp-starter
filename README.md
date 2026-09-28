# webapp-starter

A React + Vite + Amplify Gen 2 + Cognito starter template. Routing, auth context, route guards, hand-rolled auth pages (sign-up / sign-in / confirm / password reset), and a small library of core UI primitives are already wired. Click **Use this template** on GitHub to spin up a new app.

## Quickstart

```bash
npm install
npx ampx sandbox     # in a second terminal — deploys auth + data to your AWS account
npm run dev          # http://localhost:5173
```

The sandbox writes `amplify_outputs.json` into the repo root; `src/main.tsx` reads it at startup to configure Amplify. The file is gitignored.

## What's included

- `react-router-dom` v7 wired in `src/main.tsx`
- `AuthContext` / `useAuth` / `authService` around `aws-amplify/auth` (Hub-driven)
- `ProtectedRoute` and `AdminOnlyRoute` guards
- Hand-rolled auth pages in `src/pages/auth/` — no `@aws-amplify/ui-react` form components
- Core UI primitives in `src/components/core/` (Alert, Badge, Button, Card, FormField, Hero, Input, Modal, ProgressBar, Select, Spinner, Textarea) with colocated tests
- i18n with `react-i18next`: English by default, French included, typed catalogs (a missing translation is a compile error), language saved to the Cognito account, `Intl` price/date formatters. Flip `DEFAULT_LOCALE` in `src/i18n/locale.ts` to change the default.
- `HealthCheck` data model in `amplify/data/resource.ts` as a wiring example — replace with your own models

## Routes

| Path | Access | Purpose |
|------|--------|---------|
| `/` | public | Landing page |
| `/signup`, `/confirm` | public | Sign-up + email verification |
| `/signin` | public | Sign-in |
| `/forgot-password`, `/forgot-password/confirm` | public | Password reset |
| `/profile` | authenticated | Display name + sign out |
| `/admin` | admin group | Example admin area |

## Scripts

```bash
npm run dev          # Vite dev server
npm run build        # tsc -b && vite build
npm run test:run     # Vitest (single run)
npm run lint         # ESLint
npm run typecheck    # tsc -b --noEmit (app + amplify/)
npm run test:e2e     # Playwright (starts its own dev server on :5199)
npm run synth        # synthesize the Amplify backend locally — run after any amplify/ change
```

CI (`.github/workflows/pr-check.yml`) runs typecheck, lint, unit tests and synth on every PR. `amplify.yml` is the Amplify Hosting build spec (Node 22, backend `pipeline-deploy`, then the frontend build).

## Next steps after using the template

1. Rename `"webapp-starter"` in `package.json`.
2. Update `<title>` in `index.html`.
3. Edit `amplify/data/resource.ts` — add your data models (keep or replace `HealthCheck`).
4. Rewrite `src/pages/HomePage.tsx` for your app's landing content.
5. Rewrite `CLAUDE.md` and this `README.md` for your project.
