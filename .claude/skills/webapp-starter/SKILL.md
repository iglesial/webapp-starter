---
name: webapp-starter
description: How to work in a project created from the webapp-starter template (React 19 + Vite + Amplify Gen 2 + Cognito, typed i18n EN/FR, optional modules). Use it for the first-run setup of a new project from the template, and before any change that spans layers, such as adding a page or route, a data model, a Lambda or mutation, per-user data, an upload, an admin section or translated copy; switching on payments; making a slide deck; or removing a module. It holds the multi-file checklists (account deletion, privacy policy, both catalogs, synth) that are easy to get half right. Use it even when the request doesn't name the template, whenever the repo has amplify/backend.ts, src/modules/ and src/i18n/messages/{en,fr}.
---

# Working in a webapp-starter project

This project began as the **webapp-starter** template: a production-shaped React + Amplify Gen 2 app with auth, typed i18n, an app shell, account deletion, storage, legal pages and optional modules already wired.

`CLAUDE.md` holds the **rules** (i18n, backend, storage, legal, design tokens). This skill holds the **procedures**: the order of steps and every file a change has to touch. Most mistakes in this codebase don't break the build. They leave something half-done: a model with no account-deletion cleanup, a feature missing from the privacy policy, a French key forgotten, a backend change never synthesized. The checklists below exist to prevent that.

## Orient yourself first

Read `CLAUDE.md` if it isn't in context. Then look at the parts you'll touch:

| You're changing… | Look at first |
|---|---|
| a page or route | `src/App.tsx` (layout route, lazy pages), `src/pages/ProfilePage.tsx` (a typical page) |
| data | `amplify/data/resource.ts`, `src/services/data/` |
| a Lambda | `amplify/functions/account/` (the reference function), `amplify/functions/shared/` |
| copy | `src/i18n/messages/en/index.ts` (the surfaces), then the matching file in `fr/` |
| an optional module | its `README.md` in `src/modules/<name>/` |

Reuse what exists before writing anything new:
- **UI primitives** (`src/components/core/`, documented in its README): Button, Input, FormField, Select, Textarea, Checkbox, Switch, FileInput, Modal, Alert, Toast, Card, Badge, Spinner, ProgressBar, Hero.
- **Lambda helpers** (`amplify/functions/shared/`): `identityOf`, `throwOnErrors`, `collectAll`, `notifyDiscord`.
- **Formatters**: `useLocale()` for prices and dates, `useStorageUrl()` for stored images.

## First run in a new project

When the project has just been created from the template, walk the user through this. Ask for the values you don't know, rather than inventing a company name or an address.

1. **Identity.** Rename `"name"` in `package.json`, set `<title>` in `index.html`, and set `common.appName` in `src/i18n/messages/{en,fr}/common.ts`. Replace `src/assets/logo.svg`.
2. **Language.** English is the default and French is included. For a French-first product, set `DEFAULT_LOCALE = 'fr'` in `src/i18n/locale.ts`; the test suite passes either way.
3. **Look.** Adjust the palette in `src/index.css`, in both the light and dark blocks. Run `npm run test:run`: `designTokens.test.ts` fails if a button's text drops below 4.5:1 contrast in either theme.
4. **Landing page.** Rewrite `src/pages/HomePage.tsx` and the `home` catalog.
5. **Legal.** Fill in `src/data/legalEntity.ts`. Until it's filled, `/legal` and `/privacy` show a "not configured" banner, deliberately. Review the privacy copy in `src/i18n/messages/*/legal.ts` against what the app will actually do. It's a starting point, not legal advice; tell the user so.
6. **Modules.** Decide what stays. Each module in `src/modules/` has a README with removal steps.
   - `markdown` and `presentations` are on by default and harmless if unused.
   - `payments` ships switched **off**.
   - Delete the example deck (`src/modules/presentations/decks/example`) once real decks exist.
7. **Backend.** Replace or keep the `HealthCheck` example model. Then `npx ampx sandbox` (in a second terminal) and `npm run dev`.
8. **Docs.** Rewrite the README for the product, and trim the CLAUDE.md sections for modules you removed.

## Definition of done: every change

Run these before calling anything finished. CI runs the same gates, so skipping one locally just moves the failure to the PR.

```bash
npm run typecheck && npm run lint && npm run test:run
npm run synth            # after ANY change under amplify/ — and with PAYMENTS_ENABLED=true if payments is on
npm run test:e2e         # when routes, navigation or the shell changed
```

Then check the things no gate catches:

- **Both languages.** Every new key is in `en/` *and* `fr/`; the types enforce this. The French must be real French, using "vous", not the English pasted in. Switch the UI to the other language, or temporarily flip `DEFAULT_LOCALE` and rerun the tests.
- **Per-user data**, if the change stores any, takes three follow-ups (recipe 3):
  - an `ACCOUNT_CLEANUPS` entry;
  - a privacy-policy row;
  - a `legal.*` key.
- **Look at it.** For anything visual, render it in light and dark mode, and at mobile width. Several real bugs in this template were found only by looking: an unreadable button, a sentence ending in "write to .", badly placed list numbers.
- **Tests that test something.** Query copy through `tt`/`rx` from `src/test/i18n.ts`. `getByText(tt('x'))` on its own asserts nothing, because both sides read the same catalog. When you write a guard test, break the code on purpose once and watch the test fail.

## Recipes

`references/recipes.md` has step-by-step checklists. Read the one that matches the task before starting, because each lists files that are easy to miss:

1. Add a page (public, signed-in, or admin)
2. Add translated copy or a new catalog surface
3. Add a data model that stores per-user data
4. Add a Lambda-backed mutation
5. Add an image upload
6. Add an admin section
7. Add a coded error family
8. Switch on payments or add a product
9. Add a slide deck
10. Remove an optional module
11. Add a core UI component

## Traps this codebase has already hit

These are real bugs from building the template. Each one passed a first look.

- **Synth passing a broken backend.** CDK reports a circular dependency as a *warning* by default. The `synth` script adds a flag that turns it into an error, so don't remove it. A Cognito trigger must use `resourceGroupName: 'auth'`.
- **The data client doesn't throw.** A failed write returns `{ errors }`. Without `throwOnErrors()`, a Lambda reports success on a write that never happened.
- **Owner fields.** A model the webhook or a Lambda writes with the bare `sub` needs `.identityClaim('sub')` on its owner rule. Otherwise users can't read their own rows.
- **Owner reassignment.** An owner rule alone lets an owner *update* the owner field to someone else's sub. Give the owner field its own rule without `update` (recipe 3).
- **User-supplied URLs.** `a.url()` accepts `javascript:`. Rendered as `href`, that is XSS. Allow only `http:` and `https:`, when saving *and* when rendering.
- **Identity from arguments.** Any `userId` argument on a mutation lets one user act on another. Take the identity from the token with `identityOf(event)`.
- **Personal data reaching Discord.** Notification text must never identify a user. `purchaseMessage` drops anything shaped like a UUID, because a Cognito sub can start with a letter and pass a slug check.
- **Bundle growth.** `aws-amplify/data` is heavy. Pages that use a data service are lazy-loaded (`/profile`, `/admin`, checkout). Keep new ones lazy too, and judge size by what the home page actually loads, not by the `index-*.js` number alone.
- **`lazy()` during render**, even inside `useMemo`, remounts the component. The hooks lint rule flags it. Create lazy components at module level.
- **`<Button>` inside `<Link>`** is invalid HTML. Put `btn btn-primary btn-medium` classes on the `<Link>` instead.
- **Hardcoded colours.** `white` text on a themed fill fails contrast in one theme or the other. Use the `--on-*` tokens.
- **Ported CSS referencing tokens that don't exist here.** `var(--navy)` from another project paints nothing. `designTokens.test.ts` catches it, so fix it rather than add a fallback.
- **Flaky async tests.** When a test awaits a lazy import, raise *both* the `findBy…` timeout and the test's own timeout, which is 5 s by default.
