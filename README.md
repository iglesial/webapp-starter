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
- Core UI primitives in `src/components/core/` (Alert, Badge, Button, Card, Checkbox, FileInput, FormField, Hero, Input, Modal, ProgressBar, Select, Spinner, Switch, Textarea, Toast) with colocated tests — see its README
- `AppShell` layout: responsive navbar (hamburger under 1024px, language toggle, auth-aware links) and footer on every page
- Light and dark themes from design tokens in `src/index.css`, with a test that fails on undefined tokens or low-contrast buttons
- Self-service account deletion from `/profile`: an explicit confirmation, then a Lambda that deletes per-user data and the Cognito user last (extend `ACCOUNT_CLEANUPS` as you add per-user models)
- Cognito post-confirmation trigger posting “new signup” to Discord when `DISCORD_WEBHOOK_URL` is set (silent otherwise; no personal data)
- S3 storage with audience-by-prefix access (`public/*` for everyone, `members/*` for signed-in users, admin-only writes), a client-side resize-to-WebP upload service, and a cached signed-URL hook
- Legal notice (`/legal`) and privacy policy (`/privacy`) templates driven by `src/data/legalEntity.ts`, flagged as "not configured" until you fill it in
- Optional cookieless analytics (Plausible) via `VITE_PLAUSIBLE_DOMAIN`
- Admin home at `/admin` (card grid; nest your admin pages under it), lazy-loaded
- i18n with `react-i18next`: English by default, French included, typed catalogs (a missing translation is a compile error), language saved to the Cognito account, `Intl` price/date formatters. Flip `DEFAULT_LOCALE` in `src/i18n/locale.ts` to change the default.
- `HealthCheck` data model in `amplify/data/resource.ts` as a wiring example — replace with your own models

## Routes

| Path | Access | Purpose |
|------|--------|---------|
| `/` | public | Landing page |
| `/signup`, `/confirm` | public | Sign-up + email verification |
| `/signin` | public | Sign-in |
| `/forgot-password`, `/forgot-password/confirm` | public | Password reset |
| `/legal`, `/privacy` | public | Legal notice, privacy policy |
| `/profile` | authenticated | Display name + sign out |
| `/admin` | admin group | Admin home — nest admin pages under it |

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

## Environment variables

Set these as **branch environment variables** in the Amplify console (they are read by `amplify/backend.ts` at deploy time). All are optional.

| Variable | Effect |
|----------|--------|
| `DISCORD_WEBHOOK_URL` | Posts operator notifications (currently: new sign-ups) to this Discord channel. Unset = silent. |
| `DISCORD_WEBHOOK_URL_SIGNUP` | Sends sign-up notifications to a different channel than the shared one. |
| `VITE_PLAUSIBLE_DOMAIN` | Turns on Plausible analytics for this domain (e.g. `example.com`). Unset = no analytics, and the privacy policy says nothing about it. |

The webhook URL is a credential — anyone holding it can post to the channel. It is never logged; rotate it by deleting the webhook in Discord.

## Next steps after using the template

1. Rename `"webapp-starter"` in `package.json`.
2. Update `<title>` in `index.html`.
3. Edit `amplify/data/resource.ts` — add your data models (keep or replace `HealthCheck`).
4. Fill in `src/data/legalEntity.ts` (publisher, contact email, host region, processors) and review the privacy policy copy in `src/i18n/messages/*/legal.ts` — it is a starting point, not legal advice.
5. Set `common.appName` in `src/i18n/messages/{en,fr}/common.ts`, replace `src/assets/logo.svg`, and adjust the palette in `src/index.css` (the contrast test tells you if a button becomes unreadable).
6. Rewrite `src/pages/HomePage.tsx` for your app's landing content.
7. Rewrite `CLAUDE.md` and this `README.md` for your project.
